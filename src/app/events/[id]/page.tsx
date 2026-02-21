import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EventDetail({ params }: { params: { id: string } }) {
  const event = await prisma.trainingEvent.findUnique({ where: { id: params.id }, include: { invites: { include: { participant: true } }, attendanceRecords: true } });
  if (!event) return notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-xl">{event.title} — {event.eventDate.toISOString().slice(0, 10)}</h1>
      <div className="flex gap-2">
        <Link href={`/events/${event.id}/invites`} className="bg-slate-800 text-white">Invites</Link>
        <Link href={`/events/${event.id}/attendance`} className="bg-slate-800 text-white">Attendance</Link>
        <Link href={`/events/${event.id}/rsvp`} className="bg-slate-800 text-white">RSVP</Link>
      </div>
      <p>Invited: {event.invites.length}</p>
      <p>Attendance marked: {event.attendanceRecords.length}</p>
    </div>
  );
}
