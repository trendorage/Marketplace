import { z } from 'zod';

export const CreateCategorySchema = z.object({
  key: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Key: მხოლოდ a-z, 0-9 და - სიმბოლოები'),
  label: z.string().min(2).max(100),
  order: z.number().int().min(0).optional(),
});

export type CreateCategoryType = z.infer<typeof CreateCategorySchema>;
