import { z } from 'zod';

export const CreateSessionSchema = z.object({
  userId: z.string().min(24).max(24),
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type CreateSessionType = z.infer<typeof CreateSessionSchema>;

export const GetSessionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().optional(),
});

export type GetSessionsQueryType = z.infer<typeof GetSessionsQuerySchema>;
