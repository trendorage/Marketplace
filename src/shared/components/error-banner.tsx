'use client';
import { X } from 'lucide-react';

type ErrorBannerProps = {
  message: string | null;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-0.5 shrink-0 opacity-70 transition-opacity hover:opacity-100"
          aria-label="დახურვა"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
