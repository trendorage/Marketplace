import mongoose, { InferSchemaType, Schema } from 'mongoose';

const SettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    themeColors: { type: String, default: null },
    themeTypography: { type: String, default: null },
  },
  { timestamps: true }
);

export type SettingsDocument = InferSchemaType<typeof SettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SettingsModel =
  mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
