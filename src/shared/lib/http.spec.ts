import { describe, it, expect, vi, beforeEach } from 'vitest';

import { HttpClient } from './http';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, status = 200): Response {
  const json = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    text: async () => json,
    json: async () => body,
  } as Response;
}

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient('https://api.example.com');
    mockFetch.mockReset();
  });

  it('GET sends correct request', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ id: 1 }));
    const result = await client.get('/users');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual({ id: 1 });
  });

  it('GET appends query params', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse([]));
    await client.get('/users', { params: { page: 1, limit: 10 } });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
  });

  it('POST sends body', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ ok: true }));
    await client.post('/users', { name: 'Alice' });
    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'Alice' }));
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ error: 'NOT_FOUND' }, 404));
    await expect(client.get('/missing')).rejects.toThrow('NOT_FOUND');
  });

  it('PUT sends body', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ updated: true }));
    const result = await client.put('/users/1', { name: 'Bob' });
    expect(result).toEqual({ updated: true });
  });

  it('DELETE sends correct method', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(null));
    await client.delete('/users/1');
    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('DELETE');
  });
});
