import { CentreRole } from '@prisma/client';
import { auth } from './auth';

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHENTICATED');
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.globalRole !== 'ADMIN') throw new Error('FORBIDDEN');
  return session;
}

export function hasCentreRole(
  centreRoles: { centreId: string; role: CentreRole }[],
  centreId: string,
  roles: CentreRole[]
) {
  return centreRoles.some((r) => r.centreId === centreId && roles.includes(r.role));
}
