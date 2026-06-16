'use client';
import { Bot, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string };

const parseSSEChunk = (chunk: string): string => {
  let result = '';
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (data === '[DONE]') break;
    try {
      const parsed = JSON.parse(data) as {
        choices?: { delta?: { content?: string } }[];
      };
      result += parsed.choices?.[0]?.delta?.content ?? '';
    } catch {
      // skip malformed chunk
    }
  }
  return result;
};

export const AiWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch('/api/ai/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) throw new Error('failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += parseSSEChunk(decoder.decode(value, { stream: true }));
        const cur = acc;
        setMessages((prev) => {
          const u = [...prev];
          u[u.length - 1] = { role: 'assistant', content: cur };
          return u;
        });
        scrollToBottom();
      }
    } catch {
      setMessages((prev) => {
        const u = [...prev];
        u[u.length - 1] = { role: 'assistant', content: 'შეცდომა. სცადეთ თავიდან.' };
        return u;
      });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Chat panel */}
      {open && (
        <div
          className="flex h-[70vh] max-h-[500px] min-h-[320px] flex-col overflow-hidden
            rounded-2xl border border-border bg-card shadow-2xl
            w-[calc(100vw-2rem)] sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary px-4 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Trendora AI</p>
              <p className="text-xs text-white/50">ასისტენტი</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-md
                text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="დახურვა"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 sm:p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Bot className="size-10 text-primary/30" />
                <p className="text-xs font-medium text-foreground">როგორ შეგვიძლია დაგეხმაროთ?</p>
                <p className="text-xs text-muted-foreground">
                  დასვით შეკითხვა პროდუქტებზე ან შეკვეთებზე.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary mt-0.5">
                    <Bot className="size-3.5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content || (loading && i === messages.length - 1
                    ? (
                      <span className="flex gap-1 items-center h-3">
                        <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                        <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                        <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                      </span>
                    )
                    : ''
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="შეტყობინება..."
                disabled={loading}
                className="h-11 flex-1 rounded-xl border border-border bg-background
                  px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl
                  bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-14 items-center justify-center rounded-full
          bg-primary text-primary-foreground shadow-lg transition-transform
          hover:scale-105 active:scale-95"
        aria-label="AI ასისტენტი"
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
      </button>
    </div>
  );
};
