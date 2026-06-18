import { NextRequest, NextResponse } from 'next/server';

import { getUsersService } from '@/features/auth/service/user.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: 'admin' | 'user' };

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const { data, status } = await getUsersService({
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '50'),
      search: searchParams.get('search') ?? '',
      status: searchParams.get('status') ?? '',
      role: searchParams.get('role') ?? '',
    });
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
