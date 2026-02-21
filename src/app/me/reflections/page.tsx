import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/rbac';

export default async function MyReflections() {
  const session = await requireSession();
  const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });
  const rows = participant ? await prisma.reflection.findMany({ where: { participantId: participant.id } }) : [];
  return <div className="bg-white p-4 rounded">{rows.map((r) => <Link key={r.id} href={`/reflections/${r.id}`} className="block">Reflection {r.id}</Link>)}</div>;
}
