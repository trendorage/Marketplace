import { notificationRepository } from '@/features/notifications/repository/notification.repository';
import type { NotificationDocument } from '@/features/notifications/schema/notification.schema';
import type { ServiceResult } from '@/shared/types/common';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
};

function docToNotification(doc: NotificationDocument): Notification {
  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    message: doc.message,
    read: doc.read,
    time: doc.createdAt?.toISOString() ?? '',
  };
}

export async function getNotificationsService(): Promise<ServiceResult<{ notifications: Notification[] }>> {
  const items = await notificationRepository.findAll();
  return { data: { notifications: items.map(docToNotification) }, status: 200 };
}

export async function createNotificationService(
  input: { type: string; title: string; message: string }
): Promise<ServiceResult<Notification>> {
  const id = await notificationRepository.create(input);
  const items = await notificationRepository.findAll();
  const doc = items.find((n) => n._id.toString() === id);
  if (!doc) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: docToNotification(doc), status: 201 };
}

export async function markNotificationReadService(id: string): Promise<ServiceResult<{ ok: boolean }>> {
  const ok = await notificationRepository.markRead(id);
  if (!ok) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { ok: true }, status: 200 };
}

export async function markAllNotificationsReadService(): Promise<ServiceResult<{ ok: boolean }>> {
  await notificationRepository.markAllRead();
  return { data: { ok: true }, status: 200 };
}
