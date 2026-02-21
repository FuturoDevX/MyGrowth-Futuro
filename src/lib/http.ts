import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export async function parseJson<T>(req: Request, schema: ZodSchema<T>) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  return parsed.data;
}
