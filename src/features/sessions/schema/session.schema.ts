import mongoose, { Schema, InferSchemaType } from 'mongoose';

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export type SessionDocument = InferSchemaType<typeof SessionSchema>;

export const SessionModel =
  mongoose.models.Session || mongoose.model('Session', SessionSchema);
