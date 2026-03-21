import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repository/session.repository', () => ({
  sessionRepository: {
    findAll: vi.fn(),
    findByUserId: vi.fn(),
    deleteById: vi.fn(),
  },
}));

import { getSessionsService, deleteSessionService } from './sessions.service';
import { sessionRepository } from '../repository/session.repository';

const mockRepo = vi.mocked(sessionRepository);

const fakeSession = {
  _id: { toString: () => 'abc123' },
  userId: { toString: () => 'user1' },
  token: 'tok',
  expiresAt: new Date('2025-01-01'),
  createdAt: new Date('2024-01-01'),
};

describe('getSessionsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all sessions with pagination', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ items: [fakeSession] as never, total: 1 });
    const result = await getSessionsService(1, 20);
    expect(result.status).toBe(200);
    const data = result.data as { items: unknown[]; total: number };
    expect(data.items).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it('filters by userId when provided', async () => {
    mockRepo.findByUserId.mockResolvedValueOnce({ items: [] as never, total: 0 });
    const result = await getSessionsService(1, 20, 'user1');
    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user1', 1, 20);
    expect(result.status).toBe(200);
  });
});

describe('deleteSessionService', () => {
  it('returns 404 when session not found', async () => {
    mockRepo.deleteById.mockResolvedValueOnce(false);
    const result = await deleteSessionService('nonexistent');
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: 'NOT_FOUND' });
  });

  it('returns deleted:true on success', async () => {
    mockRepo.deleteById.mockResolvedValueOnce(true);
    const result = await deleteSessionService('abc123');
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ deleted: true });
  });
});
