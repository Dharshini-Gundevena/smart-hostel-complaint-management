import { getAuthenticatedProfile } from '@/lib/auth';
import { AppError, toErrorResponse } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUuid } from '@/services/complaints';

export async function GET(request: Request) {
  try {
    const profile = await getAuthenticatedProfile();
    if (!['STUDENT', 'ADMIN', 'MAINTENANCE'].includes(profile.role)) {
      throw new AppError('Account role is not recognized.', 403, 'INVALID_ROLE');
    }
    const params = new URL(request.url).searchParams;
    const limit = Number(params.get('limit') ?? 25);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new AppError('limit must be an integer from 1 to 100.', 400, 'INVALID_FILTER');
    }
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new AppError('Unable to load notifications.', 500, 'DATABASE_ERROR');
    return Response.json({ notifications: data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await getAuthenticatedProfile();
    if (!['STUDENT', 'ADMIN', 'MAINTENANCE'].includes(profile.role)) {
      throw new AppError('Account role is not recognized.', 403, 'INVALID_ROLE');
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
    const notificationId = (body as Record<string, unknown>).notificationId;
    if (typeof notificationId !== 'string') throw new AppError('notificationId is required.', 400, 'MISSING_FIELDS');
    requireUuid(notificationId, 'notificationId');
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select('*')
      .maybeSingle();
    if (error) throw new AppError('Unable to update notification.', 500, 'DATABASE_ERROR');
    if (!data) throw new AppError('Notification was not found.', 404, 'NOTIFICATION_NOT_FOUND');
    return Response.json({ notification: data });
  } catch (error) {
    return toErrorResponse(error);
  }
}