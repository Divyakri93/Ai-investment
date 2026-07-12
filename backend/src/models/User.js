import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    lastLoginAt: { type: Date }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const LOCAL_USERS_FILE = path.join(__dirname, '../../data/users.json');

function ensureLocalFile() {
  const dir = path.dirname(LOCAL_USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_USERS_FILE)) {
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function sanitizeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  return obj;
}

export class UserRepository {
  static async isMongoConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  static async findByEmailWithPassword(email) {
    if (!email) return null;
    const normalizedEmail = String(email).toLowerCase().trim();

    if (await this.isMongoConnected()) {
      try {
        const user = await UserModel.findOne({ email: normalizedEmail }).lean().exec();
        if (user) return user;
      } catch (err) {
        console.warn('MongoDB User findOne warning, falling back to local storage:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
    const users = JSON.parse(raw);
    return users.find((u) => u.email === normalizedEmail) || null;
  }

  static async findByEmail(email) {
    const user = await this.findByEmailWithPassword(email);
    return sanitizeUser(user);
  }

  static async findById(id) {
    if (!id) return null;

    if (await this.isMongoConnected()) {
      try {
        const user = await UserModel.findById(id).lean().exec();
        if (user) return sanitizeUser(user);
      } catch (err) {
        console.warn('MongoDB User findById warning, falling back to local storage:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
    const users = JSON.parse(raw);
    const user = users.find((u) => (u._id || u.id) === String(id)) || null;
    return sanitizeUser(user);
  }

  static async createUser({ name, email, passwordHash }) {
    const normalizedEmail = String(email).toLowerCase().trim();
    const now = new Date().toISOString();

    if (await this.isMongoConnected()) {
      try {
        const user = new UserModel({
          name,
          email: normalizedEmail,
          passwordHash,
          lastLoginAt: new Date()
        });
        const saved = await user.save();
        return sanitizeUser(saved);
      } catch (err) {
        console.warn('MongoDB User save warning, falling back to local storage:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
    const users = JSON.parse(raw);
    const id = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
    const newUser = {
      _id: id,
      id,
      name,
      email: normalizedEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };
    users.push(newUser);
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return sanitizeUser(newUser);
  }

  static async updateLastLogin(id) {
    if (!id) return;
    const now = new Date();

    if (await this.isMongoConnected()) {
      try {
        await UserModel.findByIdAndUpdate(id, { lastLoginAt: now }).exec();
        return;
      } catch (err) {
        console.warn('MongoDB User updateLastLogin warning:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
    const users = JSON.parse(raw);
    const idx = users.findIndex((u) => (u._id || u.id) === String(id));
    if (idx !== -1) {
      users[idx].lastLoginAt = now.toISOString();
      fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    }
  }
}
