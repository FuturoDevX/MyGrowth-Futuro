import { hash } from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

async function main() {
  const org = await prisma.organisation.upsert({ where: { id: 'org_seed' }, update: {}, create: { id: 'org_seed', name: 'Futuro Education Group' } });
  const centreA = await prisma.centre.upsert({ where: { id: 'centre_a' }, update: {}, create: { id: 'centre_a', name: 'Futuro Carlton', organisationId: org.id } });
  await prisma.centre.upsert({ where: { id: 'centre_b' }, update: {}, create: { id: 'centre_b', name: 'Futuro Richmond', organisationId: org.id } });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@futuro.local' },
    update: {},
    create: { email: 'admin@futuro.local', name: 'Admin User', passwordHash: await hash('Password123!', 10), organisationId: org.id, globalRole: 'ADMIN' }
  });

  const educator = await prisma.user.upsert({
    where: { email: 'educator@futuro.local' },
    update: {},
    create: { email: 'educator@futuro.local', name: 'Educator Jane', passwordHash: await hash('Password123!', 10), organisationId: org.id }
  });

  const participant = await prisma.participant.upsert({
    where: { organisationId_email: { organisationId: org.id, email: 'educator@futuro.local' } },
    update: {},
    create: { organisationId: org.id, centreId: centreA.id, userId: educator.id, name: 'Educator Jane', email: 'educator@futuro.local', participantType: 'STAFF' }
  });

  await prisma.trainingType.createMany({ data: [
    'First Aid','Anaphylaxis','CPR','Child Protection','Food Safety','Team Meeting','Programme/Practice PD','Induction','Other'
  ].map((name) => ({ name, requiresReflection: name.includes('PD') })), skipDuplicates: true });

  const pdType = await prisma.trainingType.findFirstOrThrow({ where: { name: 'Programme/Practice PD' } });
  const event = await prisma.trainingEvent.create({
    data: {
      organisationId: org.id,
      centreId: centreA.id,
      trainingTypeId: pdType.id,
      title: 'Quality Practice Workshop',
      eventDate: new Date(),
      startTime: '09:00',
      endTime: '11:00',
      facilitator: 'Lead EL',
      deliveryMode: 'IN_PERSON',
      roleRequired: ['EDUCATOR'],
      paymentPreferenceEnabled: true
    }
  });

  await prisma.trainingInvite.upsert({
    where: { trainingEventId_participantId: { trainingEventId: event.id, participantId: participant.id } },
    update: { rsvpStatus: 'GOING' },
    create: { trainingEventId: event.id, participantId: participant.id, rsvpStatus: 'GOING' }
  });
}

main().finally(() => prisma.$disconnect());
