import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

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

function parseId(id: string): ObjectId | string {
  if (ObjectId.isValid(id) && id.length === 24) {
    return new ObjectId(id);
  }
  return id;
}

function serializeDoc(doc: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(doc, (_, v) =>
    v && typeof v === 'object' && v._bsontype ? v.toString() : v
  )) as Record<string, unknown>;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { collection, id } = await params;

    await mongo.connect();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'DB_NOT_CONNECTED' }, { status: 500 });
    }

    const col = db.collection(collection);
    const parsedId = parseId(id);
    const doc = await col.findOne({ _id: parsedId as ObjectId });
    if (!doc) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    return NextResponse.json({ doc: serializeDoc(doc as Record<string, unknown>) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { collection, id } = await params;
    const body = await req.json() as Record<string, unknown>;

    await mongo.connect();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'DB_NOT_CONNECTED' }, { status: 500 });
    }

    const col = db.collection(collection);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = body;
    const parsedId = parseId(id);
    const result = await col.updateOne({ _id: parsedId as ObjectId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ updated: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { collection, id } = await params;

    await mongo.connect();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'DB_NOT_CONNECTED' }, { status: 500 });
    }

    const col = db.collection(collection);
    const parsedId = parseId(id);
    const result = await col.deleteOne({ _id: parsedId as ObjectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
