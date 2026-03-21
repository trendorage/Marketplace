import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repository/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  },
}));

import { loginService, getUserByIdService } from './auth.service';
import { userRepository } from '../repository/user.repository';

const mockUserRepository = vi.mocked(userRepository);

const fakeUser = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  name: 'Alice',
  email: 'alice@example.com',
  passwordHash: 'hash',
};

describe('loginService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when user not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);
    const result = await loginService({ email: 'nobody@test.com', password: 'password123' });
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: 'NOT_FOUND' });
  });

  it('returns user data when user found', async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await loginService({ email: 'alice@example.com', password: 'password123' });
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ email: 'alice@example.com', name: 'Alice' });
  });
});

describe('getUserByIdService', () => {
  it('returns 404 when user not found', async () => {
    mockUserRepository.findById.mockResolvedValueOnce(null);
    const result = await getUserByIdService('nonexistent-id');
    expect(result.status).toBe(404);
  });

  it('returns user data when found', async () => {
    mockUserRepository.findById.mockResolvedValueOnce(fakeUser as never);
    const result = await getUserByIdService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ name: 'Alice' });
  });
});
