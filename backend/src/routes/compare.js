import { Router } from 'express';
import { z } from 'zod';
import { ReportRepository } from '../models/Report.js';
import { ComparisonRepository } from '../models/Comparison.js';
import { buildResearchGraph } from '../ai/graph.js';
import { runComparisonNode } from '../ai/comparison.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

const CompareRequestSchema = z.object({
  companyA: z.string().trim().min(1, 'Company A cannot be empty').max(100),
  companyB: z.string().trim().min(1, 'Company B cannot be empty').max(100)
});

router.get('/compare/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const comparison = await ComparisonRepository.getComparisonById(id);
    if (!comparison) {
      res.status(404).json({ error: 'Comparison not found' });
      return;
    }

    const reportA = await ReportRepository.getReportById(comparison.reportAId);
    const reportB = await ReportRepository.getReportById(comparison.reportBId);

    res.json({
      comparison,
      reportA,
      reportB
    });
  } catch (err) {
    console.error('Error fetching comparison:', err);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

router.get('/comparisons', requireAuth, async (req, res) => {
  try {
    const comparisons = await ComparisonRepository.listComparisons(req.user.userId);
    res.json(comparisons);
  } catch (err) {
    console.error('Error listing comparisons:', err);
    res.status(500).json({ error: 'Failed to list comparisons' });
  }
});

router.post('/compare', requireAuth, async (req, res) => {
  const parseResult = CompareRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid comparison request input',
      details: parseResult.error.errors.map(e => e.message).join(', ')
    });
    return;
  }
  const { companyA, companyB } = parseResult.data;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('log', {
    company: 'A',
    timestamp: new Date().toISOString(),
    node: 'system',
    message: `Initiating institutional evaluation for Company A: "${companyA}"`
  });
  sendEvent('log', {
    company: 'B',
    timestamp: new Date().toISOString(),
    node: 'system',
    message: `Initiating institutional evaluation for Company B: "${companyB}"`
  });

  const getOrResearch = async (companyQuery, tag) => {
    // Check for recent (<24h) report matching companyName or resolvedTicker
    const allReports = await ReportRepository.listReports();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const queryLower = companyQuery.trim().toLowerCase();

    const recentMatch = allReports.find((rep) => {
      if (!rep) return false;
      const createdAt = new Date(rep.createdAt || 0).getTime();
      if (now - createdAt > twentyFourHours) return false;
      const nameMatch = (rep.companyName || '').toLowerCase() === queryLower;
      const tickerMatch = (rep.resolvedTicker || '').toLowerCase() === queryLower;
      return nameMatch || tickerMatch;
    });

    if (recentMatch) {
      sendEvent('log', {
        company: tag,
        timestamp: new Date().toISOString(),
        node: 'cache',
        message: `✅ Found recent (<24h) research memo for "${recentMatch.companyName}" (${recentMatch.resolvedTicker}). Reusing archived analysis...`
      });
      sendEvent('partial', {
        company: tag,
        node: 'cache',
        state: recentMatch
      });
      return recentMatch;
    }

    sendEvent('log', {
      company: tag,
      timestamp: new Date().toISOString(),
      node: 'system',
      message: `🚀 Launching multi-agent research sweep for "${companyQuery}"...`
    });

    const graph = buildResearchGraph();
    const initialState = {
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
              company: tag,
              timestamp: new Date().toISOString(),
              node: nodeName,
              message: msg
            });
          }
        }
        sendEvent('partial', {
          company: tag,
          node: nodeName,
          state: nodeOutput
        });
      }
    }

    const saved = await ReportRepository.getReportById(accumulatedState.reportId);
    return saved || accumulatedState;
  };

  try {
    // Run research for A and B concurrently via Promise.all
    const [reportA, reportB] = await Promise.all([
      getOrResearch(companyA, 'A'),
      getOrResearch(companyB, 'B')
    ]);

    sendEvent('log', {
      company: 'A',
      timestamp: new Date().toISOString(),
      node: 'comparison',
      message: 'Synthesizing institutional head-to-head comparison memo...'
    });
    sendEvent('log', {
      company: 'B',
      timestamp: new Date().toISOString(),
      node: 'comparison',
      message: 'Synthesizing institutional head-to-head comparison memo...'
    });

    const comparisonResult = await runComparisonNode(reportA, reportB);

    const savedComparison = await ComparisonRepository.saveComparison({
      userId: req.user?.userId || null,
      companyA: reportA.companyName || companyA,
      companyB: reportB.companyName || companyB,
      reportAId: String(reportA._id || reportA.reportId || reportA.id || 'A'),
      reportBId: String(reportB._id || reportB.reportId || reportB.id || 'B'),
      comparisonResult
    });

    sendEvent('final', {
      comparisonId: savedComparison._id || savedComparison.id,
      reportA,
      reportB,
      comparisonResult
    });
    res.end();
  } catch (err) {
    console.error('Compare Mode pipeline error:', err);
    sendEvent('error', { error: `Comparison failed: ${err.message}` });
    res.end();
  }
});

export default router;
