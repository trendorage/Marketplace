import mongoose, { Schema, InferSchemaType } from 'mongoose';

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['order', 'user', 'seller', 'product', 'system', 'payment'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

export type NotificationDocument = InferSchemaType<typeof NotificationSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const NotificationModel =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
