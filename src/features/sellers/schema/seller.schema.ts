import mongoose, { Schema, InferSchemaType } from 'mongoose';

const SellerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    storeName: { type: String, required: true },
    commissionRate: { type: Number, default: 10 },
    rating: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    products: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

export type SellerDocument = InferSchemaType<typeof SellerSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const SellerModel =
  mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
