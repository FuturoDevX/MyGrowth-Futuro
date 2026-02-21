import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/rbac';

export default async function EventsPage() {
  await requireSession();
  const events = await prisma.trainingEvent.findMany({ include: { centre: true, trainingType: true }, orderBy: { eventDate: 'desc' } });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl">Training Events</h1>
        <Link className="bg-slate-900 text-white px-3 py-2 rounded" href="/events/new">New Event</Link>
      </div>
      <div className="bg-white rounded p-3">
        {events.map((e) => (
          <Link key={e.id} href={`/events/${e.id}`} className="block border-b py-2">
            {e.title} — {e.eventDate.toISOString().slice(0, 10)} — {e.centre?.name ?? 'Org-wide'}
          </Link>
        ))}
      </div>
    </div>
  );
}
