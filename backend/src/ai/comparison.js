import { generateStructuredJson } from './model.js';
import { z } from 'zod';

const CategoryComparisonSchema = z.object({
  category: z.string(),
  winner: z.enum(['A', 'B', 'TIE']),
  note: z.string()
});

const ComparisonOutputSchema = z.object({
  winner: z.enum(['A', 'B', 'TOO_CLOSE']),
  winnerReasoning: z.string(),
  categoryComparison: z.array(CategoryComparisonSchema),
  investorFitNote: z.string()
});

export async function runComparisonNode(reportA, reportB) {
  const nameA = reportA.companyName || reportA.resolvedTicker || 'Company A';
  const nameB = reportB.companyName || reportB.resolvedTicker || 'Company B';

  const formatPoints = (caseData) => {
    if (Array.isArray(caseData)) {
      return caseData
        .slice(0, 3)
        .map(p => (typeof p === 'object' && p !== null ? p.point || JSON.stringify(p) : String(p)))
        .join('; ');
    }
    if (typeof caseData === 'string') {
      return caseData.slice(0, 300);
    }
    return 'N/A';
  };

  const formatSummary = (report, label) => {
    const s = report.scores || {};
    return [
      `COMPANY ${label}: ${report.companyName} (${report.resolvedTicker})`,
      `VERDICT: ${report.verdict} (${report.confidence}% confidence)`,
      `EXECUTIVE SUMMARY: ${report.plainSummary || report.reasoningSummary || 'N/A'}`,
      `SCORES:`,
      `- Financial Health: ${s.financialHealth?.score ?? 'N/A'}/10`,
      `- Growth Potential: ${s.growthPotential?.score ?? 'N/A'}/10`,
      `- Market Position: ${s.marketPosition?.score ?? 'N/A'}/10`,
      `- Risk Level: ${s.riskLevel?.score ?? 'N/A'}/10`,
      `BULL THESIS SAMPLE: ${formatPoints(report.bullCase)}`,
      `BEAR THESIS SAMPLE: ${formatPoints(report.bearCase)}`
    ].join('\n');
  };

  const prompt = `
You are InvestIQ Institutional Allocation Committee. Perform a direct head-to-head comparison between two researched companies:
- COMPANY A: ${nameA}
- COMPANY B: ${nameB}

COMPANY A SUMMARY:
${formatSummary(reportA, 'A')}

COMPANY B SUMMARY:
${formatSummary(reportB, 'B')}

INSTRUCTIONS:
1. Determine overall winner ("A", "B", or "TOO_CLOSE" if parity or trade-offs are near-equal). Do not force a fake winner if both have comparable risk-adjusted outlooks.
2. Provide concise institutional winnerReasoning comparing fundamentals, moat, catalysts, and risk.
3. Compare the 4 core dimensions exactly in "categoryComparison" array:
   - "Financial Health"
   - "Growth Potential"
   - "Market Position"
   - "Risk Level"
   For each category specify winner ("A", "B", or "TIE") and a crisp 1-sentence note.
4. Provide investorFitNote explaining which investor profile should pick Company A vs Company B (e.g. capital preservation vs aggressive growth).

Return valid JSON with exact keys:
{
  "winner": "A" | "B" | "TOO_CLOSE",
  "winnerReasoning": "string",
  "categoryComparison": [
    { "category": "Financial Health", "winner": "A" | "B" | "TIE", "note": "string" },
    { "category": "Growth Potential", "winner": "A" | "B" | "TIE", "note": "string" },
    { "category": "Market Position", "winner": "A" | "B" | "TIE", "note": "string" },
    { "category": "Risk Level", "winner": "A" | "B" | "TIE", "note": "string" }
  ],
  "investorFitNote": "string"
}
`.trim();

  const systemPrompt = `You are InvestIQ AI Allocation Committee synthesizing a head-to-head comparative investment memo. Output valid JSON matching the schema.`;

  try {
    const result = await generateStructuredJson(
      prompt,
      ComparisonOutputSchema,
      { temperature: 0.2, systemPrompt }
    );
    return result;
  } catch (err) {
    console.error('AI comparison synthesis failed:', err.message);
    throw err;
  }
}
