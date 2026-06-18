import { NextRequest, NextResponse } from 'next/server';

import { orderRepository } from '@/features/orders/repository/order.repository';
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
    const period = (searchParams.get('period') ?? '30d') as '7d' | '30d' | '1y';
    const validPeriods = ['7d', '30d', '1y'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: 'INVALID_PERIOD' }, { status: 400 });
    }
    const data = await orderRepository.getAnalytics(period);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
