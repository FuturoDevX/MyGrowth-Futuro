import { NextResponse } from 'next/server';
import { subMonths } from 'date-fns';
import { requireSession } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  await requireSession();
  const { searchParams } = new URL(req.url);
  const lastMonths = Number(searchParams.get('lastMonths') ?? 12);
  const rows = await prisma.completion.findMany({
    where: { completionDate: { gte: subMonths(new Date(), lastMonths) } },
    include: { participant: true, trainingEvent: { include: { trainingType: true, centre: true } } }
  });
  const csv = ['participant,email,centre,training_type,completion_date'];
  rows.forEach((r) => csv.push(`${r.participant.name},${r.participant.email},${r.trainingEvent.centre?.name ?? ''},${r.trainingEvent.trainingType.name},${r.completionDate.toISOString().slice(0,10)}`));
  return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv' } });
}
