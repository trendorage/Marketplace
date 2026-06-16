'use client';
import { AiChat } from '@/features/ai/components/ai-chat';
import { Card } from '@/shared/components/ui/card';

export default function AiPage() {
  return (
    <Card className="flex h-[calc(100vh-10rem)] flex-col overflow-hidden border-border bg-card">
      <AiChat />
    </Card>
  );
}
