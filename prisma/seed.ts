import { hash } from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

async function getOrCreateOrganisation() {
  const existing = await prisma.organisation.findFirst({ where: { name: 'Futuro Education Group' } });
  if (existing) return existing;
  return prisma.organisation.create({ data: { name: 'Futuro Education Group' } });
}

async function getOrCreateCentre(name: string, organisationId: string) {
  const existing = await prisma.centre.findFirst({ where: { organisationId, name } });
  if (existing) return existing;
  return prisma.centre.create({ data: { name, organisationId } });
}

async function main() {
  const org = await getOrCreateOrganisation();
  const centreA = await getOrCreateCentre('Futuro Carlton', org.id);
  await getOrCreateCentre('Futuro Richmond', org.id);

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

  for (const name of ['First Aid', 'Anaphylaxis', 'CPR', 'Child Protection', 'Food Safety', 'Team Meeting', 'Programme/Practice PD', 'Induction', 'Other']) {
    await prisma.trainingType.upsert({
      where: { name },
      update: {},
      create: { name, requiresReflection: name.includes('PD') }
    });
  }

  const pdType = await prisma.trainingType.findFirstOrThrow({ where: { name: 'Programme/Practice PD' } });

  let event = await prisma.trainingEvent.findFirst({
    where: {
      organisationId: org.id,
      centreId: centreA.id,
      trainingTypeId: pdType.id,
      title: 'Quality Practice Workshop'
    }
  });

  if (!event) {
    event = await prisma.trainingEvent.create({
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
        paymentPreferenceEnabled: true,
        createdBy: admin.id
      }
    });
  }

  await prisma.trainingInvite.upsert({
    where: { trainingEventId_participantId: { trainingEventId: event.id, participantId: participant.id } },
    update: { rsvpStatus: 'GOING' },
    create: { trainingEventId: event.id, participantId: participant.id, rsvpStatus: 'GOING' }
  });
}

main().finally(() => prisma.$disconnect());
