import { PlanDocument, PlanModel } from '@/features/plans/schema/plan.schema';
import { mongo } from '@/shared/lib/mongo';

type CreatePlanInput = {
  name: string;
  slug: string;
  price: number;
  billingCycle?: 'monthly' | 'yearly' | 'one-time';
  currency?: string;
  description?: string;
  features?: string[];
  limits?: {
    products?: number;
    orders?: number;
    storage?: number;
  };
  isActive?: boolean;
  isPopular?: boolean;
  order?: number;
};

type UpdatePlanInput = Partial<CreatePlanInput>;

export const planRepository = {
  async findAll(): Promise<PlanDocument[]> {
    await mongo.connect();
    return PlanModel.find({}).sort({ order: 1, name: 1 }).lean<PlanDocument[]>().exec();
  },

  async findActive(): Promise<PlanDocument[]> {
    await mongo.connect();
    return PlanModel.find({ isActive: true }).sort({ order: 1, name: 1 }).lean<PlanDocument[]>().exec();
  },

  async findById(id: string): Promise<PlanDocument | null> {
    await mongo.connect();
    return PlanModel.findById(id).lean<PlanDocument>().exec();
  },

  async findBySlug(slug: string): Promise<PlanDocument | null> {
    await mongo.connect();
    return PlanModel.findOne({ slug }).lean<PlanDocument>().exec();
  },

  async create(data: CreatePlanInput): Promise<string> {
    await mongo.connect();
    const doc = await PlanModel.create(data);
    return doc._id.toString();
  },

  async updateById(id: string, data: UpdatePlanInput): Promise<PlanDocument | null> {
    await mongo.connect();
    return PlanModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean<PlanDocument>()
      .exec();
  },

  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await PlanModel.findByIdAndDelete(id);
    return result !== null;
  },
};
