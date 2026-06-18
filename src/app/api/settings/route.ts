import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSettingsService, updateSettingsService } from '@/features/settings/service/settings.service';
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

const UpdateSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteUrl: z.string().min(1).optional(),
  supportEmail: z.string().email().optional(),
  defaultCommission: z.number().min(0).max(100).optional(),
  sellerCommission: z.number().min(0).max(100).optional(),
  minPayout: z.number().min(0).optional(),
  emailNewOrder: z.boolean().optional(),
  emailNewUser: z.boolean().optional(),
  emailNewSeller: z.boolean().optional(),
  emailLowStock: z.boolean().optional(),
  emailSystem: z.boolean().optional(),
});

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    const { data, status } = await getSettingsService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    const result = await validateBody(req, UpdateSettingsSchema);
    if (result instanceof NextResponse) return result;
    const { data, status } = await updateSettingsService(result.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
