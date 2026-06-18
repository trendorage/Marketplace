import mongoose, { Schema, InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false, default: '' },
    avatar: { type: String, required: false },
    role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user', required: true },
    status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active', required: true },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel =
  mongoose.models.User || mongoose.model('User', UserSchema);
