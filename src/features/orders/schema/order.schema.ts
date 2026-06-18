import mongoose, { Schema, InferSchemaType } from 'mongoose';

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    email: { type: String, required: true },
    product: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof OrderSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const OrderModel =
  mongoose.models.Order || mongoose.model('Order', OrderSchema);
