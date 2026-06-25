import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { updateSellerService } from '@/features/sellers/service/seller.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { role?: 'admin' | 'user' };

const UpdateSellerSchema = z.object({
  status: z.enum(['active', 'pending', 'suspended']).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  storeName: z.string().min(1).optional(),
});

type UpdateSellerInput = {
  status?: 'active' | 'pending' | 'suspended';
  commissionRate?: number;
  storeName?: string;
};

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

    const result = await validateBody(req, UpdateSellerSchema);
    if (result instanceof NextResponse) return result;

    const { data, status } = await updateSellerService(id, result.data as UpdateSellerInput);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
