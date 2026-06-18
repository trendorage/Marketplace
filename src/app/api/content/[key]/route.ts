import { NextRequest, NextResponse } from 'next/server';

import {
  deleteContentService,
  getContentService,
  updateContentService,
} from '@/features/content/service/content.service';
import { UpdateContentSchema } from '@/features/content/validations/content.validation';
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: rawKey } = await params;
    const key = decodeURIComponent(rawKey);

    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    const isAdmin = session?.user && user?.role === 'admin';

    const { data, status } = await getContentService(key, isAdmin === true);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { key: rawKey } = await params;
    const key = decodeURIComponent(rawKey);

    const validated = await validateBody(req, UpdateContentSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await updateContentService(key, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { key: rawKey } = await params;
    const key = decodeURIComponent(rawKey);

    const { data, status } = await deleteContentService(key);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
