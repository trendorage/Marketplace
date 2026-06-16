import { NextRequest, NextResponse } from 'next/server';

import { deleteCategoryService } from '@/features/categories/service/category.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: 'admin' | 'user' };

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const { id } = await params;
    const { data, status } = await deleteCategoryService(id);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
