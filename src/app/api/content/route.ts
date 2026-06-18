import { NextRequest, NextResponse } from 'next/server';

import {
  getContentService,
  upsertContentService,
} from '@/features/content/service/content.service';
import { UpsertContentSchema } from '@/features/content/validations/content.validation';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') ?? undefined;

    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    const isAdmin = session?.user && user?.role === 'admin';

    const { data, status } = await getContentService(key, isAdmin === true);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const validated = await validateBody(req, UpsertContentSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await upsertContentService(validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
