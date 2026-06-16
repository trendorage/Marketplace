import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: 'admin' | 'user' };

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'NO_FILE' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: 'TOO_LARGE' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `products/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
