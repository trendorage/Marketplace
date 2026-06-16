import { NextRequest, NextResponse } from 'next/server';

import {
  createProductService,
  getProductsService,
} from '@/features/products/service/product.service';
import { CreateProductSchema } from '@/features/products/validations/product.validation';
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
    const { searchParams } = new URL(req.url);
    const { data, status: responseStatus } = await getProductsService({
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '50'),
      search: searchParams.get('search') ?? '',
      status: searchParams.get('status') ?? '',
      category: searchParams.get('category') ?? '',
    });
    return NextResponse.json(data, { status: responseStatus });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const validated = await validateBody(req, CreateProductSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status: responseStatus } = await createProductService(validated.data);
    return NextResponse.json(data, { status: responseStatus });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
