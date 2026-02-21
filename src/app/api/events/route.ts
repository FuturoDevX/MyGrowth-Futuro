import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError, parseJson } from '@/lib/http';
import { requireSession } from '@/lib/rbac';

const schema = z.object({
  title: z.string().min(3),
  eventDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  facilitator: z.string(),
  trainingTypeId: z.string(),
  deliveryMode: z.enum(['IN_PERSON', 'ONLINE'])
});

export async function GET() {
  try {
    const session = await requireSession();
    const isAdmin = session.user.globalRole === 'ADMIN';
    const centreIds = (session.user.centreRoles ?? []).map((r) => r.centreId);

    const rows = await prisma.trainingEvent.findMany({
      where: isAdmin
        ? undefined
        : { OR: [{ centreId: { in: centreIds } }, { invites: { some: { participant: { userId: session.user.id } } } }] },
      orderBy: { eventDate: 'desc' }
    });

    return NextResponse.json(rows);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const canManage = session.user.globalRole === 'ADMIN' || (session.user.centreRoles ?? []).some((r) => ['CM', 'EL'].includes(r.role));
    if (!canManage) throw new ApiError(403, 'Only Admin/CM/EL can create events.');

    const data = await parseJson(req, schema);
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) throw new ApiError(404, 'User not found.');

    const event = await prisma.trainingEvent.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        organisationId: user.organisationId,
        roleRequired: [],
        createdBy: session.user.id
      }
    });
    return NextResponse.json(event);
  } catch (error) {
    return handleApiError(error);
  }
}
