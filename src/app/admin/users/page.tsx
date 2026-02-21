import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export default async function AdminUsers() {
  await requireAdmin();
  const users = await prisma.user.findMany({ include: { roles: true } });
  return <div className="bg-white p-4 rounded">{users.map((u) => <div key={u.id}>{u.email}</div>)}</div>;
}
