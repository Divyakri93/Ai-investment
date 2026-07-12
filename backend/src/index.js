import './polyfill.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import researchRoutes from './routes/research.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

const checkEnvKey = (keyName) => {
  const val = process.env[keyName];
  if (!val || val.startsWith('your_')) {
    return '⚠️ MISSING OR PLACEHOLDER';
  }
  return '✅ CONFIGURED';
};

console.log('==================================================');
console.log('            INVESTIQ API STARTUP CHECK            ');
console.log('==================================================');
console.log(`LLM_PROVIDER   : ${process.env.LLM_PROVIDER || 'gemini'}`);
console.log(`LLM_API_KEY    : ${checkEnvKey('LLM_API_KEY')}`);
console.log(`FMP_API_KEY    : ${checkEnvKey('FMP_API_KEY')}`);
console.log(`TAVILY_API_KEY : ${checkEnvKey('TAVILY_API_KEY')}`);
console.log('==================================================');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/investiq';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB instance at: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(`⚠️ Local MongoDB connection failed (${err.message}). Using filesystem fallback storage.`);
  });

app.use('/api', researchRoutes);
app.use('/api', reportsRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'InvestIQ AI Research API (Pure JS)',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 InvestIQ Backend running on http://localhost:${PORT}`);
});
