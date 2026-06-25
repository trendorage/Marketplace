import { NextRequest, NextResponse } from 'next/server';

import { createOrderService, getOrdersService, getOrderStatsService } from '@/features/orders/service/order.service';
import { CreateOrderSchema } from '@/features/orders/validations/order.validation';
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
    const authError = await requireAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    if (searchParams.get('stats') === 'true') {
      const { data, status } = await getOrderStatsService();
      return NextResponse.json(data, { status });
    }

    const rawPage = parseInt(searchParams.get('page') ?? '1');
    const rawLimit = parseInt(searchParams.get('limit') ?? '50');
    const { data, status } = await getOrdersService({
      page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
      limit: Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : 50,
      search: searchParams.get('search') ?? '',
      status: searchParams.get('status') ?? '',
    });
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const result = await validateBody(req, CreateOrderSchema);
    if (result instanceof NextResponse) return result;

    const { data, status } = await createOrderService(result.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
