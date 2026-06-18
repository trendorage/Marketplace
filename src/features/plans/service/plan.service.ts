import { planRepository } from '@/features/plans/repository/plan.repository';
import type { PlanDocument } from '@/features/plans/schema/plan.schema';
import type { Plan, PlanListResponse } from '@/features/plans/types/plan.types';
import type { CreatePlanType, UpdatePlanType } from '@/features/plans/validations/plan.validation';
import type { ServiceResult } from '@/shared/types/common';

function docToPlan(doc: PlanDocument): Plan {
  const limits = doc.limits as { products?: number; orders?: number; storage?: number } | undefined;
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    billingCycle: (doc.billingCycle as 'monthly' | 'yearly' | 'one-time') ?? 'monthly',
    currency: doc.currency ?? 'GEL',
    description: doc.description ?? '',
    features: (doc.features as string[]) ?? [],
    limits: {
      products: limits?.products ?? -1,
      orders: limits?.orders ?? -1,
      storage: limits?.storage ?? 1024,
    },
    isActive: doc.isActive ?? true,
    isPopular: doc.isPopular ?? false,
    order: doc.order ?? 0,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  };
}

export async function getPlansService(activeOnly = false): Promise<ServiceResult<PlanListResponse>> {
  const docs = activeOnly
    ? await planRepository.findActive()
    : await planRepository.findAll();
  return { data: { plans: docs.map(docToPlan) }, status: 200 };
}

export async function createPlanService(input: CreatePlanType): Promise<ServiceResult<Plan>> {
  const existing = await planRepository.findBySlug(input.slug);
  if (existing) return { data: { error: 'SLUG_TAKEN' }, status: 409 };

  const id = await planRepository.create({
    name: input.name,
    slug: input.slug,
    price: input.price,
    billingCycle: input.billingCycle ?? 'monthly',
    currency: input.currency ?? 'GEL',
    description: input.description ?? '',
    features: input.features ?? [],
    limits: {
      products: input.limits?.products ?? -1,
      orders: input.limits?.orders ?? -1,
      storage: input.limits?.storage ?? 1024,
    },
    isActive: input.isActive ?? true,
    isPopular: input.isPopular ?? false,
    order: input.order ?? 0,
  });

  const doc = await planRepository.findById(id);
  if (!doc) return { data: { error: 'CREATE_FAILED' }, status: 500 };

  return { data: docToPlan(doc), status: 201 };
}

export async function updatePlanService(
  id: string,
  input: UpdatePlanType
): Promise<ServiceResult<Plan>> {
  if (input.slug) {
    const existing = await planRepository.findBySlug(input.slug);
    if (existing && existing._id.toString() !== id) {
      return { data: { error: 'SLUG_TAKEN' }, status: 409 };
    }
  }

  const updated = await planRepository.updateById(id, input);
  if (!updated) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: docToPlan(updated), status: 200 };
}

export async function deletePlanService(id: string): Promise<ServiceResult<{ deleted: boolean }>> {
  const deleted = await planRepository.deleteById(id);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}
