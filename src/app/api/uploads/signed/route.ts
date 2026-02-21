import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJson, handleApiError } from '@/lib/http';
import { requireSession } from '@/lib/rbac';
import { signedUpload } from '@/lib/storage';

const schema = z.object({ fileName: z.string().min(1), contentType: z.string().min(1) });

export async function POST(req: Request) {
  try {
    await requireSession();
    const data = await parseJson(req, schema);
    const key = `${Date.now()}-${data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    return NextResponse.json({ key, ...(await signedUpload(key, data.contentType)) });
  } catch (error) {
    return handleApiError(error);
  }
}
