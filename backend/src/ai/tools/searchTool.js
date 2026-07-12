import dotenv from 'dotenv';
import { MissingApiKeyError, DataFetchError, generateStructuredJson } from '../model.js';
dotenv.config();

export async function searchFinancialNews(query, topicSuffix = 'investment research earnings catalyst') {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey || apiKey === 'your_tavily_api_key_here') {
    throw new MissingApiKeyError('TAVILY_API_KEY not configured in .env');
  }

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({
      api_key: apiKey,
      query: `${query} ${topicSuffix}`,
      search_depth: 'basic',
      max_results: 5
    })
  });

  if (!res.ok) {
    throw new DataFetchError(`Tavily search request failed with status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const results = data.results || [];

  if (results.length === 0) {
    throw new DataFetchError(`Tavily search returned 0 results for query: "${query} ${topicSuffix}"`);
  }

  const citations = results.map((r) => ({
    title: r.title || 'Live Financial Web Search Result',
    url: r.url,
    snippet: r.content || r.snippet || '',
    category: 'Live Financial Web Search'
  }));

  return { query, citations };
}

export async function fetchNewsSentiment(companyName, ticker) {
  const searchResult = await searchFinancialNews(companyName, 'latest news catalysts sentiment earnings');
  const articlesContext = searchResult.citations
    .map((c, idx) => `[${idx + 1}] Title: ${c.title}\nSnippet: ${c.snippet}`)
    .join('\n\n');

  const prompt = `Analyze the following real news articles for ${companyName} (${ticker}).
Determine overall institutional sentiment.
Return ONLY valid JSON:
{
  "sentimentScore": <number 0-100 where 50 is neutral, >60 is bullish, <40 is bearish>,
  "sentimentLabel": "BULLISH|BEARISH|NEUTRAL",
  "catalysts": ["Key catalyst 1 extracted from news", "Key catalyst 2 extracted from news"]
}

Articles Context:
${articlesContext}`;

  const structured = await generateStructuredJson(prompt);
  return {
    sentiment: structured.sentimentLabel || 'NEUTRAL',
    sentimentScore: typeof structured.sentimentScore === 'number' ? structured.sentimentScore : 50,
    catalysts: Array.isArray(structured.catalysts) ? structured.catalysts : [],
    citations: searchResult.citations
  };
}

export async function fetchCompetitiveData(companyName, ticker) {
  const searchResult = await searchFinancialNews(companyName, 'competitors market share economic moat industry peers');
  const articlesContext = searchResult.citations
    .map((c, idx) => `[${idx + 1}] Title: ${c.title}\nSnippet: ${c.snippet}`)
    .join('\n\n');

  const prompt = `Based on the following research citations for ${companyName} (${ticker}), evaluate its economic moat and market position relative to peers.
Return ONLY valid JSON:
{
  "moat": "WIDE|NARROW|NONE",
  "marketPositionRationale": "<Concise evaluation of competitive advantage and pricing power based on citations>",
  "peers": ["Primary Peer 1", "Primary Peer 2"]
}

Articles Context:
${articlesContext}`;

  const structured = await generateStructuredJson(prompt);
  return {
    moat: structured.moat || 'NONE',
    marketPositionRationale: structured.marketPositionRationale || 'Evaluation derived from live search citations.',
    peers: Array.isArray(structured.peers) ? structured.peers : [],
    citations: searchResult.citations
  };
}

export async function fetchRiskData(companyName, ticker) {
  const searchResult = await searchFinancialNews(companyName, 'regulatory scrutiny financial debt risk headwinds lawsuits');
  const articlesContext = searchResult.citations
    .map((c, idx) => `[${idx + 1}] Title: ${c.title}\nSnippet: ${c.snippet}`)
    .join('\n\n');

  const prompt = `Audit the institutional investment risks for ${companyName} (${ticker}) based on these real citations.
Return ONLY valid JSON:
{
  "topRisks": ["Specific risk 1 from citations", "Specific risk 2 from citations"],
  "regulatoryScrutiny": "LOW|MEDIUM|HIGH",
  "debtRating": "<e.g. Investment Grade, High Yield, or N/A based on citations>"
}

Articles Context:
${articlesContext}`;

  const structured = await generateStructuredJson(prompt);
  return {
    topRisks: Array.isArray(structured.topRisks) ? structured.topRisks : [],
    regulatoryScrutiny: structured.regulatoryScrutiny || 'MEDIUM',
    debtRating: structured.debtRating || 'N/A',
    citations: searchResult.citations
  };
}
