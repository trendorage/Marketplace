import { SellerDocument, SellerModel } from '@/features/sellers/schema/seller.schema';
import { mongo } from '@/shared/lib/mongo';

type FindAllParams = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export const sellerRepository = {
  async findAll(params: FindAllParams = {}): Promise<{ items: SellerDocument[]; total: number }> {
    await mongo.connect();
    const { search = '', status = '', page = 1, limit = 50 } = params;
    const filter: Record<string, unknown> = {};
    if (search) filter['$or'] = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { storeName: { $regex: search, $options: 'i' } },
    ];
    if (status) filter['status'] = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SellerModel.find(filter, null, { skip, limit, sort: { createdAt: -1 } }).lean<SellerDocument[]>().exec(),
      SellerModel.countDocuments(filter),
    ]);
    return { items, total };
  },

  async create(data: Omit<SellerDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await SellerModel.create(data);
    return doc._id.toString();
  },

  async updateById(id: string, data: Partial<SellerDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await SellerModel.findByIdAndUpdate(id, { $set: data });
    return result !== null;
  },
};
