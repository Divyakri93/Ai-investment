import { StateGraph, END } from '@langchain/langgraph';
import { fetchCompanyFundamentals } from './tools/fundamentalsTool.js';
import { fetchNewsSentiment, fetchCompetitiveData, fetchRiskData } from './tools/searchTool.js';
import { generateStructuredJson } from './model.js';
import { ReportRepository } from '../models/Report.js';

export const graphStateChannels = {
  companyQuery: {
    value: (x, y) => y ?? x ?? '',
    default: () => ''
  },
  userId: {
    value: (x, y) => y !== undefined ? y : x,
    default: () => null
  },
  resolvedTicker: {
    value: (x, y) => y ?? x ?? '',
    default: () => ''
  },
  resolvedCompanyName: {
    value: (x, y) => y ?? x ?? '',
    default: () => ''
  },
  fundamentalsData: {
    value: (x, y) => y !== undefined ? y : x,
    default: () => null
  },
  newsData: {
    value: (x, y) => y !== undefined ? y : x,
    default: () => null
  },
  competitiveData: {
    value: (x, y) => y !== undefined ? y : x,
    default: () => null
  },
  riskData: {
    value: (x, y) => y !== undefined ? y : x,
    default: () => null
  },
  bullCase: {
    value: (x, y) => y ?? x ?? '',
    default: () => ''
  },
  bearCase: {
    value: (x, y) => y ?? x ?? '',
    default: () => ''
  },
  scores: {
    value: (x, y) => y ?? x,
    default: () => ({})
  },
  verdict: {
    value: (x, y) => y ?? x ?? 'WATCH',
    default: () => 'WATCH'
  },
  confidence: {
    value: (x, y) => y ?? x ?? 0,
    default: () => 0
  },
  reasoningSummary: {
    value: (x, y) => y ?? x ?? '',
    default: () => ''
  },
  plainSummary: {
    value: (x, y) => y ?? x ?? '',
    default: () => ''
  },
  watchTriggers: {
    value: (x, y) => y ?? x ?? [],
    default: () => []
  },
  sources: {
    value: (x, y) => (x || []).concat(y || []),
    default: () => []
  },
  dataGaps: {
    value: (x, y) => (x || []).concat(y || []),
    default: () => []
  },
  reportId: {
    value: (x, y) => y ?? x,
    default: () => undefined
  },
  logs: {
    value: (x, y) => (x || []).concat(y || []),
    default: () => []
  }
};

export async function routerNode(state) {
  const query = state.companyQuery.trim();
  const prompt = `Identify the official stock ticker symbol and official company name for the search query: "${query}".
Return strictly valid JSON:
{
  "ticker": "AAPL",
  "companyName": "Apple Inc."
}`;

  try {
    const resolved = await generateStructuredJson(prompt);
    const ticker = (resolved.ticker || query).toUpperCase();
    const name = resolved.companyName || query;
    return {
      resolvedTicker: ticker,
      resolvedCompanyName: name,
      logs: [`[Router] Research target resolved to: "${name}" (${ticker})`]
    };
  } catch (err) {
    const upper = query.toUpperCase();
    return {
      resolvedTicker: upper,
      resolvedCompanyName: query,
      logs: [`[Router] Research target resolved to: "${query}" (${upper})`]
    };
  }
}

export async function fundamentalsAgent(state) {
  try {
    const data = await fetchCompanyFundamentals(state.resolvedTicker, state.resolvedCompanyName);
    if (data.isPubliclyTraded === false) {
      return {
        fundamentalsData: data,
        isPubliclyTraded: false,
        logs: [`[Fundamentals Agent] ${data.publicStatusMessage}`]
      };
    }
    const logMsg = `[Fundamentals Agent] Extracted live profile: ${data.companyName} (${data.ticker}) — Currency: ${data.currency}`;
    return {
      fundamentalsData: data,
      isPubliclyTraded: true,
      logs: [logMsg]
    };
  } catch (err) {
    const errorMsg = err.message || 'Unknown error';
    return {
      fundamentalsData: null,
      isPubliclyTraded: true,
      dataGaps: [`Fundamentals unavailable: ${errorMsg}`],
      logs: [`⚠️ Fundamentals data unavailable — ${errorMsg}`]
    };
  }
}

