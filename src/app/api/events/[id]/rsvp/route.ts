import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseJson } from '@/lib/http';
import { requireSession } from '@/lib/rbac';

const schema = z.object({
  status: z.enum(['GOING', 'NOT_GOING', 'MAYBE', 'WAITLIST']),
  paymentPreference: z.enum(['TIME_IN_LIEU', 'OVERTIME_PAID', 'INCLUDED_IN_SALARY', 'OTHER']).optional(),
  paymentNote: z.string().optional()
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });
  if (!participant) return NextResponse.json({ error: 'No participant profile' }, { status: 400 });
  const data = await parseJson(req, schema);
  return NextResponse.json(await prisma.trainingInvite.update({
    where: { trainingEventId_participantId: { trainingEventId: params.id, participantId: participant.id } },
    data: { rsvpStatus: data.status, paymentPreference: data.paymentPreference, paymentNote: data.paymentNote }
  }));
}
