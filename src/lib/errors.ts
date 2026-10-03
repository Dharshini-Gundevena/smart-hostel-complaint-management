import type { NextRequest } from 'next/server';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code = 'INTERNAL_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toErrorResponse(error: unknown): Response {
  const appError = error instanceof AppError ? error : null;
  const statusCode = appError?.statusCode ?? 500;
  const code = appError?.code ?? 'INTERNAL_ERROR';
  const message = appError?.message ?? 'An unexpected error occurred.';

  if (!appError) {
    console.error(error);
  }

  return Response.json({ error: { code, message } }, { status: statusCode });
}

export function withErrorHandling(
  handler: (request: NextRequest) => Promise<Response>,
): (request: NextRequest) => Promise<Response> {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}