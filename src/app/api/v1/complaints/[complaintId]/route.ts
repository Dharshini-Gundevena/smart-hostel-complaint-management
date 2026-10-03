import { getAuthenticatedProfile } from '@/lib/auth';
import { AppError, toErrorResponse } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getComplaintDetails, requireUuid } from '@/services/complaints';

type RouteContext = { params: Promise<{ complaintId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const profile = await getAuthenticatedProfile();
    if (!['STUDENT', 'ADMIN', 'MAINTENANCE'].includes(profile.role)) {
      throw new AppError('Account role is not recognized.', 403, 'INVALID_ROLE');
    }
    const { complaintId } = await params;
    requireUuid(complaintId, 'complaintId');
    const supabase = await createSupabaseServerClient();
    const details = await getComplaintDetails(supabase, complaintId);
    return Response.json(details);
  } catch (error) {
    return toErrorResponse(error);
  }
}