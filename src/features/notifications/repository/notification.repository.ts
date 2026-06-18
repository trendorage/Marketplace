import { NotificationDocument, NotificationModel } from '@/features/notifications/schema/notification.schema';
import { mongo } from '@/shared/lib/mongo';

export const notificationRepository = {
  async findAll(): Promise<NotificationDocument[]> {
    await mongo.connect();
    return NotificationModel.find({}, null, { sort: { createdAt: -1 } }).lean<NotificationDocument[]>().exec();
  },

  async create(data: { type: string; title: string; message: string }): Promise<string> {
    await mongo.connect();
    const doc = await NotificationModel.create({ ...data, read: false });
    return doc._id.toString();
  },

  async markRead(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await NotificationModel.findByIdAndUpdate(id, { $set: { read: true } });
    return result !== null;
  },

  async markAllRead(): Promise<void> {
    await mongo.connect();
    await NotificationModel.updateMany({ read: false }, { $set: { read: true } });
  },
};
