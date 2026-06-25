import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { updateOrderStatusService } from '@/features/orders/service/order.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { role?: 'admin' | 'user' };

const UpdateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { id } = await params;
    if (!id || id.length !== 24) {
      return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 });
    }

    const result = await validateBody(req, UpdateOrderSchema);
    if (result instanceof NextResponse) return result;

    const { data, status } = await updateOrderStatusService(id, result.data.status);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
