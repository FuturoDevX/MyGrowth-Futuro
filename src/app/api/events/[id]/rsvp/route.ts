import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError, parseJson } from '@/lib/http';
import { requireSession } from '@/lib/rbac';

const schema = z.object({
  status: z.enum(['GOING', 'NOT_GOING', 'MAYBE', 'WAITLIST']),
  paymentPreference: z.enum(['TIME_IN_LIEU', 'OVERTIME_PAID', 'INCLUDED_IN_SALARY', 'OTHER']).optional(),
  paymentNote: z.string().max(2000).optional()
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });
    if (!participant) throw new ApiError(400, 'No participant profile.');

    const data = await parseJson(req, schema);
    return NextResponse.json(
      await prisma.trainingInvite.update({
        where: { trainingEventId_participantId: { trainingEventId: params.id, participantId: participant.id } },
        data: { rsvpStatus: data.status, paymentPreference: data.paymentPreference, paymentNote: data.paymentNote }
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}
