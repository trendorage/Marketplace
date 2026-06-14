import mongoose from 'mongoose';
import { createHash } from 'crypto';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI env var required');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: '' },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

await mongoose.connect(MONGO_URI);

const email = process.env.SEED_EMAIL;
const seedPassword = process.env.SEED_PASSWORD;
if (!email || !seedPassword) {
  console.error('SEED_EMAIL and SEED_PASSWORD env vars required');
  process.exit(1);
}
const passwordHash = createHash('sha256').update(seedPassword).digest('hex');

const existing = await User.findOne({ email });
if (existing) {
  await User.updateOne({ email }, { role: 'admin', passwordHash });
  console.log('User updated → admin role');
} else {
  await User.create({ name: 'Giorgi', email, passwordHash, role: 'admin' });
  console.log('Admin user created');
}

await mongoose.disconnect();
