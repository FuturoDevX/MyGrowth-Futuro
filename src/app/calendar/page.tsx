import { requireSession } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export default async function CalendarPage() {
  const session = await requireSession();
  const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });
  const events = participant
    ? await prisma.trainingInvite.findMany({
        where: { participantId: participant.id },
        include: { trainingEvent: { include: { trainingType: true } } },
        orderBy: { trainingEvent: { eventDate: 'asc' } }
      })
    : [];

  return (
    <div className="bg-white rounded p-4">
      <h1 className="text-xl mb-4">My Training Calendar</h1>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.id} className="border p-2 rounded">
            {e.trainingEvent.title} — {e.trainingEvent.eventDate.toISOString().slice(0, 10)} ({e.trainingEvent.trainingType.name})
          </li>
        ))}
      </ul>
    </div>
  );
}
