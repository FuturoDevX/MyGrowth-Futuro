import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseJson } from '@/lib/http';
import { requireSession } from '@/lib/rbac';

const schema = z.object({ participantIds: z.array(z.string()), excludeIds: z.array(z.string()).default([]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await requireSession();
  const data = await parseJson(req, schema);
  const ids = data.participantIds.filter((id) => !data.excludeIds.includes(id));
  await prisma.$transaction(ids.map((participantId) => prisma.trainingInvite.upsert({
    where: { trainingEventId_participantId: { trainingEventId: params.id, participantId } },
    create: { trainingEventId: params.id, participantId, inviteSentAt: new Date() },
    update: {}
  })));
  return NextResponse.json({ ok: true, invited: ids.length });
}
