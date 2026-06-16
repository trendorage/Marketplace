'use client';
import { Bot, Send, Trash2, User } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string };

const parseSSEChunk = (chunk: string): string => {
  let result = '';
  const lines = chunk.split('\n');
  for (const line of lines) {
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

export const AiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    scrollToBottom();

    const assistantPlaceholder: Message = { role: 'assistant', content: '' };
    setMessages([...nextMessages, assistantPlaceholder]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) throw new Error('request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += parseSSEChunk(decoder.decode(value, { stream: true }));
        const current = accumulated;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: current };
          return updated;
        });
        scrollToBottom();
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'შეცდომა. სცადეთ თავიდან.',
        };
        return updated;
      });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Bot className="size-12 text-primary/40" />
            <p className="text-sm font-medium text-foreground">Trendora AI ასისტენტი</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              დამისვით შეკითხვა პროდუქტებზე, შეკვეთებზე, ანალიტიკაზე ან ნებისმიერ სხვა თემაზე.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                <Bot className="size-4" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <span className="flex gap-1 items-center h-4">
                  <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                  <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                  <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                </span>
              ) : '')}
            </div>
            {msg.role === 'user' && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                <User className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
              გასუფთავება
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="შეტყობინება..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
