import { getAuthenticatedProfile } from '@/lib/auth';
import { AppError, toErrorResponse } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { updateComplaintPriority, requireUuid } from '@/services/complaints';
import type { ComplaintPriority } from '@/types/entities';

type RouteContext = { params: Promise<{ complaintId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const profile = await getAuthenticatedProfile();
    if (profile.role !== 'ADMIN') throw new AppError('Only administrators can change complaint priority.', 403, 'FORBIDDEN');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError('Request body must contain valid JSON.', 400, 'INVALID_JSON');
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new AppError('Request body must be a JSON object.', 400, 'INVALID_BODY');
    }
    const { complaintId } = await params;
    requireUuid(complaintId, 'complaintId');
    const values = body as Record<string, unknown>;
    if (typeof values.priority !== 'string') throw new AppError('priority is required.', 400, 'MISSING_FIELDS');
    if (values.comment !== undefined && typeof values.comment !== 'string') {
      throw new AppError('comment must be a string.', 400, 'INVALID_FIELD');
    }
    const supabase = await createSupabaseServerClient();
    const complaint = await updateComplaintPriority(
      supabase,
      complaintId,
      values.priority as ComplaintPriority,
      values.comment as string | undefined,
    );
    return Response.json({ complaint });
  } catch (error) {
    return toErrorResponse(error);
  }
}