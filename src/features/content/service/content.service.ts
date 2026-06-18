import { contentRepository } from '@/features/content/repository/content.repository';
import type { ContentDocument } from '@/features/content/schema/content.schema';
import type { Content, ContentListResponse } from '@/features/content/types/content.types';
import type {
  UpdateContentType,
  UpsertContentType,
} from '@/features/content/validations/content.validation';
import type { ServiceResult } from '@/shared/types/common';

function docToContent(doc: ContentDocument): Content {
  return {
    id: doc._id.toString(),
    key: doc.key,
    title: doc.title,
    type: doc.type as Content['type'],
    value: doc.value ?? '',
    isActive: doc.isActive ?? true,
    createdAt: (doc as unknown as { createdAt: Date }).createdAt?.toISOString?.() ?? '',
    updatedAt: (doc as unknown as { updatedAt: Date }).updatedAt?.toISOString?.() ?? '',
  };
}

export async function getContentService(
  key?: string,
  adminView = false
): Promise<ServiceResult<ContentListResponse | Content>> {
  if (key) {
    const doc = await contentRepository.findByKey(key);
    if (!doc) return { data: { error: 'NOT_FOUND' }, status: 404 };
    if (!adminView && !doc.isActive) return { data: { error: 'NOT_FOUND' }, status: 404 };
    return { data: docToContent(doc), status: 200 };
  }

  const docs = adminView
    ? await contentRepository.findAll()
    : await contentRepository.findAllActive();

  return { data: { items: docs.map(docToContent) }, status: 200 };
}

export async function upsertContentService(
  input: UpsertContentType
): Promise<ServiceResult<Content>> {
  const doc = await contentRepository.upsert(input.key, {
    key: input.key,
    title: input.title,
    type: input.type ?? 'text',
    value: input.value ?? '',
    isActive: input.isActive ?? true,
  });
  return { data: docToContent(doc), status: 200 };
}

export async function updateContentService(
  key: string,
  input: UpdateContentType
): Promise<ServiceResult<Content>> {
  const doc = await contentRepository.updateByKey(key, input);
  if (!doc) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: docToContent(doc), status: 200 };
}

export async function deleteContentService(
  key: string
): Promise<ServiceResult<{ deleted: boolean }>> {
  const deleted = await contentRepository.deleteByKey(key);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}
