import { mongo } from '@/shared/lib/mongo';

import { UserModel, UserDocument } from '../schema/user.schema';

export const userRepository = {
  async findById(id: string) {
    await mongo.connect();
    return UserModel.findById(id).lean();
  },
  async findByEmail(email: string) {
    await mongo.connect();
    return UserModel.findOne({ email }).lean();
  },
  async findAll(page = 1, limit = 20) {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const items = await UserModel.find().skip(skip).limit(limit).lean();
    return { items };
  },
  async create(data: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await UserModel.create(data);
    return doc._id.toString();
  },
  async updateById(id: string, data: Partial<UserDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.updateOne({ _id: id }, { $set: data });
    return result.modifiedCount > 0;
  },
  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  },
};
