import { NextRequest, NextResponse } from 'next/server';

import { getThemeService, updateThemeService } from '@/features/theme/service/theme.service';
import type { ThemeConfig } from '@/features/theme/types/theme.types';
import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: 'admin' | 'user' };

export async function GET() {
  try {
    const { data, status } = await getThemeService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = (await req.json()) as Partial<ThemeConfig>;
    const { data, status } = await updateThemeService(body);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
