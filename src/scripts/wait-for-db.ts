import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS ?? 60000);
const sleepMs = Number(process.env.DB_WAIT_INTERVAL_MS ?? 2000);

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const prisma = new PrismaClient();
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      await prisma.$runCommandRaw({ ping: 1 });
      await prisma.$disconnect();
      console.log('Database is ready.');
      return;
    } catch {
      console.log('Waiting for database...');
      await sleep(sleepMs);
    }
  }

  await prisma.$disconnect();
  console.error(`Database did not become ready within ${timeoutMs}ms.`);
  process.exit(1);
}

main();
