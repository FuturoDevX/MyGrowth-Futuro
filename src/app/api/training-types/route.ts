import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { parseJson } from '@/lib/http';
import { requireAdmin } from '@/lib/rbac';

const schema = z.object({ name: z.string(), requiresReflection: z.boolean().default(false), isMandatory: z.boolean().default(false) });

export async function GET() {
  await requireAdmin();
  return NextResponse.json(await prisma.trainingType.findMany());
}

export async function POST(req: Request) {
  await requireAdmin();
  const data = await parseJson(req, schema);
  return NextResponse.json(await prisma.trainingType.create({ data }));
}
