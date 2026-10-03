import { getAuthenticatedProfile } from '@/lib/auth';
import { AppError, toErrorResponse } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { assignComplaint, requireUuid } from '@/services/complaints';

type RouteContext = { params: Promise<{ complaintId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const profile = await getAuthenticatedProfile();
    if (profile.role !== 'ADMIN') throw new AppError('Only administrators can assign complaints.', 403, 'FORBIDDEN');
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
    if (typeof values.maintenanceId !== 'string') throw new AppError('maintenanceId is required.', 400, 'MISSING_FIELDS');
    if (values.comment !== undefined && typeof values.comment !== 'string') {
      throw new AppError('comment must be a string.', 400, 'INVALID_FIELD');
    }
    const supabase = await createSupabaseServerClient();
    const assignment = await assignComplaint(
      supabase,
      complaintId,
      values.maintenanceId,
      values.comment as string | undefined,
    );
    return Response.json({ assignment }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}