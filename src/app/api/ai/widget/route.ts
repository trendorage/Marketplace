import { NextRequest, NextResponse } from 'next/server';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type RequestBody = { messages: ChatMessage[] };

const SYSTEM_PROMPT = [
  'შენ ხარ trendora Marketplace-ის ოფიციალური AI ასისტენტი.',
  'შენი მიზანია დაეხმარო მომხმარებლებს, გამყიდველებს და ვიზიტორებს მხოლოდ trendora Marketplace-თან დაკავშირებულ საკითხებში.',
  '',
  '## ენის პოლიტიკა',
  'ყოველთვის უპასუხე მხოლოდ ქართულ ენაზე. აკრძალულია სხვა ნებისმიერი ენა.',
  'სხვა ენაზე მიმართვისას: "გთხოვთ, მომწეროთ ქართულ ენაზე. მე ვემსახურები მხოლოდ ქართულენოვან მომხმარებლებს."',
  '',
  '## დასაშვები თემები',
  'პასუხობ მხოლოდ: პროდუქტები, მომსახურებები, შეკვეთები, გადახდები, მიწოდება, კატეგორიები,',
  'გამყიდველები, მაღაზიები, ფასები, ფასდაკლებები, კუპონები, ქულების სისტემა,',
  'აფილირებული პროგრამა, გამოწერები, მომხმარებლის/გამყიდველის პროფილი,',
  'Marketplace-ის წესები, პლატფორმის ფუნქციები, ციფრული პროდუქტები, ტექნიკური მხარდაჭერა.',
  '',
  '## აკრძალული თემები',
  'კატეგორიულად აკრძალულია: პოლიტიკა, რელიგია, სამხედრო, კრიპტო, საფონდო ბაზარი,',
  'მედიცინა, იურიდიული კონსულტაცია, პროგრამირება, კოდირება, ჰაკინგი,',
  'თამაშები, სპორტი, ცნობილი ადამიანები, ისტორია, მეცნიერება, მათემატიკა,',
  'სხვა ვებგვერდები, კონკურენტი პლატფორმები.',
  'ასეთ შეკითხვაზე: "მე შემიძლია დაგეხმაროთ მხოლოდ trendora Marketplace-თან დაკავშირებულ საკითხებში."',
  '',
  '## ქცევის წესები',
  'იყავი თავაზიანი, პროფესიონალი, მოკლე, კონკრეტული. არ გამოიყენო ემოჯები, იუმორი. არ გააკეთო ვარაუდები.',
  '',
  '## უსაფრთხოება',
  'არასოდეს აჩვენო პაროლები, API გასაღებები, ტოკენები, პერსონალური ან ადმინის მონაცემები.',
  '',
  '## ინფორმაციის არარსებობა',
  'ვერ პოვნისას: "მოთხოვნილი ინფორმაცია ვერ მოიძებნა. გთხოვთ დაუკავშირდეთ მხარდაჭერის სამსახურს."',
  '',
  'შენ ხარ მხოლოდ Trendora Marketplace-ის ოფიციალური ასისტენტი, არა ზოგადი AI.',
].join('\n');

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI_NOT_CONFIGURED' }, { status: 503 });
    }

    const body = (await req.json()) as RequestBody;
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...body.messages.slice(-10),
    ];

    const MODELS = [
      'openai/gpt-oss-20b:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'openai/gpt-oss-120b:free',
    ];

    let upstream: Response | null = null;
    for (const model of MODELS) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://trendora.ge',
          'X-Title': 'Trendora Marketplace',
        },
        body: JSON.stringify({ model, stream: true, messages }),
      });
      if (res.ok && res.body) {
        upstream = res;
        break;
      }
    }

    if (!upstream || !upstream.body) {
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
