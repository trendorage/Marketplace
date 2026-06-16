import { ProductDocument, ProductModel } from '@/features/products/schema/product.schema';
import { mongo } from '@/shared/lib/mongo';

type FindAllParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
};

type CreateInput = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  image?: string;
  rating?: number;
};

export const productRepository = {
  async findById(id: string): Promise<ProductDocument | null> {
    await mongo.connect();
    return ProductModel.findById(id).lean<ProductDocument>().exec();
  },

  async findAll(params: FindAllParams = {}): Promise<{ items: ProductDocument[]; total: number }> {
    await mongo.connect();
    const { page = 1, limit = 50, search = '', status = '', category = '' } = params;
    const filter: Record<string, unknown> = {};
    if (search) filter['name'] = { $regex: search, $options: 'i' };
    if (status) filter['status'] = status;
    if (category) filter['category'] = category;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      ProductModel.find(filter, null, { skip, limit }).lean<ProductDocument[]>().exec(),
      ProductModel.countDocuments(filter),
    ]);
    return { items, total };
  },

  async create(data: CreateInput): Promise<string> {
    await mongo.connect();
    const doc = await ProductModel.create(data);
    return doc._id.toString();
  },

  async updateById(id: string, data: Partial<ProductDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await ProductModel.findByIdAndUpdate(id, { $set: data });
    return result !== null;
  },

  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await ProductModel.findByIdAndDelete(id);
    return result !== null;
  },
};
