import { NextRequest, NextResponse } from 'next/server';

import {
  createCategoryService,
  getCategoriesService,
  seedDefaultCategoriesService,
} from '@/features/categories/service/category.service';
import { CreateCategorySchema } from '@/features/categories/validations/category.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { role?: 'admin' | 'user' };

async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!session || user?.role !== 'admin') {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  try {
    const { data, status } = await getCategoriesService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const validated = await validateBody(req, CreateCategorySchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await createCategoryService(validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { data, status } = await seedDefaultCategoriesService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
