import { z } from 'zod';

export const ContentTypeEnum = z.enum(['text', 'richtext', 'image', 'json']);

export const UpsertContentSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-z0-9._-]+$/,
      'Key: only lowercase letters, digits, dots, underscores and hyphens allowed'
    ),
  title: z.string().min(1).max(200),
  type: ContentTypeEnum.optional().default('text'),
  value: z.string().default(''),
  isActive: z.boolean().optional().default(true),
});

export type UpsertContentType = z.infer<typeof UpsertContentSchema>;

export const UpdateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: ContentTypeEnum.optional(),
  value: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateContentType = z.infer<typeof UpdateContentSchema>;
