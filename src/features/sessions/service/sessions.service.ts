import { ServiceResult, PaginatedResult } from '@/shared/types/common';

import { sessionRepository } from '../repository/session.repository';
import { Session } from '../types/sessions.types';

type RawSession = {
  _id: { toString: () => string };
  userId: { toString: () => string };
  token: string;
  expiresAt: Date;
  createdAt?: Date;
};

function mapSession(raw: RawSession): Session {
  return {
    id: raw._id.toString(),
    userId: raw.userId.toString(),
    token: raw.token,
    expiresAt: raw.expiresAt.toISOString(),
    createdAt: raw.createdAt?.toISOString(),
  };
}

export async function getSessionsService(
  page = 1,
  limit = 20,
  userId?: string
): Promise<ServiceResult<PaginatedResult<Session>>> {
  const result = userId
    ? await sessionRepository.findByUserId(userId, page, limit)
    : await sessionRepository.findAll(page, limit);

  const sessions = (result.items as RawSession[]).map(mapSession);
  return {
    data: { items: sessions, total: result.total, page, limit },
    status: 200,
  };
}

export async function deleteSessionService(id: string): Promise<ServiceResult<{ deleted: boolean }>> {
  const deleted = await sessionRepository.deleteById(id);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}
