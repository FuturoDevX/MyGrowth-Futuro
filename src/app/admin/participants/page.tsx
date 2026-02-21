import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export default async function AdminParticipants() {
  await requireAdmin();
  const participants = await prisma.participant.findMany();
  return <div className="bg-white p-4 rounded">{participants.map((p) => <div key={p.id}>{p.name} ({p.participantType})</div>)}</div>;
}
