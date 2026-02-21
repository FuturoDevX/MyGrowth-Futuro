import { CentreRole } from '@prisma/client';
import { auth } from './auth';
import { prisma } from './prisma';

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

export async function requireManagerOrAdminForEvent(eventId: string) {
  const session = await requireSession();
  if (session.user.globalRole === 'ADMIN') return session;

  const event = await prisma.trainingEvent.findUnique({ where: { id: eventId }, select: { centreId: true } });
  if (!event?.centreId) throw new Error('FORBIDDEN');

  const allowed = hasCentreRole(session.user.centreRoles ?? [], event.centreId, ['CM', 'EL']);
  if (!allowed) throw new Error('FORBIDDEN');

  return session;
}
