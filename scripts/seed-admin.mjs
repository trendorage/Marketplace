import { readFileSync } from 'fs';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { createHash } from 'crypto';

// Load .env.local if present
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // no .env.local
}

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
