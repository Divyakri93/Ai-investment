import mongoose, { Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ChatMessageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatSchema = new Schema({
  reportId: { type: String, required: true, index: true, unique: true },
  messages: [ChatMessageSchema]
}, {
  timestamps: true
});

export const ChatModel = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

const LOCAL_CHATS_FILE = path.join(__dirname, '../../local_chats.json');

function ensureLocalFile() {
  if (!fs.existsSync(LOCAL_CHATS_FILE)) {
    fs.writeFileSync(LOCAL_CHATS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// In-memory rate limiter tracker: { [reportId]: [timestampMs, ...] }
const rateLimitMap = new Map();

export class ChatRepository {
  static async isMongoConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  static checkRateLimit(reportId, maxPerHour = 20) {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const timestamps = rateLimitMap.get(reportId) || [];
    const recent = timestamps.filter(ts => ts > oneHourAgo);
    if (recent.length >= maxPerHour) {
      return false;
    }
    recent.push(now);
    rateLimitMap.set(reportId, recent);
    return true;
  }

  static async getChatByReportId(reportId) {
    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        const chat = await ChatModel.findOne({ reportId }).lean();
        return chat || null;
      } catch (err) {
        console.warn('MongoDB query error for Chat, falling back to local file:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_CHATS_FILE, 'utf-8');
    const list = JSON.parse(raw);
    return list.find((c) => String(c.reportId) === String(reportId)) || null;
  }

  static async getOrCreateChat(reportId) {
    let chat = await this.getChatByReportId(reportId);
    if (!chat) {
      chat = {
        reportId: String(reportId),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const connected = await this.isMongoConnected();
      if (connected) {
        try {
          const doc = await ChatModel.create({ reportId: String(reportId), messages: [] });
          return doc.toObject();
        } catch (err) {
          // Fallthrough to local file save
        }
      }

      ensureLocalFile();
      const raw = fs.readFileSync(LOCAL_CHATS_FILE, 'utf-8');
      const list = JSON.parse(raw);
      list.push(chat);
      fs.writeFileSync(LOCAL_CHATS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    }
    return chat;
  }

  static async appendMessage(reportId, role, content) {
    const newMessage = {
      role,
      content,
      timestamp: new Date()
    };

    const connected = await this.isMongoConnected();
    if (connected) {
      try {
        let doc = await ChatModel.findOne({ reportId });
        if (!doc) {
          doc = await ChatModel.create({ reportId: String(reportId), messages: [newMessage] });
          return doc.toObject();
        }
        doc.messages.push(newMessage);
        await doc.save();
        return doc.toObject();
      } catch (err) {
        console.warn('MongoDB appendMessage error, falling back to local file:', err.message);
      }
    }

    ensureLocalFile();
    const raw = fs.readFileSync(LOCAL_CHATS_FILE, 'utf-8');
    const list = JSON.parse(raw);
    let chatIndex = list.findIndex((c) => String(c.reportId) === String(reportId));
    if (chatIndex === -1) {
      const newChat = {
        reportId: String(reportId),
        messages: [newMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(newChat);
      fs.writeFileSync(LOCAL_CHATS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      return newChat;
    } else {
      list[chatIndex].messages.push(newMessage);
      list[chatIndex].updatedAt = new Date().toISOString();
      fs.writeFileSync(LOCAL_CHATS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      return list[chatIndex];
    }
  }
}
