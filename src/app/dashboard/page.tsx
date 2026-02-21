import { requireSession } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { startOfYear } from 'date-fns';

export default async function DashboardPage() {
  const session = await requireSession();
  const participant = await prisma.participant.findFirst({ where: { userId: session.user.id } });

  const [upcoming, reflections, ytdCompletions] = await Promise.all([
    participant
      ? prisma.trainingInvite.findMany({
          where: { participantId: participant.id, trainingEvent: { eventDate: { gte: new Date() } } },
          include: { trainingEvent: true },
          orderBy: { trainingEvent: { eventDate: 'asc' } },
          take: 5
        })
      : [],
    participant ? prisma.reflection.findMany({ where: { participantId: participant.id, status: { in: ['SENT', 'OVERDUE'] } } }) : [],
    participant ? prisma.completion.count({ where: { participantId: participant.id, completionDate: { gte: startOfYear(new Date()) } } }) : 0
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Welcome, {session.user.name}</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded p-4">YTD completions: {ytdCompletions}</div>
        <div className="bg-white rounded p-4">Outstanding reflections: {reflections.length}</div>
        <div className="bg-white rounded p-4">Upcoming training: {upcoming.length}</div>
      </div>
    </div>
  );
}
