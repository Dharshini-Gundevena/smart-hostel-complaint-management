import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/lib/errors';
import type { Database, Json } from '@/types/database';
import { complaintPriorities, complaintStatuses, type ComplaintPriority, type ComplaintStatus, type UserRole } from '@/types/entities';

type Client = SupabaseClient<Database>;
type ComplaintRow = Database['public']['Tables']['complaints']['Row'];
type AssignmentRow = Database['public']['Tables']['complaint_assignments']['Row'];
type UpdateRow = Database['public']['Tables']['complaint_updates']['Row'];
const complaintWithLocationSelect =
  '*, room:rooms!complaints_room_id_fkey(id, room_number, floor, block:blocks!rooms_block_id_fkey(id, name, hostel:hostels!blocks_hostel_id_fkey(id, name, location)))';

export type ComplaintInput = {
  title: string;
  description: string;
  roomId: string;
  subcategory?: string | null;
  priority?: ComplaintPriority;
  severity?: number;
};

export type ComplaintFilters = {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: string;
  studentId?: string;
  assignedTo?: string;
  roomId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requireUuid(value: string, field = 'id'): string {
  if (!uuidPattern.test(value)) throw new AppError(`${field} must be a valid UUID.`, 400, 'INVALID_ID');
  return value;
}

export function parseComplaintInput(value: unknown): ComplaintInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError('Request body must be a JSON object.', 400, 'INVALID_BODY');
  }
  const body = value as Record<string, unknown>;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const roomId = typeof body.roomId === 'string' ? body.roomId.trim() : '';
  if (!title || !description || !roomId) {
    throw new AppError('Title, description, and roomId are required.', 400, 'MISSING_FIELDS');
  }
  if (title.length > 180 || description.length > 10000) {
    throw new AppError('One or more complaint fields exceed the allowed length.', 400, 'FIELD_TOO_LONG');
  }
  requireUuid(roomId, 'roomId');

  const priority = body.priority === undefined ? 'MEDIUM' : body.priority;
  if (priority !== 'MEDIUM') {
    throw new AppError('New complaints use the default MEDIUM priority.', 400, 'INVALID_PRIORITY');
  }
  const severity = body.severity === undefined ? 1 : body.severity;
  if (severity !== 1) {
    throw new AppError('New complaints use the default severity.', 400, 'INVALID_SEVERITY');
  }

  return {
    title,
    description,
    roomId,
    subcategory: typeof body.subcategory === 'string' && body.subcategory.trim() ? body.subcategory.trim() : null,
    priority: 'MEDIUM',
    severity: 1,
  };
}

function assertStatus(value: unknown): asserts value is ComplaintStatus {
  if (typeof value !== 'string' || !complaintStatuses.includes(value as ComplaintStatus)) {
    throw new AppError('Status is not supported by the database workflow.', 400, 'INVALID_STATUS');
  }
}

function assertPriority(value: unknown): asserts value is ComplaintPriority {
  if (typeof value !== 'string' || !complaintPriorities.includes(value as ComplaintPriority)) {
    throw new AppError('Priority is not supported by the database.', 400, 'INVALID_PRIORITY');
  }
}

function mapDatabaseError(error: { code?: string; message: string }) {
  if (error.code === 'P0002' || error.code === 'PGRST116') {
    return new AppError('Complaint was not found.', 404, 'COMPLAINT_NOT_FOUND');
  }
  if (error.code === '42501') return new AppError('You are not allowed to perform this action.', 403, 'FORBIDDEN');
  if (error.code === '22023') return new AppError(error.message, 409, 'INVALID_WORKFLOW_ACTION');
  if (error.code === '23503') return new AppError('The selected room, user, or complaint does not exist.', 400, 'INVALID_REFERENCE');
  if (error.code === '23514') return new AppError('The selected value is not valid for this operation.', 400, 'CONSTRAINT_VIOLATION');
  console.error('Complaint database error:', error.code ?? 'unknown', error.message);
  return new AppError('A database error prevented this complaint operation.', 500, 'DATABASE_ERROR');
}

export async function createComplaint(
  supabase: Client,
  studentId: string,
  input: ComplaintInput,
): Promise<ComplaintRow> {
  requireUuid(studentId, 'studentId');
  const { data, error } = await supabase
    .from('complaints')
    .insert({
      student_id: studentId,
      room_id: input.roomId,
      title: input.title,
      description: input.description,
      category: 'OTHER',
      subcategory: input.subcategory ?? null,
      priority: 'MEDIUM',
      severity: 1,
      status: 'PENDING',
    })
    .select(complaintWithLocationSelect)
    .single();
  if (error) throw mapDatabaseError(error);
  return data;
}

