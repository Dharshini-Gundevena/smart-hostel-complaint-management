import { getAuthenticatedProfile } from '@/lib/auth';
import { AppError, toErrorResponse } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createComplaint, getComplaintLocation, listComplaints, parseComplaintInput } from '@/services/complaints';
import { isUserRole } from '@/lib/authorization';
import type { ComplaintFilters } from '@/services/complaints';
import { analyzeComplaint } from '@/services/ai-analysis';

function parseFilters(searchParams: URLSearchParams): ComplaintFilters {
  const limitValue = searchParams.get('limit');
  const offsetValue = searchParams.get('offset');
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const limit = limitValue ? Number(limitValue) : undefined;
  const offset = offsetValue ? Number(offsetValue) : undefined;
  if (from && Number.isNaN(Date.parse(from))) throw new AppError('from must be a valid date.', 400, 'INVALID_FILTER');
  if (to && Number.isNaN(Date.parse(to))) throw new AppError('to must be a valid date.', 400, 'INVALID_FILTER');
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    throw new AppError('limit must be a positive integer.', 400, 'INVALID_FILTER');
  }
  if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) {
    throw new AppError('offset must be a non-negative integer.', 400, 'INVALID_FILTER');
  }
  return {
    status: searchParams.get('status') as ComplaintFilters['status'],
    priority: searchParams.get('priority') as ComplaintFilters['priority'],
    category: searchParams.get('category') ?? undefined,
    studentId: searchParams.get('studentId') ?? undefined,
    assignedTo: searchParams.get('assignedTo') ?? undefined,
    roomId: searchParams.get('roomId') ?? undefined,
    from,
    to,
    limit,
    offset,
  };
}

export async function GET(request: Request) {
  try {
    const profile = await getAuthenticatedProfile();
    if (!isUserRole(profile.role)) throw new AppError('Account role is not recognized.', 403, 'INVALID_ROLE');
    const supabase = await createSupabaseServerClient();
    const result = await listComplaints(supabase, profile.role, parseFilters(new URL(request.url).searchParams));
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getAuthenticatedProfile();
    if (profile.role !== 'STUDENT') throw new AppError('Only students can create complaints.', 403, 'FORBIDDEN');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError('Request body must contain valid JSON.', 400, 'INVALID_JSON');
    }
    const input = parseComplaintInput(body);
    const supabase = await createSupabaseServerClient();
    const complaint = await createComplaint(supabase, profile.id, input);
    const location = await getComplaintLocation(supabase, input.roomId);
    const ai = await analyzeComplaint({
      title: complaint.title,
      description: complaint.description,
      location,
    });
    return Response.json({ complaint, ai_status: ai.ai_status, analysis: ai.analysis, analysis_persisted: false }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}