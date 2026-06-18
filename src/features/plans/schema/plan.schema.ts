import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PlanSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one-time'],
      default: 'monthly',
    },
    currency: { type: String, default: 'GEL' },
    description: { type: String, default: '' },
    features: [{ type: String }],
    limits: {
      products: { type: Number, default: -1 },
      orders: { type: Number, default: -1 },
      storage: { type: Number, default: 1024 },
    },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type PlanDocument = InferSchemaType<typeof PlanSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const PlanModel = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
