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

function extractStringFields(doc: Record<string, unknown>): string[] {
  return Object.entries(doc)
    .filter(([key, val]) => key !== '_id' && typeof val === 'string')
    .map(([key]) => key);
}

function buildSearchFilter(search: string, stringFields: string[]): Record<string, unknown> {
  if (!search || stringFields.length === 0) return {};
  return {
    $or: stringFields.map((field) => ({
      [field]: { $regex: search, $options: 'i' },
    })),
  };
}

function detectFields(doc: Record<string, unknown>): string[] {
  const result: string[] = [];
  for (const key of Object.keys(doc)) {
    if (key !== '_id') result.push(key);
    if (result.length >= 4) break;
  }
  return result;
}

function serializeDoc(doc: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(doc, (_, v) =>
    v && typeof v === 'object' && v._bsontype ? v.toString() : v
  )) as Record<string, unknown>;
}

const COLLECTION_RE = /^[a-zA-Z0-9_-]+$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { collection } = await params;
    if (!COLLECTION_RE.test(collection)) {
      return NextResponse.json({ error: 'INVALID_COLLECTION' }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10')));
    const search = searchParams.get('search') ?? '';

    await mongo.connect();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'DB_NOT_CONNECTED' }, { status: 500 });
    }

    const col = db.collection(collection);
    const skip = (page - 1) * limit;

    const sampleDoc = await col.findOne({});
    const stringFields = sampleDoc
      ? extractStringFields(sampleDoc as Record<string, unknown>)
      : [];
    const filter = search ? buildSearchFilter(search, stringFields) : {};

    const [rawDocs, total] = await Promise.all([
      col.find(filter).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);

    const docs = rawDocs.map((doc) => serializeDoc(doc as Record<string, unknown>));
    const fields = docs.length > 0 ? detectFields(docs[0]) : [];

    return NextResponse.json({ docs, total, fields }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { collection } = await params;
    if (!COLLECTION_RE.test(collection)) {
      return NextResponse.json({ error: 'INVALID_COLLECTION' }, { status: 400 });
    }
    const body = await req.json() as Record<string, unknown>;

    await mongo.connect();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'DB_NOT_CONNECTED' }, { status: 500 });
    }

    const col = db.collection(collection);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...docToInsert } = body;
    const result = await col.insertOne(docToInsert as Record<string, unknown>);

    return NextResponse.json({ insertedId: result.insertedId.toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
