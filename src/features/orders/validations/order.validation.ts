import { z } from 'zod';

export const CreateOrderSchema = z.object({
  orderNumber: z.string().min(1),
  customer: z.string().min(1),
  email: z.string().email(),
  product: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']).optional(),
});

export type CreateOrderType = z.infer<typeof CreateOrderSchema>;
