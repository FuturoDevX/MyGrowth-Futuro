import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApiError, parseJson } from '@/lib/http';
import { requireAdmin } from '@/lib/rbac';

const schema = z.object({ name: z.string().min(2), requiresReflection: z.boolean().default(false), isMandatory: z.boolean().default(false) });

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await prisma.trainingType.findMany({ orderBy: { name: 'asc' } }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await parseJson(req, schema);
    return NextResponse.json(await prisma.trainingType.create({ data }));
  } catch (error) {
    return handleApiError(error);
  }
}
