import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseJson } from '@/lib/http';
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
  await requireSession();
  return NextResponse.json(await prisma.trainingEvent.findMany());
}

export async function POST(req: Request) {
  const session = await requireSession();
  const data = await parseJson(req, schema);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const event = await prisma.trainingEvent.create({
    data: {
      ...data,
      eventDate: new Date(data.eventDate),
      organisationId: user!.organisationId,
      roleRequired: []
    }
  });
  return NextResponse.json(event);
}
