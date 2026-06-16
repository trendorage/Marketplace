import mongoose, { InferSchemaType, Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'draft', 'out_of_stock', 'pending'],
      default: 'draft',
      required: true,
    },
    image: { type: String, required: false },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export const ProductModel =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);
