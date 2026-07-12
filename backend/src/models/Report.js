import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ScoreItemSchema = new Schema({
  score: { type: Number, required: false, default: 5, min: 0, max: 10 },
  rationale: { type: String, required: false, default: 'Evaluation completed via AI committee.' }
}, { _id: false });

const ReportSchema = new Schema({
  companyName: { type: String, required: true, index: true },
  resolvedTicker: { type: String, required: true, index: true },
  isPubliclyTraded: { type: Boolean, default: true },
  fundamentalsData: { type: Schema.Types.Mixed, default: {} },
  newsData: { type: Schema.Types.Mixed, default: {} },
  competitiveData: { type: Schema.Types.Mixed, default: {} },
  riskData: { type: Schema.Types.Mixed, default: {} },
  bullCase: { type: Schema.Types.Mixed, required: true },
  bearCase: { type: Schema.Types.Mixed, required: true },
  plainSummary: { type: String, default: '' },
  watchTriggers: [{ type: String }],
  scores: {
    financialHealth: { type: ScoreItemSchema, required: false },
    growthPotential: { type: ScoreItemSchema, required: false },
    marketPosition: { type: ScoreItemSchema, required: false },
    riskLevel: { type: ScoreItemSchema, required: false }
  },
  verdict: {
    type: String,
    enum: ['INVEST', 'PASS', 'WATCH', 'INCOMPLETE'],
    required: true
  },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  reasoningSummary: { type: String, required: true },
  dataGaps: [{ type: String }],
  sources: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, default: 'General' }
  }]
}, {
  timestamps: true
});

export const ReportModel = mongoose.models.Report || mongoose.model('Report', ReportSchema);

const LOCAL_DATA_FILE = path.join(__dirname, '../../data/reports.json');

function ensureLocalFile() {
  const dir = path.dirname(LOCAL_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DATA_FILE)) {
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export class ReportRepository {
  static async isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  static async saveReport(data) {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        const report = new ReportModel(data);
        const saved = await report.save();
        return { id: saved._id.toString(), report: saved };
      } catch (err) {
        console.warn('MongoDB save error, falling back to local file storage:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
    const list = JSON.parse(raw);
    const id = 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
    const newEntry = {
      ...data,
      _id: id,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
    };
    list.unshift(newEntry);
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return {
      id,
      report: {
        ...newEntry,
        createdAt: new Date(newEntry.createdAt)
      }
    };
  }

  static async listReports() {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        const reports = await ReportModel.find().sort({ createdAt: -1 }).limit(50).lean();
        return reports;
      } catch (err) {
        console.warn('MongoDB query error, falling back to local file:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  }

  static async getReportById(id) {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        const report = await ReportModel.findById(id).lean();
        if (report) return report;
      } catch (err) {
        // Fallthrough
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
    const list = JSON.parse(raw);
    return list.find((item) => item._id === id) || null;
  }

  static async deleteReportById(id) {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        const deleted = await ReportModel.findByIdAndDelete(id);
        if (deleted) return true;
      } catch (err) {
        // Fallthrough to local file check
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
    const list = JSON.parse(raw);
    const initialLen = list.length;
    const updated = list.filter((item) => item._id !== id);
    if (updated.length !== initialLen) {
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      return true;
    }
    return false;
  }

  static async deleteAllReports() {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        await ReportModel.deleteMany({});
      } catch (err) {
        // Fallthrough
      }
    }
    ensureLocalFile();
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    return true;
  }
}
