import mongoose, { Schema, InferSchemaType } from 'mongoose';

const SettingsSchema = new Schema(
  {
    siteName: { type: String, default: 'Trendora' },
    siteUrl: { type: String, default: 'https://trendora.ge' },
    supportEmail: { type: String, default: 'support@trendora.ge' },
    defaultCommission: { type: Number, default: 10 },
    sellerCommission: { type: Number, default: 8 },
    minPayout: { type: Number, default: 50 },
    emailNewOrder: { type: Boolean, default: true },
    emailNewUser: { type: Boolean, default: true },
    emailNewSeller: { type: Boolean, default: true },
    emailLowStock: { type: Boolean, default: false },
    emailSystem: { type: Boolean, default: true },
    themeColors: { type: String, default: '' },
    themeTypography: { type: String, default: '' },
  },
  { timestamps: true }
);

export type SettingsDocument = InferSchemaType<typeof SettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SettingsModel =
  mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
