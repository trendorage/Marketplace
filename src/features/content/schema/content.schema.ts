import mongoose, { InferSchemaType, Schema } from 'mongoose';

const ContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'richtext', 'image', 'json'],
      default: 'text',
    },
    value: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type ContentDocument = InferSchemaType<typeof ContentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ContentModel =
  mongoose.models.Content || mongoose.model('Content', ContentSchema);
