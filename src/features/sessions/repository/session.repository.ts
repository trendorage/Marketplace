import { mongo } from '@/shared/lib/mongo';

import { SessionModel, SessionDocument } from '../schema/session.schema';

export const sessionRepository = {
  async findById(id: string) {
    await mongo.connect();
    return SessionModel.findById(id).lean();
  },
  async findByUserId(userId: string, page = 1, limit = 20) {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SessionModel.find({ userId }).skip(skip).limit(limit).lean(),
      SessionModel.countDocuments({ userId }),
    ]);
    return { items, total };
  },
  async findAll(page = 1, limit = 20) {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SessionModel.find().skip(skip).limit(limit).lean(),
      SessionModel.countDocuments(),
    ]);
    return { items, total };
  },
  async create(data: Omit<SessionDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await SessionModel.create(data);
    return doc._id.toString();
  },
  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await SessionModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  },
  async deleteByUserId(userId: string): Promise<number> {
    await mongo.connect();
    const result = await SessionModel.deleteMany({ userId });
    return result.deletedCount;
  },
};
