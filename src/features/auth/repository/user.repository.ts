import { UserDocument, UserModel } from '@/features/auth/schema/user.schema';
import { mongo } from '@/shared/lib/mongo';

export const userRepository = {
  async findById(id: string): Promise<UserDocument | null> {
    await mongo.connect();
    return UserModel.findById(id).lean<UserDocument>().exec();
  },

  async findByEmail(email: string): Promise<UserDocument | null> {
    await mongo.connect();
    return UserModel.findOne({ email }).lean<UserDocument>().exec();
  },

  async findAll(
    params: { page?: number; limit?: number; search?: string; status?: string; role?: string } = {}
  ): Promise<{ items: UserDocument[]; total: number }> {
    await mongo.connect();
    const { page = 1, limit = 20, search = '', status = '', role = '' } = params;
    const filter: Record<string, unknown> = {};
    if (search) filter['$or'] = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (status) filter['status'] = status;
    if (role) filter['role'] = role;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      UserModel.find(filter, null, { skip, limit }).lean<UserDocument[]>().exec(),
      UserModel.countDocuments(filter),
    ]);
    return { items, total };
  },

  async create(data: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await UserModel.create(data);
    return doc._id.toString();
  },

  async updateById(id: string, data: Partial<UserDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.findByIdAndUpdate(id, { $set: data });
    return result !== null;
  },

  async updateByEmail(email: string, data: Partial<UserDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.updateOne({ email }, { $set: data });
    return result.matchedCount > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  },
};