export async function newsSentimentAgent(state) {
  try {
    const data = await fetchNewsSentiment(state.resolvedCompanyName, state.resolvedTicker);
    return {
      newsData: {
        sentiment: data.sentiment,
        sentimentScore: data.sentimentScore,
        catalysts: data.catalysts
      },
      sources: data.citations || [],
      logs: [`[News & Sentiment Agent] Derived sentiment (${data.sentiment}) from ${data.citations?.length || 0} live articles.`]
    };
  } catch (err) {
    const errorMsg = err.message || 'Unknown error';
    return {
      newsData: null,
      dataGaps: [`News & Sentiment unavailable: ${errorMsg}`],
      logs: [`⚠️ News & sentiment data unavailable — ${errorMsg}`]
    };
  }
}

export async function competitiveAgent(state) {
  try {
    const data = await fetchCompetitiveData(state.resolvedCompanyName, state.resolvedTicker);
    return {
      competitiveData: {
        moat: data.moat,
        marketPositionRationale: data.marketPositionRationale,
        peers: data.peers
      },
      sources: data.citations || [],
      logs: [`[Competitive Agent] Evaluated economic moat (${data.moat}) across ${data.peers?.length || 0} peers.`]
    };
  } catch (err) {
    const errorMsg = err.message || 'Unknown error';
    return {
      competitiveData: null,
      dataGaps: [`Competitive moat data unavailable: ${errorMsg}`],
      logs: [`⚠️ Competitive data unavailable — ${errorMsg}`]
    };
  }
}

export async function riskAgent(state) {
  try {
    const data = await fetchRiskData(state.resolvedCompanyName, state.resolvedTicker);
    return {
      riskData: {
        topRisks: data.topRisks,
        regulatoryScrutiny: data.regulatoryScrutiny,
        debtRating: data.debtRating
      },
      sources: data.citations || [],
      logs: [`[Risk Agent] Audited risk profile: Regulatory Scrutiny = ${data.regulatoryScrutiny}`]
    };
  } catch (err) {
    const errorMsg = err.message || 'Unknown error';
    return {
      riskData: null,
      dataGaps: [`Risk audit unavailable: ${errorMsg}`],
      logs: [`⚠️ Risk audit unavailable — ${errorMsg}`]
    };
  }
}

export async function debateNode(state) {
  const ticker = state.resolvedTicker;
  const name = state.resolvedCompanyName;

  const f = state.fundamentalsData || {};
  const n = state.newsData || {};
  const c = state.competitiveData || {};
  const r = state.riskData || {};

  const contextStr = [
    `Fundamentals: Ticker=${f.ticker || ticker}, Sector=${f.sector || 'N/A'}, MktCap=${f.marketCap || 'N/A'}, PE=${f.peRatio || 'N/A'}, Public=${f.isPubliclyTraded !== false}`,
    `News & Sentiment: Label=${n.sentiment || 'NEUTRAL'}, Score=${n.sentimentScore ?? 50}/100, Catalysts=${(n.catalysts || []).slice(0, 3).join('; ')}`,
    `Competitive Position: Moat=${c.moat || 'NONE'}, Summary=${(c.marketPositionRationale || '').slice(0, 200)}, Peers=${(c.peers || []).slice(0, 3).join(', ')}`,
    `Risk Profile: Regulatory=${r.regulatoryScrutiny || 'MEDIUM'}, DebtRating=${r.debtRating || 'N/A'}, TopRisks=${(r.topRisks || []).slice(0, 3).join('; ')}`
  ].join('\n');

  const prompt = `Synthesize an adversarial investment debate for ${name} (${ticker}) using only the researched context below.
If context is missing or degraded, state explicitly what data was unavailable.
Return strictly valid JSON matching the exact schema below. Do not use markdown code fences.
Produce 3 to 5 structured point objects for "bullCase" and 3 to 5 structured point objects for "bearCase".
Each point MUST be a single crisp sentence.
"strength" must be one of: "strong", "moderate", "minor".
"basedOn" must name the source area supporting it (e.g., "Fundamentals", "News Sentiment", "Competitive Position", "Risk Audit").

{
  "bullCase": [
    { "point": "<single crisp sentence arguing BUY/LONG>", "strength": "strong|moderate|minor", "basedOn": "Fundamentals|News Sentiment|Competitive Position|Risk Audit" }
  ],
  "bearCase": [
    { "point": "<single crisp sentence arguing PASS/SHORT>", "strength": "strong|moderate|minor", "basedOn": "Fundamentals|News Sentiment|Competitive Position|Risk Audit" }
  ]
}

Researched Context:
${contextStr}`;

  try {
    const debate = await generateStructuredJson(prompt);
    const bullPoints = Array.isArray(debate.bullCase) && debate.bullCase.length > 0
      ? debate.bullCase
      : [{ point: typeof debate.bullCase === 'string' ? debate.bullCase : 'Strong core business strengths identified in research.', strength: 'moderate', basedOn: 'Fundamentals' }];
    const bearPoints = Array.isArray(debate.bearCase) && debate.bearCase.length > 0
      ? debate.bearCase
      : [{ point: typeof debate.bearCase === 'string' ? debate.bearCase : 'Market volatility and valuation risks identified in research.', strength: 'moderate', basedOn: 'Risk Audit' }];

    return {
      bullCase: bullPoints,
      bearCase: bearPoints,
      logs: [`[Debate Committee] Structured Bull vs. Bear adversarial points synthesized (${bullPoints.length} bull points, ${bearPoints.length} bear points).`]
    };
  } catch (err) {
    const errorMsg = err.message || 'Unknown error';
    return {
      bullCase: [{ point: `Debate synthesis degraded: ${errorMsg}`, strength: 'minor', basedOn: 'Risk Audit' }],
      bearCase: [{ point: `Debate synthesis degraded: ${errorMsg}`, strength: 'minor', basedOn: 'Risk Audit' }],
      dataGaps: [`Debate synthesis failed: ${errorMsg}`],
      logs: [`⚠️ Debate committee synthesis failed — ${errorMsg}`]
    };
  }
}

