import { NextResponse } from 'next/server';
import { addDays } from 'date-fns';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError, parseJson } from '@/lib/http';
import { requireManagerOrAdminForEvent } from '@/lib/rbac';

const schema = z.object({ updates: z.array(z.object({ participantId: z.string(), status: z.enum(['ATTENDED', 'NO_SHOW', 'CANCELLED', 'LATE']) })) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireManagerOrAdminForEvent(params.id);
    const data = await parseJson(req, schema);
    const event = await prisma.trainingEvent.findUnique({ where: { id: params.id }, include: { trainingType: true } });
    if (!event) throw new ApiError(404, 'Event not found.');

    await prisma.$transaction(async (tx) => {
      for (const update of data.updates) {
        await tx.attendance.upsert({
          where: { trainingEventId_participantId: { trainingEventId: params.id, participantId: update.participantId } },
          create: { trainingEventId: params.id, participantId: update.participantId, status: update.status, markedBy: session.user.id },
          update: { status: update.status, markedBy: session.user.id }
        });

        if (update.status === 'ATTENDED') {
          await tx.completion.upsert({
            where: { trainingEventId_participantId: { trainingEventId: params.id, participantId: update.participantId } },
            create: { trainingEventId: params.id, participantId: update.participantId, completionDate: new Date(), verified: true, verifiedBy: session.user.id },
            update: { completionDate: new Date() }
          });

          if (event.trainingType.requiresReflection) {
            await tx.reflection.upsert({
              where: { participantId_trainingEventId: { participantId: update.participantId, trainingEventId: params.id } },
              create: { participantId: update.participantId, trainingEventId: params.id, status: 'SENT', dueDate: addDays(event.eventDate, 7) },
              update: {}
            });
          }
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
