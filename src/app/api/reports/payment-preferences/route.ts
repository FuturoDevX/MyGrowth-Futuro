import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function GET() {
  await requireSession();
  const invites = await prisma.trainingInvite.findMany({ where: { paymentPreference: { not: null } }, include: { participant: true, trainingEvent: true } });
  const csv = ['event,participant,payment_preference,note'];
  invites.forEach((i) => csv.push(`${i.trainingEvent.title},${i.participant.name},${i.paymentPreference},${i.paymentNote ?? ''}`));
  return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv' } });
}
