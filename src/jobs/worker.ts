import { subHours, addHours } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

async function sendEventReminders() {
  const now = new Date();
  const in24hStart = subHours(addHours(now, 24), 1);
  const in24hEnd = addHours(addHours(now, 24), 1);

  const invites = await prisma.trainingInvite.findMany({
    where: {
      reminderSentAt: null,
      trainingEvent: {
        eventDate: {
          gte: in24hStart,
          lte: in24hEnd
        }
      }
    },
    include: { participant: true, trainingEvent: true }
  });

  for (const invite of invites) {
    await sendEmail(invite.participant.email, `Reminder: ${invite.trainingEvent.title}`, '<p>Your event is in about 24h</p>');
    await prisma.trainingInvite.update({ where: { id: invite.id }, data: { reminderSentAt: new Date() } });
  }
}

async function markOverdueReflections() {
  const overdue = await prisma.reflection.findMany({
    where: { dueDate: { lt: new Date() }, status: { in: ['SENT', 'NOT_SENT'] } },
    include: { participant: true }
  });

  for (const item of overdue) {
    await sendEmail(item.participant.email, 'Reflection overdue', '<p>Please submit your reflection</p>');
    await prisma.reflection.update({ where: { id: item.id }, data: { status: 'OVERDUE' } });
  }
}

async function run() {
  while (true) {
    try {
      await sendEventReminders();
      await markOverdueReflections();
    } catch (error) {
      console.error('Worker iteration failed', error);
    }

    await new Promise((resolve) => setTimeout(resolve, 60_000));
  }
}

run();
