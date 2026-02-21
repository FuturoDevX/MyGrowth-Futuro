import PgBoss from 'pg-boss';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

const boss = new PgBoss(process.env.DATABASE_URL!);

async function run() {
  await boss.start();
  await boss.subscribe('event-reminder', async (job) => {
    const invite = await prisma.trainingInvite.findUnique({ where: { id: job.data.inviteId }, include: { participant: true, trainingEvent: true } });
    if (!invite || invite.reminderSentAt) return;
    await sendEmail(invite.participant.email, `Reminder: ${invite.trainingEvent.title}`, '<p>Your event is in 24h</p>');
    await prisma.trainingInvite.update({ where: { id: invite.id }, data: { reminderSentAt: new Date() } });
  });

  await boss.subscribe('daily-overdue-reflections', async () => {
    const overdue = await prisma.reflection.findMany({ where: { dueDate: { lt: new Date() }, status: { in: ['SENT', 'NOT_SENT'] } }, include: { participant: true } });
    for (const item of overdue) {
      await sendEmail(item.participant.email, 'Reflection overdue', '<p>Please submit your reflection</p>');
      await prisma.reflection.update({ where: { id: item.id }, data: { status: 'OVERDUE' } });
    }
  });
}

run();
