import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/rbac';

export default async function MePage() {
  const session = await requireSession();
  const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });
  return <pre className="bg-white p-4 rounded">{JSON.stringify(participant, null, 2)}</pre>;
}
