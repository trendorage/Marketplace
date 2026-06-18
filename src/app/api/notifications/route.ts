import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createNotificationService,
  getNotificationsService,
  markAllNotificationsReadService,
} from '@/features/notifications/service/notification.service';
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

const CreateNotificationSchema = z.object({
  type: z.enum(['order', 'user', 'seller', 'product', 'system', 'payment']),
  title: z.string().min(1),
  message: z.string().min(1),
});

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { data, status } = await getNotificationsService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    const result = await validateBody(req, CreateNotificationSchema);
    if (result instanceof NextResponse) return result;
    const { data, status } = await createNotificationService(result.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { data, status } = await markAllNotificationsReadService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
