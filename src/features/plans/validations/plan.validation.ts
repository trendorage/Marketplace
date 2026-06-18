import { z } from 'zod';

const PlanLimitsSchema = z.object({
  products: z.number().int().min(-1).optional(),
  orders: z.number().int().min(-1).optional(),
  storage: z.number().int().min(0).optional(),
});

export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug: only a-z, 0-9 and - characters'),
  price: z.number().min(0),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']).optional(),
  currency: z.string().min(1).max(10).optional(),
  description: z.string().max(500).optional(),
  features: z.array(z.string().min(1)).optional(),
  limits: PlanLimitsSchema.optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const UpdatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug: only a-z, 0-9 and - characters')
    .optional(),
  price: z.number().min(0).optional(),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']).optional(),
  currency: z.string().min(1).max(10).optional(),
  description: z.string().max(500).optional(),
  features: z.array(z.string().min(1)).optional(),
  limits: PlanLimitsSchema.optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type CreatePlanType = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanType = z.infer<typeof UpdatePlanSchema>;
