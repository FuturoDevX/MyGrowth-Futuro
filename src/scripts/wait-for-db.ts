import { Client } from 'pg';

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

async function check() {
  const client = new Client({ connectionString });
  await client.connect();
  await client.query('select 1');
  await client.end();
}

async function main() {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await check();
      console.log('Database is ready.');
      return;
    } catch (error) {
      console.log('Waiting for database...');
      await sleep(sleepMs);
    }
  }

  console.error(`Database did not become ready within ${timeoutMs}ms.`);
  process.exit(1);
}

main();
