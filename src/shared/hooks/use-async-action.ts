import { useState } from 'react';

type AsyncActionState = {
  loading: boolean;
  error: string | null;
};

type AsyncActionReturn<T extends unknown[]> = AsyncActionState & {
  run: (...args: T) => Promise<void>;
  clearError: () => void;
};

export function useAsyncAction<T extends unknown[]>(
  action: (...args: T) => Promise<void>,
  onError?: (err: unknown) => string
): AsyncActionReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (...args: T) => {
    setLoading(true);
    setError(null);
    try {
      await action(...args);
    } catch (err) {
      const message = onError
        ? onError(err)
        : err instanceof Error
          ? err.message
          : 'შეცდომა. სცადეთ თავიდან.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, run, clearError: () => setError(null) };
}
