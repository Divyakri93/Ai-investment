import { Router } from 'express';
import { z } from 'zod';
import { buildResearchGraph } from '../ai/graph.js';
import { ReportRepository } from '../models/Report.js';
import { attachUserIfPresent } from '../middleware/requireAuth.js';

const router = Router();

const ResearchRequestSchema = z.object({
  companyQuery: z
    .string()
    .trim()
    .min(1, 'Company query cannot be empty')
    .max(100, 'Company query exceeds maximum allowed length (100 chars)'),
  forceRefresh: z.boolean().optional().default(false)
});

router.post('/research', attachUserIfPresent, async (req, res) => {
  const parseResult = ResearchRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid input parameters',
      details: parseResult.error.errors.map((e) => e.message).join(', ')
    });
    return;
  }

  const { companyQuery, forceRefresh } = parseResult.data;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Performance Optimization: Check 24-hour cache if forceRefresh is false
  if (!forceRefresh) {
    try {
      const allReports = await ReportRepository.listReports();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const queryLower = companyQuery.toLowerCase();

      const cachedReport = allReports.find((rep) => {
        if (!rep) return false;
        const createdAt = new Date(rep.createdAt || 0).getTime();
        if (now - createdAt > twentyFourHours) return false;
        const nameMatch = (rep.companyName || '').toLowerCase() === queryLower;
        const tickerMatch = (rep.resolvedTicker || '').toLowerCase() === queryLower;
        return nameMatch || tickerMatch;
      });

      if (cachedReport) {
        sendEvent('log', {
          timestamp: new Date().toISOString(),
          node: 'cache',
          message: `⚡ Serving recent (<24h) archived institutional report for "${cachedReport.companyName}" (${cachedReport.resolvedTicker}) from cache.`
        });
        sendEvent('partial', {
          node: 'cache',
          state: cachedReport
        });
        sendEvent('final', {
          reportId: cachedReport._id || cachedReport.id || cachedReport.reportId,
          state: cachedReport,
          fromCache: true
        });
        res.end();
        return;
      }
    } catch (err) {
      console.warn('Cache lookup warning:', err.message);
    }
  }

  sendEvent('log', {
    timestamp: new Date().toISOString(),
    node: 'system',
    message: `Initiating LangGraph multi-agent research pipeline for: "${companyQuery}"`
  });

  try {
    const graph = buildResearchGraph();
    const initialState = {
      userId: req.user?.userId || null,
      companyQuery,
      logs: []
    };

    let accumulatedState = { ...initialState };
    const stream = await graph.stream(initialState);

    for await (const chunk of stream) {
      const nodeNames = Object.keys(chunk);
      for (const nodeName of nodeNames) {
        const nodeOutput = chunk[nodeName];
        accumulatedState = { ...accumulatedState, ...nodeOutput };

        if (nodeOutput.logs && Array.isArray(nodeOutput.logs)) {
          for (const msg of nodeOutput.logs) {
            sendEvent('log', {
              timestamp: new Date().toISOString(),
              node: nodeName,
              message: msg
            });
          }
        }
        sendEvent('partial', {
          node: nodeName,
          state: nodeOutput
        });
      }
    }

    sendEvent('final', {
      reportId: accumulatedState.reportId,
      state: accumulatedState
    });
    res.end();
  } catch (error) {
    console.error('Research stream error:', error);
    sendEvent('error', {
      error: `Pipeline error: ${error.message || 'Unknown failure occurred during research'}`
    });
    res.end();
  }
});

export default router;
