import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth';
import { mongo } from '@/shared/lib/mongo';

type SessionUser = { role?: 'admin' | 'user' };

async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!session || user?.role !== 'admin') {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    await mongo.connect();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'DB_NOT_CONNECTED' }, { status: 500 });
    }

    const collections = await db.listCollections().toArray();
    const names = collections
      .map((c) => c.name)
      .filter((n) => !n.startsWith('system.'))
      .sort();

    return NextResponse.json({ collections: names }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
