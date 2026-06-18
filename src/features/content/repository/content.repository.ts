import type { ContentDocument } from '@/features/content/schema/content.schema';
import { ContentModel } from '@/features/content/schema/content.schema';
import type { UpdateContentType } from '@/features/content/validations/content.validation';
import { mongo } from '@/shared/lib/mongo';

type UpsertInput = {
  key: string;
  title: string;
  type?: string;
  value?: string;
  isActive?: boolean;
};

export const contentRepository = {
  async findAll(): Promise<ContentDocument[]> {
    await mongo.connect();
    return ContentModel.find({}).sort({ key: 1 }).lean<ContentDocument[]>().exec();
  },

  async findAllActive(): Promise<ContentDocument[]> {
    await mongo.connect();
    return ContentModel.find({ isActive: true }).sort({ key: 1 }).lean<ContentDocument[]>().exec();
  },

  async findByKey(key: string): Promise<ContentDocument | null> {
    await mongo.connect();
    return ContentModel.findOne({ key }).lean<ContentDocument>().exec();
  },

  async upsert(key: string, data: UpsertInput): Promise<ContentDocument> {
    await mongo.connect();
    const doc = await ContentModel.findOneAndUpdate(
      { key },
      { $set: data },
      { upsert: true, new: true }
    )
      .lean<ContentDocument>()
      .exec();
    return doc as ContentDocument;
  },

  async updateByKey(key: string, data: UpdateContentType): Promise<ContentDocument | null> {
    await mongo.connect();
    return ContentModel.findOneAndUpdate({ key }, { $set: data }, { new: true })
      .lean<ContentDocument>()
      .exec();
  },

  async deleteByKey(key: string): Promise<boolean> {
    await mongo.connect();
    const result = await ContentModel.findOneAndDelete({ key });
    return result !== null;
  },

  async count(): Promise<number> {
    await mongo.connect();
    return ContentModel.countDocuments();
  },
};
