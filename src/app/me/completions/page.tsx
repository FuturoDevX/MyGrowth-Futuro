import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/rbac';

export default async function MyCompletions() {
  const session = await requireSession();
  const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });
  const rows = participant ? await prisma.completion.findMany({ where: { participantId: participant.id }, include: { trainingEvent: true } }) : [];
  return <div className="bg-white p-4 rounded">{rows.map((r) => <div key={r.id}>{r.trainingEvent.title}</div>)}</div>;
}
