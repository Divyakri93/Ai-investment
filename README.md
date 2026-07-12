# InvestIQ — Production AI Investment Research Agent (MERN + LangGraph.js)

**InvestIQ** is an autonomous, full-stack AI investment research terminal that synthesizes real-time financial fundamentals, market news, competitive landscape, and macro risk data using a **multi-agent LangGraph.js debate pipeline**. 

When a user inputs any company name (e.g. *"Tesla"*, *"Nvidia"*, *"Zomato"*), the backend streams live execution logs via **Server-Sent Events (SSE)** to a trading-terminal-grade React interface. Parallel specialized agents gather data, stage a rigorous **Bull vs. Bear debate**, and compute a quantified `INVEST / WATCH / PASS` decision with interactive radar scorecards and downloadable PDF investment memos.

---

## Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                              FRONTEND (Vite + React 18 + TS)                            |
|  Dark SaaS Trading Terminal | Visual LangGraph Flow | Recharts Radar | Live SSE Reader  |
+-----------------------------------------------------------------------------------------+
       |                                                                        ^
       | POST /api/research                                                     | SSE Stream
       | GET  /api/reports                                                      | (log, partial,
       | GET  /api/reports/:id/pdf                                              |  final events)
       v                                                                        |
+-----------------------------------------------------------------------------------------+
|                           BACKEND (Node.js + Express + TS + Mongoose)                   |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                          LangGraph.js State Graph                                 |  |
|  |                                                                                   |  |
|  |                             [ 1. routerNode ]                                     |  |
|  |                   (Resolves company name to ticker/entity)                        |  |
|  |                                     |                                             |  |
|  |             +-----------------------+-----------------------+                     |  |
|  |             |                       |                       |                     |  |
|  |             v                       v                       v                     |  |
|  |    [ fundamentalsAgent ]  [ newsSentimentAgent ]  [ competitiveAgent ]            |  |
|  |    (Financials API Tool)    (Search & Sentiment)     (Peers & Moats)              |  |
|  |             \                       |                       /                     |  |
|  |              +----------------------+----------------------+                      |  |
|  |                                     |                                             |  |
|  |                                     v                                             |  |
|  |                             [ 3. debateNode ]                                     |  |
|  |                (Constructs Strongest Bull vs. Bear Case Debate)                   |  |
|  |                                     |                                             |  |
|  |                                     v                                             |  |
|  |                            [ 4. decisionNode ]                                    |  |
|  |             (Scores 0-10 Rubric -> INVEST / WATCH / PASS Verdict)                 |  |
|  |                                     |                                             |  |
|  |                                     v                                             |  |
|  |                             [ 5. reportNode ]                                     |  |
|  +-------------------------------------+---------------------------------------------+  |
|                                        |                                                |
|                                        v                                                |
|                     MongoDB Persisted Reports & Local File Fallback                     |
+-----------------------------------------------------------------------------------------+
```

---

## Why This Design: The Multi-Agent Bull / Bear Debate Approach

Traditional single-prompt AI summarizers suffer from **sycophancy and confirmation bias**—when asked to evaluate a well-known stock, a single prompt tends to regurgitate generic consensus without critically evaluating trade-offs.

InvestIQ solves this via structured **adversarial multi-agent debate**:
1. **Parallel Domain Specialists (Fan-Out)**: Four independent agents (`fundamentals`, `newsSentiment`, `competitive`, `risk`) run concurrently using function calling to gather factual metrics and citations.
2. **Adversarial Synthesis (Debate Node)**: One specialized prompt acts as an aggressive **Bull Analyst** tasked with building the strongest possible investment thesis with direct data citations. Another prompt acts as a skeptical **Bear Analyst** poking holes in valuation, margins, or macro vulnerability.
3. **Impartial Adjudicator (Decision Node)**: A structured output decision agent weighs both cases against a strict 4-dimension scoring rubric (`financialHealth`, `growthPotential`, `marketPosition`, `riskLevel` on 0-10 scales) to issue a definitive `INVEST`, `WATCH`, or `PASS` verdict with a quantifiable confidence score.

---

## Quickstart Guide

### 1. Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)

### 2. Installation
Run a single command at the repository root to install all dependencies for both frontend and backend:
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` in `/backend` to `/backend/.env`:
```bash
# In /backend/.env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/investiq
LLM_API_KEY=your_api_key_here
LLM_PROVIDER=gemini # Options: gemini, openai, anthropic
FMP_API_KEY=optional_fmp_key
TAVILY_API_KEY=optional_tavily_key
```
*(Note: InvestIQ includes intelligent production fallbacks that generate realistic, fact-anchored financial data even if external API keys or MongoDB are absent during local demos).*

### 4. Running Locally
Start both the API backend and the React frontend concurrently from the project root:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001

---

## Deployment Notes

- **Backend (Render / Railway)**: Deploy `/backend` as a persistent Node.js web service (SSE requires persistent open connections). Set environment variables `PORT=5001`, `MONGODB_URI`, and `LLM_API_KEY`.
- **Frontend (Vercel / Netlify)**: Deploy `/frontend` as a Vite static site. Configure environment variable `VITE_API_URL=https://your-backend-domain.com`.
