import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJson } from '@/lib/http';
import { requireSession } from '@/lib/rbac';
import { signedUpload } from '@/lib/storage';

const schema = z.object({ fileName: z.string(), contentType: z.string() });

export async function POST(req: Request) {
  await requireSession();
  const data = await parseJson(req, schema);
  const key = `${Date.now()}-${data.fileName}`;
  return NextResponse.json({ key, ...(await signedUpload(key, data.contentType)) });
}
