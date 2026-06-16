import { z } from 'zod';

export const PRODUCT_STATUSES = ['active', 'draft', 'out_of_stock', 'pending'] as const;

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string().min(1, 'კატეგორია სავალდებულოა'),
  status: z.enum(PRODUCT_STATUSES),
  image: z.string().optional(),
});

export type CreateProductType = z.infer<typeof CreateProductSchema>;
