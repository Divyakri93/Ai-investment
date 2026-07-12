import './polyfill.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import researchRoutes from './routes/research.js';
import reportsRoutes from './routes/reports.js';
import compareRoutes from './routes/compare.js';
import authRoutes from './routes/auth.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const requiredEnvVars = ['LLM_API_KEY'];
const missingVars = requiredEnvVars.filter(
  (key) => !process.env[key] || process.env[key].startsWith('your_')
);

if (missingVars.length > 0) {
  console.error('❌ CRITICAL STARTUP ERROR: Missing required environment variables:');
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error('Please configure your .env file before starting the InvestIQ API.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(cookieParser());
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

const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/investiq';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB instance at: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(
      `⚠️ Local MongoDB connection failed (${err.message}). Using filesystem fallback storage.`
    );
  });

// Apply rate limiter to expensive AI routes
app.use('/api/research', apiRateLimiter);
app.use('/api/compare', apiRateLimiter);
app.use('/api/reports/:id/chat', apiRateLimiter);

app.use('/api', authRoutes);
app.use('/api', researchRoutes);
app.use('/api', reportsRoutes);
app.use('/api', compareRoutes);

const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    mongoConnected: mongoose.connection && mongoose.connection.readyState === 1,
    llmProviderConfigured: Boolean(process.env.LLM_API_KEY && !process.env.LLM_API_KEY.startsWith('your_')),
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled route exception:', err);
  const sanitizedMessage = 'An internal server error occurred processing the request.';
  res.status(500).json({ error: sanitizedMessage });
});

app.listen(PORT, () => {
  console.log(`🚀 InvestIQ Backend running on http://localhost:${PORT}`);
});
