import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, 'Invalid JSON payload.');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, 'Validation failed.', parsed.error.flatten());
  }
  return parsed.data;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
  }

  if (error instanceof Error && (error.message === 'UNAUTHENTICATED' || error.message === 'FORBIDDEN')) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'FORBIDDEN' ? 403 : 401 });
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
