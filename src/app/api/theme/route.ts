import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getThemeService, updateThemeService } from '@/features/theme/service/theme.service';
import type { ThemeConfig } from '@/features/theme/types/theme.types';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { role?: 'admin' | 'user' };

const ThemeColorsSchema = z.object({
  primary: z.string().min(1),
  primaryForeground: z.string().min(1),
  secondary: z.string().min(1),
  secondaryForeground: z.string().min(1),
  background: z.string().min(1),
  foreground: z.string().min(1),
  accent: z.string().min(1),
  accentForeground: z.string().min(1),
});

const ThemeTypographySchema = z.object({
  fontFamily: z.string().min(1),
  fontSize: z.number().min(10).max(24),
}).partial();

const UpdateThemeSchema = z.object({
  colors: ThemeColorsSchema.optional(),
  typography: ThemeTypographySchema.optional(),
});

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

    const result = await validateBody(req, UpdateThemeSchema);
    if (result instanceof NextResponse) return result;

    const { data, status } = await updateThemeService(result.data as Partial<ThemeConfig>);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