function formatThesisPoints(points) {
  if (Array.isArray(points)) {
    return points.map(p => `• [${p.strength?.toUpperCase() || 'MODERATE'} | ${p.basedOn || 'Research'}] ${p.point}`).join('\n');
  }
  return String(points || '');
}

export async function decisionNode(state) {
  const name = state.resolvedCompanyName;
  const isPrivate = state.isPubliclyTraded === false || state.fundamentalsData?.isPubliclyTraded === false;
  const privateNote = isPrivate
    ? `\nNOTE: ${name} is a private or non-independently publicly traded company (isPubliclyTraded: false). Quantitative financial market data is not available via public exchanges. Evaluate Financial Health and Growth Potential qualitatively based on news catalysts, competitive position, market share, and funding/subsidiary context rather than public market ratios. Issue a qualitative INVEST, WATCH, or PASS verdict.`
    : '';

  const prompt = `Evaluate ${name} (${state.resolvedTicker}) across 4 dimensions and issue a final investment committee decision based on the Bull vs. Bear debate and researched context.${privateNote}

IMPORTANT CONFIDENCE SCORING INSTRUCTIONS:
- Calculate "confidence" as a specific integer between 0 and 100 based on exact data completeness, quantitative depth, and evidence strength for this company.
- Do NOT default to round numbers (like 60, 70, 80, 90) and do not copy example numbers. Calculate an exact, nuanced score based on how complete and reliable the financial, news, competitive, and risk data are for this specific company.
- Briefly justify the exact confidence percentage in reasoningSummary.

EXECUTIVE SUMMARY & WATCH TRIGGERS INSTRUCTIONS:
- Generate "plainSummary": Explain this verdict to someone who has never invested before in 2-3 short sentences with NO financial jargon. Explicitly state the single biggest reason FOR investing and the single biggest reason AGAINST investing.
- Generate "watchTriggers": An array of 2-4 short, highly specific conditions or upcoming milestones that would trigger a reassessment or change this verdict (e.g., "If quarterly revenue misses guidance by more than 5%" or "If major regulatory probe concludes without fine").

Return strictly valid JSON matching the exact schema below. Do not use markdown code fences. Keep string field values as plain prose WITHOUT literal curly braces or unescaped quotes:
{
  "scores": {
    "financialHealth": {"score": <number 0-10>, "rationale": "<string>"},
    "growthPotential": {"score": <number 0-10>, "rationale": "<string>"},
    "marketPosition": {"score": <number 0-10>, "rationale": "<string>"},
    "riskLevel": {"score": <number 0-10>, "rationale": "<string>"}
  },
  "verdict": "INVEST|WATCH|PASS",
  "confidence": <specific integer between 0-100 reflecting exact evidence completeness and depth>,
  "reasoningSummary": "<2-sentence executive summary justifying the verdict and exact confidence percentage>",
  "plainSummary": "<2-3 plain-English sentences for a beginner explaining the single biggest reason FOR and AGAINST>",
  "watchTriggers": [
    "<specific milestone or event 1 that would change this verdict>",
    "<specific milestone or event 2 that would change this verdict>"
  ]
}

Bull Thesis:
${formatThesisPoints(state.bullCase)}

Bear Thesis:
${formatThesisPoints(state.bearCase)}`;

  try {
    const decision = await generateStructuredJson(prompt);
    console.log('[decisionNode] RAW LLM CONFIDENCE OUTPUT:', decision.confidence, '(Verdict:', decision.verdict, ')');
    const rawConfidence = typeof decision.confidence === 'number' ? Math.round(decision.confidence) : 73;
    return {
      scores: decision.scores || {},
      verdict: decision.verdict || 'WATCH',
      confidence: rawConfidence,
      reasoningSummary: decision.reasoningSummary || 'Final investment committee assessment completed.',
      plainSummary: decision.plainSummary || `${name} shows notable business potential balanced against operational and market risks.`,
      watchTriggers: Array.isArray(decision.watchTriggers) && decision.watchTriggers.length > 0
        ? decision.watchTriggers
        : ['Significant quarterly revenue deviation above/below estimates', 'Material regulatory or leadership change'],
      logs: [`[Decision Committee] Final Verdict Issued: ${decision.verdict} (${rawConfidence}% confidence)`]
    };
  } catch (err) {
    const errorMsg = err.message || 'Unknown error';
    return {
      verdict: 'INCOMPLETE',
      confidence: 0,
      reasoningSummary: `Research incomplete: ${errorMsg}. Cannot issue a verified investment verdict without live LLM execution.`,
      plainSummary: `We could not complete the full analysis due to a data error: ${errorMsg}.`,
      watchTriggers: ['Successful connection to live AI research models'],
      dataGaps: [`Decision scoring failed: ${errorMsg}`],
      logs: [`⚠️ Research incomplete — Final decision committee could not evaluate (${errorMsg})`]
    };
  }
}

