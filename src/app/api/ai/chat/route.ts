import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: 'admin' | 'user' };
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type RequestBody = { messages: ChatMessage[] };

const SYSTEM_PROMPT =
  'You are the Trendora AI assistant. Trendora is a Georgian e-commerce marketplace (trendora.ge). ' +
  'You help admins manage products, categories, orders, and analyze business metrics. ' +
  'Respond in the same language the user writes in (Georgian or English). Be concise and helpful.';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI_NOT_CONFIGURED' }, { status: 503 });
    }

    const body = (await req.json()) as RequestBody;
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...body.messages,
    ];

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'nex-agi/nex-n2-pro:free',
        stream: true,
        messages,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'UPSTREAM_ERROR' }, { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
