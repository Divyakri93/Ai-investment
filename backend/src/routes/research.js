import { Router } from 'express';
import { buildResearchGraph } from '../ai/graph.js';

const router = Router();

router.post('/research', async (req, res) => {
  const { companyQuery } = req.body;
  if (!companyQuery || typeof companyQuery !== 'string') {
    res.status(400).json({ error: 'Missing valid companyQuery string in request body' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('log', {
    timestamp: new Date().toISOString(),
    node: 'system',
    message: `Initiating LangGraph multi-agent research pipeline for: "${companyQuery}"`
  });

  try {
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
      resolvedTicker: accumulatedState.resolvedTicker,
      resolvedCompanyName: accumulatedState.resolvedCompanyName,
      isPubliclyTraded: accumulatedState.isPubliclyTraded,
      verdict: accumulatedState.verdict,
      confidence: accumulatedState.confidence,
      scores: accumulatedState.scores,
      bullCase: accumulatedState.bullCase,
      bearCase: accumulatedState.bearCase,
      reasoningSummary: accumulatedState.reasoningSummary,
      sources: accumulatedState.sources,
      dataGaps: accumulatedState.dataGaps || [],
      fundamentalsData: accumulatedState.fundamentalsData,
      newsData: accumulatedState.newsData,
      competitiveData: accumulatedState.competitiveData,
      riskData: accumulatedState.riskData
    });
  } catch (err) {
    console.error('Error during LangGraph research execution:', err);
    sendEvent('error', {
      message: 'Research pipeline failed: ' + (err.message || 'Unknown error')
    });
  } finally {
    res.end();
  }
});

export default router;
