import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError, parseJson } from '@/lib/http';

const schema = z.object({ token: z.string(), participantId: z.string(), completionId: z.string(), fileKey: z.string().optional(), externalUrl: z.string().url().optional() });

export async function POST(req: Request) {
  try {
    const data = await parseJson(req, schema);
    const event = await prisma.trainingEvent.findFirst({ where: { trainerUploadToken: data.token }, select: { id: true } });
    if (!event) throw new ApiError(403, 'Invalid token');

    const completion = await prisma.completion.findUnique({
      where: { id: data.completionId },
      select: { trainingEventId: true, participantId: true }
    });
    if (!completion || completion.trainingEventId !== event.id) {
      throw new ApiError(403, 'Completion does not belong to this event.');
    }
    if (completion.participantId !== data.participantId) {
      throw new ApiError(400, 'Participant does not match completion.');
    }

    return NextResponse.json(
      await prisma.certificate.upsert({
        where: { completionId: data.completionId },
        create: { completionId: data.completionId, participantId: data.participantId, fileKey: data.fileKey, externalUrl: data.externalUrl, uploadedBy: 'trainer-token' },
        update: { fileKey: data.fileKey, externalUrl: data.externalUrl }
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}