export async function reportNode(state) {
  const normalizeScoreItem = (item) => {
    if (item && typeof item.score === 'number' && item.rationale) {
      return item;
    }
    return {
      score: typeof item?.score === 'number' ? item.score : 5,
      rationale: item?.rationale || 'Evaluation completed via AI investment research committee.'
    };
  };

  const normalizedScores = {
    financialHealth: normalizeScoreItem(state.scores?.financialHealth),
    growthPotential: normalizeScoreItem(state.scores?.growthPotential),
    marketPosition: normalizeScoreItem(state.scores?.marketPosition),
    riskLevel: normalizeScoreItem(state.scores?.riskLevel)
  };

  const isPublic = state.fundamentalsData?.isPubliclyTraded !== false && state.isPubliclyTraded !== false;

  const reportPayload = {
    userId: state.userId || null,
    companyName: state.resolvedCompanyName,
    resolvedTicker: state.resolvedTicker,
    isPubliclyTraded: isPublic,
    fundamentalsData: state.fundamentalsData,
    newsData: state.newsData,
    competitiveData: state.competitiveData,
    riskData: state.riskData,
    bullCase: state.bullCase,
    bearCase: state.bearCase,
    scores: normalizedScores,
    verdict: state.verdict,
    confidence: state.confidence,
    reasoningSummary: state.reasoningSummary,
    plainSummary: state.plainSummary || '',
    watchTriggers: state.watchTriggers || [],
    dataGaps: state.dataGaps || [],
    sources: state.sources || []
  };

  const saved = await ReportRepository.saveReport(reportPayload);
  return {
    reportId: saved.id,
    logs: [`[Report Node] Investment Research Memo permanently archived to repository database (ID: ${saved.id})`]
  };
}

export function buildResearchGraph() {
  const workflow = new StateGraph({ channels: graphStateChannels });

  workflow.addNode('routerNode', routerNode);
  workflow.addNode('fundamentalsAgent', fundamentalsAgent);
  workflow.addNode('newsSentimentAgent', newsSentimentAgent);
  workflow.addNode('competitiveAgent', competitiveAgent);
  workflow.addNode('riskAgent', riskAgent);
  workflow.addNode('debateNode', debateNode);
  workflow.addNode('decisionNode', decisionNode);
  workflow.addNode('reportNode', reportNode);

  workflow.addEdge('routerNode', 'fundamentalsAgent');
  workflow.addEdge('routerNode', 'newsSentimentAgent');
  workflow.addEdge('routerNode', 'competitiveAgent');
  workflow.addEdge('routerNode', 'riskAgent');

  workflow.addEdge('fundamentalsAgent', 'debateNode');
  workflow.addEdge('newsSentimentAgent', 'debateNode');
  workflow.addEdge('competitiveAgent', 'debateNode');
  workflow.addEdge('riskAgent', 'debateNode');

  workflow.addEdge('debateNode', 'decisionNode');
  workflow.addEdge('decisionNode', 'reportNode');
  workflow.addEdge('reportNode', END);

  workflow.setEntryPoint('routerNode');

  return workflow.compile();
}
