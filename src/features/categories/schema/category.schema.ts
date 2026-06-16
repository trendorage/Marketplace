import mongoose, { InferSchemaType, Schema } from 'mongoose';

const CategorySchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type CategoryDocument = InferSchemaType<typeof CategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CategoryModel =
  mongoose.models.Category || mongoose.model('Category', CategorySchema);
