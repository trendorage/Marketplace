import { CategoryDocument, CategoryModel } from '@/features/categories/schema/category.schema';
import { mongo } from '@/shared/lib/mongo';

type CreateInput = { key: string; label: string; order?: number };

export const categoryRepository = {
  async findAll(): Promise<CategoryDocument[]> {
    await mongo.connect();
    return CategoryModel.find({}).sort({ order: 1, label: 1 }).lean<CategoryDocument[]>().exec();
  },

  async findByKey(key: string): Promise<CategoryDocument | null> {
    await mongo.connect();
    return CategoryModel.findOne({ key }).lean<CategoryDocument>().exec();
  },

  async create(data: CreateInput): Promise<string> {
    await mongo.connect();
    const doc = await CategoryModel.create(data);
    return doc._id.toString();
  },

  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await CategoryModel.findByIdAndDelete(id);
    return result !== null;
  },

  async count(): Promise<number> {
    await mongo.connect();
    return CategoryModel.countDocuments();
  },
};
