import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseJson } from '@/lib/http';

const schema = z.object({ token: z.string(), participantId: z.string(), completionId: z.string(), fileKey: z.string().optional(), externalUrl: z.string().optional() });

export async function POST(req: Request) {
  const data = await parseJson(req, schema);
  const event = await prisma.trainingEvent.findFirst({ where: { trainerUploadToken: data.token } });
  if (!event) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  return NextResponse.json(await prisma.certificate.upsert({
    where: { completionId: data.completionId },
    create: { completionId: data.completionId, participantId: data.participantId, fileKey: data.fileKey, externalUrl: data.externalUrl, uploadedBy: 'trainer-token' },
    update: { fileKey: data.fileKey, externalUrl: data.externalUrl }
  }));
}
