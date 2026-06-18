import { NextRequest, NextResponse } from 'next/server';

import { getSellersService } from '@/features/sellers/service/seller.service';
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
    const { data, status } = await getSellersService({
      search: searchParams.get('search') ?? '',
      status: searchParams.get('status') ?? '',
    });
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
