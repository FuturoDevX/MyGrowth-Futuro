import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export default async function TrainingTypesAdmin() {
  await requireAdmin();
  const types = await prisma.trainingType.findMany();
  return <div className="bg-white p-4 rounded">{types.map((t) => <div key={t.id}>{t.name}</div>)}</div>;
}