export async function listComplaints(supabase: Client, role: UserRole, filters: ComplaintFilters) {
  if (filters.status) assertStatus(filters.status);
  if (filters.priority) assertPriority(filters.priority);
  for (const [key, value] of Object.entries({ studentId: filters.studentId, assignedTo: filters.assignedTo, roomId: filters.roomId })) {
    if (value) requireUuid(value, key);
  }
  if (role !== 'ADMIN' && (filters.studentId || filters.assignedTo)) {
    throw new AppError('Only administrators can filter by student or assignee.', 403, 'FORBIDDEN');
  }
  const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);
  const offset = Math.max(filters.offset ?? 0, 0);

  let query = supabase.from('complaints').select(complaintWithLocationSelect, { count: 'exact' });
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.category) query = query.ilike('category', filters.category);
  if (filters.studentId) query = query.eq('student_id', filters.studentId);
  if (filters.roomId) query = query.eq('room_id', filters.roomId);
  if (filters.from) query = query.gte('created_at', filters.from);
  if (filters.to) query = query.lte('created_at', filters.to);
  if (filters.assignedTo) {
    const { data: assignments, error } = await supabase
      .from('complaint_assignments')
      .select('complaint_id')
      .eq('assigned_to', filters.assignedTo)
      .is('unassigned_at', null);
    if (error) throw mapDatabaseError(error);
    const ids = assignments.map((assignment) => assignment.complaint_id);
    if (ids.length === 0) return { complaints: [], count: 0 };
    query = query.in('id', ids);
  }
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw mapDatabaseError(error);
  return { complaints: data, count: count ?? 0 };
}

export async function getComplaint(supabase: Client, complaintId: string): Promise<ComplaintRow> {
  requireUuid(complaintId, 'complaintId');
  const { data, error } = await supabase
    .from('complaints')
    .select(complaintWithLocationSelect)
    .eq('id', complaintId)
    .maybeSingle();
  if (error) throw mapDatabaseError(error);
  if (!data) throw new AppError('Complaint was not found.', 404, 'COMPLAINT_NOT_FOUND');
  return data;
}

export async function getComplaintLocation(supabase: Client, roomId: string): Promise<string | null> {
  requireUuid(roomId, 'roomId');
  const { data, error } = await supabase
    .from('rooms')
    .select('room_number, block:blocks!rooms_block_id_fkey(name, hostel:hostels!blocks_hostel_id_fkey(name))')
    .eq('id', roomId)
    .maybeSingle();
  if (error || !data) return null;
  return [data.block?.hostel?.name, data.block?.name, `Room ${data.room_number}`].filter(Boolean).join(', ');
}

export async function getComplaintDetails(supabase: Client, complaintId: string) {
  const complaint = await getComplaint(supabase, complaintId);
  const { data: assignments, error } = await supabase
    .from('complaint_assignments')
    .select('*')
    .eq('complaint_id', complaintId)
    .order('assigned_at', { ascending: false });
  if (error) throw mapDatabaseError(error);
  return { complaint, assignments };
}

export async function getComplaintHistory(supabase: Client, complaintId: string): Promise<UpdateRow[]> {
  requireUuid(complaintId, 'complaintId');
  await getComplaint(supabase, complaintId);
  const { data, error } = await supabase
    .from('complaint_updates')
    .select('*')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });
  if (error) throw mapDatabaseError(error);
  return data;
}

export async function transitionComplaint(
  supabase: Client,
  complaintId: string,
  status: ComplaintStatus,
  comment?: string,
): Promise<ComplaintRow> {
  requireUuid(complaintId, 'complaintId');
  assertStatus(status);
  if (comment && comment.length > 2000) throw new AppError('Comment is too long.', 400, 'FIELD_TOO_LONG');
  const { data, error } = await supabase.rpc('transition_complaint', {
    target_complaint_id: complaintId,
    target_status: status,
    update_comment: comment?.trim() || null,
  });
  if (error) throw mapDatabaseError(error);
  return data;
}

export async function assignComplaint(
  supabase: Client,
  complaintId: string,
  maintenanceId: string,
  comment?: string,
): Promise<AssignmentRow> {
  requireUuid(complaintId, 'complaintId');
  requireUuid(maintenanceId, 'maintenanceId');
  if (comment && comment.length > 2000) throw new AppError('Comment is too long.', 400, 'FIELD_TOO_LONG');
  const { data, error } = await supabase.rpc('admin_assign_complaint', {
    target_complaint_id: complaintId,
    target_maintenance_id: maintenanceId,
    assignment_comment: comment?.trim() || null,
  });
  if (error) throw mapDatabaseError(error);
  return data;
}

export async function updateComplaintPriority(
  supabase: Client,
  complaintId: string,
  priority: ComplaintPriority,
  comment?: string,
): Promise<ComplaintRow> {
  requireUuid(complaintId, 'complaintId');
  assertPriority(priority);
  if (comment && comment.length > 2000) throw new AppError('Comment is too long.', 400, 'FIELD_TOO_LONG');
  const { data, error } = await supabase.rpc('admin_update_complaint_priority', {
    target_complaint_id: complaintId,
    target_priority: priority,
    update_comment: comment?.trim() || null,
  });
  if (error) throw mapDatabaseError(error);
  return data;
}

export async function saveComplaintAiAnalysis(
  supabase: Client,
  complaintId: string,
  analysis: import('@/lib/ai-contract').ComplaintAnalysis | null,
): Promise<ComplaintRow> {
  requireUuid(complaintId, 'complaintId');
  const analysisPayload: Json | null = analysis ? {
    category: analysis.category,
    priority: analysis.priority,
    summary: analysis.summary,
    department: analysis.department,
    suggested_action: analysis.suggested_action,
    reason: analysis.reason,
  } : null;
  const { data, error } = await supabase.rpc('store_complaint_ai_recommendation', {
    target_complaint_id: complaintId,
    analysis: analysisPayload,
  });
  if (error) throw mapDatabaseError(error);
  return data;
}

export type { ComplaintRow, AssignmentRow, UpdateRow };