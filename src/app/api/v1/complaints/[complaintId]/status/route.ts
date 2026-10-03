import { getAuthenticatedProfile } from '@/lib/auth';
import { AppError, toErrorResponse } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { transitionComplaint, requireUuid } from '@/services/complaints';
import type { ComplaintStatus } from '@/types/entities';

type RouteContext = { params: Promise<{ complaintId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const profile = await getAuthenticatedProfile();
    if (profile.role !== 'ADMIN' && profile.role !== 'MAINTENANCE') {
      throw new AppError('Only admins and assigned maintenance users can update complaint status.', 403, 'FORBIDDEN');
    }
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
    if (typeof values.status !== 'string') throw new AppError('status is required.', 400, 'MISSING_FIELDS');
    if (values.comment !== undefined && typeof values.comment !== 'string') {
      throw new AppError('comment must be a string.', 400, 'INVALID_FIELD');
    }
    const supabase = await createSupabaseServerClient();
    const complaint = await transitionComplaint(
      supabase,
      complaintId,
      values.status as ComplaintStatus,
      values.comment as string | undefined,
    );
    return Response.json({ complaint });
  } catch (error) {
    return toErrorResponse(error);
  }
}