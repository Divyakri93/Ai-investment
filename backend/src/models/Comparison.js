import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CategoryComparisonSchema = new Schema({
  category: { type: String, required: true },
  winner: { type: String, enum: ['A', 'B', 'TIE'], required: true },
  note: { type: String, required: true }
}, { _id: false });

const ComparisonResultSchema = new Schema({
  winner: { type: String, enum: ['A', 'B', 'TOO_CLOSE'], required: true },
  winnerReasoning: { type: String, required: true },
  categoryComparison: [CategoryComparisonSchema],
  investorFitNote: { type: String, required: true }
}, { _id: false });

const ComparisonSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  companyA: { type: String, required: true, index: true },
  companyB: { type: String, required: true, index: true },
  reportAId: { type: String, required: true },
  reportBId: { type: String, required: true },
  comparisonResult: { type: ComparisonResultSchema, required: true }
}, {
  timestamps: true
});

export const ComparisonModel = mongoose.models.Comparison || mongoose.model('Comparison', ComparisonSchema);

const LOCAL_COMPARISONS_FILE = path.join(__dirname, '../../local_comparisons.json');

function ensureLocalFile() {
  if (!fs.existsSync(LOCAL_COMPARISONS_FILE)) {
    fs.writeFileSync(LOCAL_COMPARISONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export class ComparisonRepository {
  static async isMongoConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  static async saveComparison(payload) {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        const doc = await ComparisonModel.create(payload);
        return doc.toObject();
      } catch (err) {
        console.warn('MongoDB saveComparison error, falling back to local file:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_COMPARISONS_FILE, 'utf-8');
    const list = JSON.parse(raw);
    const id = 'local-cmp-' + Math.random().toString(36).substring(2, 10);
    const newDoc = {
      _id: id,
      id,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newDoc);
    fs.writeFileSync(LOCAL_COMPARISONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return newDoc;
  }

  static async getComparisonById(id) {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        const doc = await ComparisonModel.findById(id).lean();
        if (doc) return doc;
      } catch (err) {
        // Fallthrough
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_COMPARISONS_FILE, 'utf-8');
    const list = JSON.parse(raw);
    return list.find(item => String(item._id) === String(id) || String(item.id) === String(id)) || null;
  }

  static async listComparisons(userId = null) {
    const filter = userId ? { userId } : {};
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        return await ComparisonModel.find(filter).sort({ createdAt: -1 }).limit(50).lean();
      } catch (err) {
        console.warn('MongoDB query error, falling back to local file:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_COMPARISONS_FILE, 'utf-8');
    const list = JSON.parse(raw);
    if (userId) {
      return list.filter((item) => String(item.userId) === String(userId));
    }
    return list;
  }
}
