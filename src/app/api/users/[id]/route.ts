import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { updateUserService } from '@/features/auth/service/user.service';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

const UpdateUserSchema = z.object({
  role: z.enum(['user', 'seller', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'banned']).optional(),
});

type SessionUser = { role?: 'admin' | 'user' };

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
    const result = await validateBody(req, UpdateUserSchema);
    if (result instanceof NextResponse) return result;
    const { data, status } = await updateUserService(id, result.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
