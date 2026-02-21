import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError, parseJson } from '@/lib/http';
import { requireSession } from '@/lib/rbac';

const schema = z.object({ learned: z.string().min(5), applyPlan: z.string().min(5), nqsPracticeLink: z.string().optional() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });
    const reflection = await prisma.reflection.findUnique({ where: { id: params.id } });
    if (!participant || !reflection || reflection.participantId !== participant.id) throw new ApiError(403, 'Forbidden');

    const data = await parseJson(req, schema);
    return NextResponse.json(await prisma.reflection.update({ where: { id: params.id }, data: { ...data, status: 'COMPLETED', submittedAt: new Date() } }));
  } catch (error) {
    return handleApiError(error);
  }
}
