import { z } from 'zod';

import { MARKET_CATEGORIES } from '@/shared/const/navigation.const';

export const PRODUCT_STATUSES = ['active', 'draft', 'out_of_stock', 'pending'] as const;

const VALID_CATEGORY_KEYS = MARKET_CATEGORIES.map((c) => c.key);

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string().refine(
    (k) => VALID_CATEGORY_KEYS.includes(k),
    { message: 'კატეგორია არასწორია' }
  ),
  status: z.enum(PRODUCT_STATUSES),
  image: z.string().optional(),
});

export type CreateProductType = z.infer<typeof CreateProductSchema>;
