import { categoryRepository } from '@/features/categories/repository/category.repository';
import type { CategoryDocument } from '@/features/categories/schema/category.schema';
import type { Category, CategoryListResponse } from '@/features/categories/types/category.types';
import type { CreateCategoryType } from '@/features/categories/validations/category.validation';
import { MARKET_CATEGORIES } from '@/shared/const/navigation.const';
import type { ServiceResult } from '@/shared/types/common';

function docToCategory(doc: CategoryDocument): Category {
  return {
    id: doc._id.toString(),
    key: doc.key,
    label: doc.label,
    href: `/category/${doc.key}`,
    order: doc.order ?? 0,
  };
}

export async function getCategoriesService(): Promise<ServiceResult<CategoryListResponse>> {
  const docs = await categoryRepository.findAll();
  return { data: { categories: docs.map(docToCategory) }, status: 200 };
}

export async function createCategoryService(
  input: CreateCategoryType
): Promise<ServiceResult<Category>> {
  const existing = await categoryRepository.findByKey(input.key);
  if (existing) return { data: { error: 'KEY_TAKEN' }, status: 409 };

  const id = await categoryRepository.create({
    key: input.key,
    label: input.label,
    order: input.order ?? 0,
  });

  return {
    data: { id, key: input.key, label: input.label, href: `/category/${input.key}`, order: input.order ?? 0 },
    status: 201,
  };
}

export async function deleteCategoryService(
  id: string
): Promise<ServiceResult<{ deleted: boolean }>> {
  const deleted = await categoryRepository.deleteById(id);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}

export async function seedDefaultCategoriesService(): Promise<ServiceResult<{ seeded: number }>> {
  let seeded = 0;
  for (const [index, cat] of MARKET_CATEGORIES.entries()) {
    const existing = await categoryRepository.findByKey(cat.key);
    if (!existing) {
      await categoryRepository.create({ key: cat.key, label: cat.label, order: index });
      seeded++;
    }
  }
  return { data: { seeded }, status: 200 };
}
