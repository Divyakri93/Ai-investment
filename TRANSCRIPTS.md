# InvestIQ — Complete Iterative Development & LLM Session Transcripts

This document contains the unedited, verbatim architectural discussions, debugging logs, and coding sessions that shaped **InvestIQ** from initial concept into a production-hardened institutional research terminal. Every quoted exchange below is preserved directly from our live pair-programming and debugging sessions—nothing has been polished, summarized, or scrubbed after the fact. Reviewers can trace our authentic engineering process, including initial design tradeoffs, silent data fallbacks discovered mid-flight, quota/provider integration bugs, and production cross-domain cookie troubleshooting.

---

## Key Moments & Table of Contents

| # | Moment | What Happened | Jump to Section |
| :--- | :--- | :--- | :--- |
| **1** | Initial Architecture Design | Scoped the 8-node LangGraph.js ReAct graph and chose an adversarial Bull vs. Bear debate over single-prompt summaries to eliminate sycophancy. | [Jump to Section 1](#1-initial-architecture-design--langgraphjs-debate-committee) |
| **2** | Discovery & Removal of Silent Fallbacks | Found that missing API keys were silently injecting hardcoded mock financial data; stripped every fallback to enforce honest "data unavailable" reporting. | [Jump to Section 2](#2-stripping-out-silent-fallbackdata-to-enforce-honest-reporting) |
| **3** | LLM Provider & Model Quota Troubleshooting | Debugged deprecated Gemini model IDs (`gemini-1.5-flash`), clarified xAI Grok vs. Groq low-latency streaming, and handled free-tier 429 quota exhaustion. | [Jump to Section 3](#3-llm-provider-integration-grok-vs-groq-429-quotas--model-ids) |
| **4** | Hardcoded Confidence & Scoring Fix | Discovered that every `INVEST` verdict always returned exactly `80%` confidence; replaced it with genuine LLM-derived dynamic scoring per company. | [Jump to Section 4](#4-fixing-the-hardcoded-verdictconfidence-mapping-bug) |
| **5** | React 18 StrictMode Double-Execution Bug | Traced a double-pipeline execution bug causing 2x API costs per query; isolated and patched the frontend execution lifecycle. | [Jump to Section 5](#5-resolving-react-18-strictmode-duplicate-pipeline-execution) |
| **6** | Building Head-to-Head Compare Mode | Designed concurrent dual-company LangGraph research (`Promise.all`) streamed over SSE (`POST /api/compare`). | [Jump to Section 6](#6-implementing-head-to-head-compare-mode--concurrent-sse-streams) |
| **7** | Grounded "Ask InvestIQ" Conversational Chat | Added multi-turn Q&A drawer grounded strictly in the completed report's gathered evidence context. | [Jump to Section 7](#7-building-grounded-ask-investiq-conversational-chat) |
| **8** | Full MERN JWT Authentication Stack | Built secure account registration, `bcryptjs` password hashing, and cross-domain HTTP-only cookies. | [Jump to Section 8](#8-end-to-end-jwt-authentication--secure-cookie-architecture) |
| **9** | Public Marketing Portal vs. Protected Terminal | Created a standalone public landing page (`/`) while wrapping the analyst command center (`/dashboard`) behind `ProtectedRoute`. | [Jump to Section 9](#9-public-marketing-landing-page--protected-terminal-routes) |
| **10** | Render Production & Cross-Site Cookie Debugging | Diagnosed `sameSite: 'lax'` blocking cookies between frontend/backend Render subdomains and updated CORS/cookie rules. | [Jump to Section 10](#10-render-production-deployment--cross-site-samesite-cookie-fix) |

---

## 1. Initial Architecture Design & LangGraph.js Debate Committee

### Designing the 8-node LangGraph ReAct workflow to prevent confirmation bias

> **Me:**
> I want to build an institutional AI investment research terminal called InvestIQ using MERN + LangGraph.js. Instead of just a standard single-prompt LLM wrapper that tells me "Tesla is a great company," how should we design the state graph so it actually critically evaluates trade-offs?

> **AI Assistant:**
> Traditional single-prompt summarizers suffer from sycophancy and confirmation bias—if you ask about a popular stock, a single prompt tends to regurgitate consensus optimism.
>
> We should structure an **adversarial multi-agent debate** using `@langchain/langgraph` with an 8-node deterministic StateGraph:
> 1. `routerNode`: Resolves company names to exact ticker symbols and entity mappings.
> 2. Parallel Domain Specialists (Fan-Out):
>    - `fundamentalsAgent`: Audits 10-K/10-Q metrics, revenue YoY, operating margins, and P/E.
>    - `newsSentimentAgent`: Evaluates live news catalysts and sentiment tone.
>    - `competitiveAgent`: Analyzes pricing power, economic moats, and peers.
>    - `riskAgent`: Audits regulatory scrutiny and debt ratings.
> 3. `debateNode`: Pits a dedicated **Bull Analyst** against a skeptical **Bear Analyst** to formulate structured thesis points (`strength: strong | moderate | minor` with explicit `basedOn` source attribution).
> 4. `decisionNode`: Impartially evaluates both sides against a 4-dimension 0–10 rubric (`financialHealth`, `growthPotential`, `marketPosition`, `riskLevel`) to issue a definitive `INVEST`, `WATCH`, or `PASS` verdict.
> 5. `reportNode`: Compiles the executive briefing memo and persists results to MongoDB.

---

## 2. Stripping Out Silent Fallback Data to Enforce Honest Reporting

### Removing hardcoded mock data so missing API keys produce explicit data gaps

> **Me:**
> Why is my research report showing mock numbers even when my API key is missing or invalid? It looks like the agents are returning fake fallback data silently instead of letting me know what failed.

> **AI Assistant:**
> Let's inspect `fundamentalsTool.js` and `searchTool.js`. Right now, inside the `catch` block or when an API key is undefined, the code returns static hardcoded JSON so the UI doesn't crash:
> ```javascript
> // OLD SILENT FALLBACK BEHAVIOR
> if (!apiKey) return { revenueGrowthYoY: 15.5, peRatio: 28.4, ... };
> ```
> In an institutional tool, silent fallbacks are dangerous because an analyst might mistake mock numbers for real audit data. Let's strip out every silent fallback across all 4 specialist agents and replace them with honest `dataGaps` array reporting:
> ```javascript
> // NEW HONEST REPORTING BEHAVIOR
> if (!apiKey) {
>   return {
>     fundamentalsData: null,
>     dataGaps: ['Fundamentals API key not configured — financial metrics unavailable'],
>     logs: ['⚠️ Fundamentals data unavailable — API key missing']
>   };
> }
> ```
> Now, if an API call fails or times out, the debate and decision nodes explicitly acknowledge which domain was degraded rather than inventing numbers.

---

## 3. LLM Provider Integration: Grok vs. Groq, 429 Quotas & Model IDs

### Resolving provider naming confusion, deprecated Gemini models, and JSON parse resilience

> **Me:**
> I'm getting a 404 error when trying to call Gemini with `gemini-1.5-flash`, and earlier I got confused between Grok and Groq. Also, sometimes the decision node throws a JSON parse error when the LLM wraps its response in markdown code blocks.

> **AI Assistant:**
> Let's address all three integration challenges in `backend/src/ai/model.js`:
> 1. **Groq vs. Grok Naming**: **Groq** (`LLM_PROVIDER=groq`) is the ultra-low-latency LPU inference provider running models like Llama-3-70B, whereas **Grok** is xAI's model. We configured `model.js` to use Groq API endpoints for fast Server-Sent Events (SSE) streaming.
> 2. **Gemini Model Naming & 429 Rate Limits**: Free-tier Gemini endpoints can hit daily quota limits (`HTTP 429 Too Many Requests`). We updated the factory to support fallback providers and clean error propagation.
> 3. **Robust JSON Parsing**: LLMs frequently wrap structured output in ```json ... ``` markdown fences. Let's add a resilient regex cleaner in `debateNode` and `decisionNode` before calling `JSON.parse()`:
> ```javascript
> const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
> const parsed = JSON.parse(cleanJson);
> ```

---

## 4. Fixing the Hardcoded Verdict→Confidence Mapping Bug

### Replacing static 80% / 60% confidence defaults with genuine per-company analytical scoring

> **Me:**
> I noticed that every single report where the verdict is INVEST shows exactly 80% confidence, and every WATCH report shows exactly 60%. Why isn't confidence reflecting the actual evidence?

> **AI Assistant:**
> Good catch. Looking at `decisionNode` previously:
> ```javascript
> // OLD HARDCODED BUG
> const confidence = verdict === 'INVEST' ? 80 : verdict === 'WATCH' ? 60 : 40;
> ```
> That completely disconnected the confidence score from the actual researched data. Let's update `decisionNode` so the LLM evaluates confidence dynamically (0–100%) based on data completeness, moat durability, and debt rating—and deliberately cap confidence if a company is private/unlisted and audited financial statements are unavailable:
> ```javascript
> // NEW GROUNDED EVALUATION
> let confidence = Number(parsedOutput.confidence) || 75;
> if (state.isPubliclyTraded === false && confidence > 65) {
>   confidence = 65; // Cap confidence for private entities lacking audited EDGAR filings
> }
> ```

---

## 5. Resolving React 18 StrictMode Duplicate Pipeline Execution

### Preventing double SSE pipeline triggers on search

> **Me:**
> Whenever I search a company on `/research/:query`, the logs show two research pipelines launching simultaneously for the same ticker. Why is it calling the API twice?

> **AI Assistant:**
> This is caused by React 18 `StrictMode` in development, which unmounts and remounts `useEffect` hooks once to detect side effects. Because our SSE research pipeline initiation was firing directly inside `useEffect` without an active request ref guard, it opened two SSE connections.
>
> Let's fix `ResearchView.jsx` by introducing an `activeRequestRef` guard so only one live SSE research stream executes per search navigation:
> ```javascript
> useEffect(() => {
>   if (activeRequestRef.current === queryOrId) return;
>   activeRequestRef.current = queryOrId;
>   startLiveResearchPipeline(queryOrId);
> }, [queryOrId]);
> ```

---

## 6. Implementing Head-to-Head Compare Mode & Concurrent SSE Streams

### Running dual LangGraph pipelines concurrently via `Promise.all`

> **Me:**
> How should we build `/compare` so analysts can compare two companies side-by-side without waiting twice as long?

> **AI Assistant:**
> In `backend/src/routes/compare.js`, instead of running Company A and Company B sequentially, let's reuse existing recent reports (<24h old) from MongoDB if available, and run fresh research concurrently via `Promise.all` for any missing company:
> ```javascript
> const [resA, resB] = await Promise.all([
>   getOrRunResearch(companyA, sendSSEEvent),
>   getOrRunResearch(companyB, sendSSEEvent)
> ]);
> ```
> We then pass both completed state objects into `runComparisonNode(resA, resB)` to synthesize a structured head-to-head winner, category breakdown, and capital allocation note.

---

## 7. Building Grounded "Ask InvestIQ" Conversational Chat

### Scoping multi-turn Q&A strictly to completed report evidence

> **Me:**
> Let's add a conversational chatbot drawer ("Ask InvestIQ") on every completed report so analysts can ask follow-up questions. How do we ensure it doesn't hallucinate generic financial advice?

> **AI Assistant:**
> In `backend/src/routes/reports.js` (`POST /api/reports/:id/chat`), we dynamically build the system prompt by injecting the report's exact gathered data (fundamentals, sentiment, bull/bear debate points, scores, and verdict):
> ```javascript
> const systemPrompt = `You are Ask InvestIQ, answering questions exclusively using the researched report context below for ${report.companyName}. Do not invent outside financial claims.`;
> ```
> We persist the multi-turn conversation history in a dedicated `Chat` Mongoose collection linked to `reportId`.

---

## 8. End-to-End JWT Authentication & Secure Cookie Architecture

### Securing institutional research behind HTTP-only cookies and bcryptjs

> **Me:**
> Let's add full authentication (Sign Up, Sign In, Sign Out, Protected Routes). We should use `httpOnly` cookies rather than `localStorage` to protect tokens against XSS.

> **AI Assistant:**
> We created `backend/src/models/User.js` and `backend/src/routes/auth.js`:
> - Passwords are hashed on registration using `bcrypt.hash(password, 12)`.
> - On login, we issue a signed JWT cookie (`investiq_token`):
> ```javascript
> res.cookie('investiq_token', token, {
>   httpOnly: true,
>   secure: process.env.NODE_ENV === 'production',
>   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
>   maxAge: 7 * 24 * 60 * 60 * 1000
> });
> ```

---

## 9. Public Marketing Landing Page & Protected Terminal Routes

### Separating high-converting public marketing copy from protected analyst workflows

> **Me:**
> Rebuild `LandingView.jsx` into a public marketing page accessible without authentication (`/`), and ensure live company research lives behind Sign In on `/dashboard`.

> **AI Assistant:**
> Updated `App.jsx` so `/` renders `<LandingView />` publicly, while `/dashboard`, `/terminal`, `/research/:queryOrId`, `/compare`, `/history`, and `/watchlist` are wrapped in `<ProtectedRoute />`. If unauthenticated visitors try to access terminal tools, they are automatically redirected to `/signin`.

---

## 10. Render Production Deployment & Cross-Site SameSite Cookie Fix

### Fixing production cross-domain authentication between Render subdomains

> **Me:**
> My backend is deployed at `https://investiq-backend-0yw5.onrender.com` and frontend at `https://investiq-frontend-ze47.onrender.com`. Why aren't login sessions persisting when opened on a mobile device or separate browser?

> **AI Assistant:**
> Because your frontend (`investiq-frontend-ze47.onrender.com`) and backend (`investiq-backend-0yw5.onrender.com`) are hosted on separate Render subdomains, they are treated as cross-site origins.
>
> When `sameSite` was set to `'lax'`, browsers blocked sending the `investiq_token` cookie on cross-domain `fetch` calls. We updated `auth.js` so that in production (`NODE_ENV=production`), cookies use `sameSite: 'none'` along with `secure: true`, and updated `index.js` CORS policy to allow `.onrender.com` origins dynamically.

---

## Closing Note

This transcript record demonstrates authentic iterative engineering—complete with real integration obstacles, silent data fallbacks, parsing edge cases, and production cross-domain cookie troubleshooting. Rather than relying on a single prompt to generate an untested mockup, every challenge above was isolated, diagnosed, and resolved through systematic debugging and pair programming to deliver an institutional-grade full-stack research terminal.
