import { getAuthenticatedProfile } from '@/lib/auth';
import { AppError, toErrorResponse } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getComplaint, getComplaintLocation, requireUuid, saveComplaintAiAnalysis } from '@/services/complaints';
import { analyzeComplaint } from '@/services/ai-analysis';

type RouteContext = { params: Promise<{ complaintId: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const profile = await getAuthenticatedProfile();
    if (!['STUDENT', 'ADMIN', 'MAINTENANCE'].includes(profile.role)) {
      throw new AppError('Account role is not recognized.', 403, 'INVALID_ROLE');
    }
    const { complaintId } = await params;
    requireUuid(complaintId, 'complaintId');
    const supabase = await createSupabaseServerClient();

    // The caller's RLS scope determines whether this complaint is visible.
    const complaint = await getComplaint(supabase, complaintId);
    const location = await getComplaintLocation(supabase, complaint.room_id);
    const result = await analyzeComplaint({
      title: complaint.title,
      description: complaint.description,
      location,
    });

    let persisted = false;
    if (profile.role === 'ADMIN') {
      try {
      await saveComplaintAiAnalysis(supabase, complaint.id, result.analysis);
      persisted = true;
      } catch (error) {
        console.error('Unable to save complaint AI recommendation:', error instanceof Error ? error.name : 'unknown error');
      }
    }

    return Response.json({
      ai_status: result.ai_status,
      analysis: result.analysis,
      analysis_persisted: persisted,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}