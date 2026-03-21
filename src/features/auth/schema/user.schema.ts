import mongoose, { Schema, InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, required: false },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema>;

export const UserModel =
  mongoose.models.User || mongoose.model('User', UserSchema);
