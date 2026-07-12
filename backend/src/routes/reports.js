import { Router } from 'express';
import { ReportRepository } from '../models/Report.js';
import { ChatRepository } from '../models/Chat.js';
import { generateInvestmentMemoPDF } from '../services/pdfService.js';
import { getModel, withTimeout } from '../ai/model.js';

const router = Router();

router.get('/reports', async (req, res) => {
  try {
    const reports = await ReportRepository.listReports();
    res.json(reports);
  } catch (err) {
    console.error('Error listing reports:', err);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const report = await ReportRepository.getReportById(String(req.params.id));
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json(report);
  } catch (err) {
    console.error('Error fetching report details:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.get('/reports/:id/pdf', async (req, res) => {
  try {
    const report = await ReportRepository.getReportById(String(req.params.id));
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const pdfBuffer = await generateInvestmentMemoPDF(report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="InvestIQ_Memo_${report.resolvedTicker || 'Report'}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF memo:', err);
    res.status(500).json({ error: 'Failed to generate PDF memo' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const success = await ReportRepository.deleteReportById(String(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Report not found or already deleted' });
      return;
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

router.delete('/reports', async (req, res) => {
  try {
    await ReportRepository.deleteAllReports();
    res.json({ success: true, message: 'All reports cleared successfully' });
  } catch (err) {
    console.error('Error clearing all reports:', err);
    res.status(500).json({ error: 'Failed to clear all reports' });
  }
});

router.post('/reports/:id/ask', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || !String(question).trim()) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const report = await ReportRepository.getReportById(String(req.params.id));
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const contextStr = JSON.stringify({
      company: `${report.companyName} (${report.resolvedTicker})`,
      verdict: report.verdict,
      confidence: report.confidence,
      executiveSummary: report.plainSummary || report.reasoningSummary,
      scores: report.scores,
      fundamentals: report.fundamentalsData,
      newsAndSentiment: report.newsData,
      competitivePosition: report.competitiveData,
      riskAudit: report.riskData,
      bullCase: report.bullCase,
      bearCase: report.bearCase,
      watchTriggers: report.watchTriggers,
      sources: report.sources
    }, null, 2);

    const model = getModel({ temperature: 0.2 });
    const response = await withTimeout(
      model.invoke([
        [
          'system',
          'You are InvestIQ Institutional AI Assistant. Answer the user follow-up question strictly grounded in the research report context provided below. Do NOT invent or hallucinate facts outside the provided context. If context does not contain the answer, state clearly what data is available in the report.'
        ],
        [
          'user',
          `Follow-up Question: ${question}\n\nResearch Report Context:\n${contextStr}`
        ]
      ]),
      20000,
      'Answer generation timed out after 20s'
    );

    const answer = response?.content ? response.content.toString().trim() : 'Unable to generate answer.';
    res.json({ answer });
  } catch (err) {
    console.error('Error in /reports/:id/ask:', err);
    res.status(500).json({ error: `Failed to answer question: ${err.message || 'Unknown error'}` });
  }
});

function formatReportContext(report) {
  const formatArray = (arr) => {
    if (!Array.isArray(arr)) return String(arr || 'N/A');
    return arr.map((item) => {
      if (typeof item === 'object') return `• [${item.strength || 'Moderate'} | ${item.basedOn || 'Research'}] ${item.point || ''}`;
      return `• ${item}`;
    }).join('\n');
  };

  const f = report.fundamentalsData || {};
  const n = report.newsData || {};
  const c = report.competitiveData || {};
  const r = report.riskData || {};
  const s = report.scores || {};

  return [
    `COMPANY: ${report.companyName} (${report.resolvedTicker}) | PUBLICLY TRADED: ${report.isPubliclyTraded !== false}`,
    `VERDICT: ${report.verdict} (${report.confidence}% Institutional Confidence)`,
    `EXECUTIVE SUMMARY: ${report.plainSummary || report.reasoningSummary || 'N/A'}`,
    `DIMENSION SCORES:`,
    `- Financial Health: ${s.financialHealth?.score ?? 'N/A'}/10 (${s.financialHealth?.rationale || ''})`,
    `- Growth Potential: ${s.growthPotential?.score ?? 'N/A'}/10 (${s.growthPotential?.rationale || ''})`,
    `- Market Position: ${s.marketPosition?.score ?? 'N/A'}/10 (${s.marketPosition?.rationale || ''})`,
    `- Risk Level: ${s.riskLevel?.score ?? 'N/A'}/10 (${s.riskLevel?.rationale || ''})`,
    `FUNDAMENTALS PROFILE:`,
    `- Market Cap: ${f.mktCap || 'N/A'} ${f.currency || ''} | P/E Ratio: ${f.pe ?? 'N/A'} | Price: ${f.price ?? 'N/A'}`,
    `- Revenue/Growth Notes: ${JSON.stringify(f.revenueGrowth || f.growthNotes || 'N/A')}`,
    `NEWS & SENTIMENT:`,
    `- Sentiment Label: ${n.sentimentLabel || 'Neutral'} (${n.sentimentScore || 0})`,
    `- Key Catalysts: ${Array.isArray(n.catalysts) ? n.catalysts.join('; ') : String(n.catalysts || 'None listed')}`,
    `COMPETITIVE POSITION & MOAT:`,
    `- Moat Rating: ${c.moat || 'Moderate'}`,
    `- Market Position Rationale: ${c.marketPositionRationale || 'N/A'}`,
    `- Key Peers: ${Array.isArray(c.peers) ? c.peers.join(', ') : String(c.peers || 'N/A')}`,
    `INSTITUTIONAL RISK AUDIT:`,
    `- Regulatory Scrutiny: ${r.regulatoryScrutiny || 'N/A'}`,
    `- Top Identified Risks: ${Array.isArray(r.topRisks) ? r.topRisks.join('; ') : String(r.topRisks || 'N/A')}`,
    `BULL ANALYST THESIS:`,
    formatArray(report.bullCase),
    `BEAR ANALYST THESIS:`,
    formatArray(report.bearCase),
    `WATCH TRIGGERS:`,
    formatArray(report.watchTriggers),
    `PRIMARY SOURCES CITED:`,
    (report.sources || []).slice(0, 5).map(src => `- ${src.title} (${src.url})`).join('\n')
  ].join('\n\n');
}

router.get('/reports/:id/chat', async (req, res) => {
  try {
    const reportId = String(req.params.id);
    const report = await ReportRepository.getReportById(reportId);
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const chat = await ChatRepository.getOrCreateChat(reportId);
    res.json({ messages: chat.messages || [] });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

router.post('/reports/:id/chat', async (req, res) => {
  try {
    const reportId = String(req.params.id);
    const { message } = req.body || {};

    if (!message || !String(message).trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!ChatRepository.checkRateLimit(reportId, 20)) {
      res.status(429).json({ error: 'Rate limit exceeded: maximum 20 messages per report per hour.' });
      return;
    }

    const report = await ReportRepository.getReportById(reportId);
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    await ChatRepository.appendMessage(reportId, 'user', message.trim());
    const chat = await ChatRepository.getOrCreateChat(reportId);

    const contextBlock = formatReportContext(report);
    const companyName = report.companyName || report.resolvedCompanyName || report.resolvedTicker;

    const systemPrompt = [
      `You are InvestIQ's research assistant for ${companyName}. Answer the user's question using the research data provided above as your primary source.`,
      `If the question can be answered from the provided research data, answer directly and cite which part of the research you're drawing from (e.g. 'Per the Risk Audit...').`,
      `If the question goes beyond what was researched (e.g. general investing concepts, comparisons to companies not in this report, hypothetical scenarios), you may answer using general knowledge, but you MUST clearly prefix that part of the answer with something like 'Beyond what I researched for ${companyName}:' so the user always knows which parts are grounded in this specific research run versus general knowledge.`,
      `Never invent specific numbers, dates, or facts about ${companyName} that aren't in the provided research data. If you don't know a specific figure, say so plainly instead of estimating one.`,
      `Keep answers conversational and concise — a few sentences or a short bulleted list, not an essay, unless the user explicitly asks for depth.`
    ].join(' ');

    const recentTurns = (chat.messages || []).slice(-10).map((m) => [
      m.role === 'user' ? 'user' : 'assistant',
      m.content
    ]);

    const messagesForLLM = [
      ['system', `RESEARCH DATA CONTEXT FOR ${companyName.toUpperCase()}:\n\n${contextBlock}\n\nINSTRUCTIONS:\n${systemPrompt}`],
      ...recentTurns
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const model = getModel({ temperature: 0.3 });
    let fullAssistantResponse = '';

    try {
      const stream = await model.stream(messagesForLLM);
      for await (const chunk of stream) {
        const token = chunk?.content ? chunk.content.toString() : '';
        if (token) {
          fullAssistantResponse += token;
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }
    } catch (llmErr) {
      console.error('LLM streaming error in /reports/:id/chat:', llmErr);
      const fallbackMsg = `\n[Error generating response: ${llmErr.message}]`;
      fullAssistantResponse += fallbackMsg;
      res.write(`data: ${JSON.stringify({ token: fallbackMsg })}\n\n`);
    }

    await ChatRepository.appendMessage(reportId, 'assistant', fullAssistantResponse || 'No response generated.');
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Error in POST /reports/:id/chat:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: `Failed to process chat: ${err.message}` });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
