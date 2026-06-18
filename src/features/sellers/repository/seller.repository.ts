import { SellerDocument, SellerModel } from '@/features/sellers/schema/seller.schema';
import { mongo } from '@/shared/lib/mongo';

type FindAllParams = {
  search?: string;
  status?: string;
};

export const sellerRepository = {
  async findAll(params: FindAllParams = {}): Promise<SellerDocument[]> {
    await mongo.connect();
    const { search = '', status = '' } = params;
    const filter: Record<string, unknown> = {};
    if (search) filter['$or'] = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { storeName: { $regex: search, $options: 'i' } },
    ];
    if (status) filter['status'] = status;
    return SellerModel.find(filter, null, { sort: { createdAt: -1 } }).lean<SellerDocument[]>().exec();
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
