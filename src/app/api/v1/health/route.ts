import type { NextRequest } from 'next/server';
import { withErrorHandling } from '@/lib/errors';

export const GET = withErrorHandling(async (_request: NextRequest) => {
  return Response.json({ status: 'ok' });
});