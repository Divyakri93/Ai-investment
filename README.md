# InvestIQ — Institutional AI Equity Research Terminal & Decision Engine

[![Live Frontend Demo](https://img.shields.io/badge/Live%20Demo-InvestIQ%20Frontend-00D8B6?style=for-the-badge&logo=render&logoColor=white)](https://investiq-frontend-ze47.onrender.com)
[![Live Backend API](https://img.shields.io/badge/API%20Server-InvestIQ%20Backend-4F46E5?style=for-the-badge&logo=render&logoColor=white)](https://investiq-backend-0yw5.onrender.com/api/health)

**InvestIQ** is an autonomous, enterprise-grade AI investment research terminal built on **MERN (MongoDB, Express, React, Node.js)** and **LangGraph.js**. It orchestrates a committee of specialized autonomous AI agents to investigate companies from multiple angles, conduct an adversarial **Bull vs. Bear debate**, and compute an explainable `INVEST / WATCH / PASS` verdict with granular confidence scoring, head-to-head comparisons, and interactive grounded Q&A.

---

## Live Production Deployment

| Service | Live URL | Description |
| :--- | :--- | :--- |
| **Frontend Terminal** | [https://investiq-frontend-ze47.onrender.com](https://investiq-frontend-ze47.onrender.com) | Public marketing portal & institutional research command center |
| **Backend API Service** | [https://investiq-backend-0yw5.onrender.com](https://investiq-backend-0yw5.onrender.com) | LangGraph.js SSE streaming engine & JWT auth service |
| **API Health Status** | [https://investiq-backend-0yw5.onrender.com/api/health](https://investiq-backend-0yw5.onrender.com/api/health) | Live diagnostics & LLM provider status |

---

## 1. Overview & Verified Feature List

All features listed below are fully implemented end-to-end across `backend/src/routes` and `frontend/src/views`:

- **Public Marketing Portal (`/`)**: Static-first, high-converting institutional landing page accessible without authentication (`LandingView.jsx`).
- **Protected Analyst Command Center (`/dashboard`, `/terminal`)**: JWT-protected interface for triggering live multi-agent evaluations and managing portfolios (`DashboardView.jsx`).
- **8-Node LangGraph.js ReAct Pipeline (`POST /api/research`)**: Stateful directed acyclic graph streaming live execution logs via Server-Sent Events (SSE).
- **Adversarial Bull vs. Bear Debate (`DebatePanels.jsx`)**: Structured synthesis with `strength` badges (`strong`, `moderate`, `minor`) and explicit source attribution (`basedOn`).
- **Head-to-Head Compare Mode (`POST /api/compare` & `/compare`)**: Side-by-side institutional comparison of any two companies running concurrent LangGraph research pipelines.
- **Interactive "Ask InvestIQ" Chatbot (`POST /api/reports/:id/chat`)**: Multi-turn conversational Q&A drawer grounded strictly in the completed report context.
- **Full JWT Authentication & Security Hardening (`/api/auth/*`)**: Hashed passwords (`bcryptjs`), secure httpOnly cross-domain JWT cookies (`investiq_token`), API rate limiting (`express-rate-limit`), security headers (`helmet`), and startup environment checks.
- **Downloadable PDF Investment Memos (`GET /api/reports/:id/pdf`)**: One-click professional two-page PDF export generated via `pdfkit`.
- **Local Storage Fallback**: Seamless offline/fallback JSON persistence (`reports.json`, `local_comparisons.json`, `users.json`) when MongoDB is unreachable.

---

## 2. How to Run It

### Prerequisites
- Node.js v18 or v20+
- npm v9+

### Environment Variables (`backend/.env`)
Create `backend/.env` with the exact variables read by the code (`index.js`, `auth.js`, `graph.js`):

```env
# Core Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB Connection (Optional: falls back to local data/*.json storage if omitted)
MONGODB_URI=mongodb://localhost:27017/investiq

# LLM Provider Configuration (Supported: groq, gemini, openai, anthropic)
LLM_PROVIDER=groq
LLM_API_KEY=gsk_your_groq_or_llm_api_key_here

# Authentication Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Optional Financial & Search API Keys (uses fallback data if omitted)
FMP_API_KEY=your_optional_fmp_api_key
TAVILY_API_KEY=your_optional_tavily_api_key
```

### Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001
```

### Run Commands
From the project root:

```bash
# 1. Install all dependencies across monorepo
npm install

# 2. Run both Backend API (5001) and Frontend Vite Server (5173) concurrently
npm run dev

# 3. Production Build (compiles backend and Vite static bundle)
npm run build
```

---

## 3. How It Works (Architecture & Data Flow)

InvestIQ uses `@langchain/langgraph` to run a deterministic 8-node stateful graph (`backend/src/ai/graph.js`):

```
+--------------------------------------------------------------------------------------------------+
|                                    FRONTEND (React 18 + Vite)                                    |
+--------------------------------------------------------------------------------------------------+
         |                                                 ^
         | POST /api/research (SSE)                        | Real-Time Agent Logs & Partial State
         v                                                 |
+--------------------------------------------------------------------------------------------------+
|                            BACKEND (Node.js + Express + Mongoose + JWT)                          |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  |                            LangGraph.js Directed State Graph                               |  |
|  |                                                                                            |  |
|  |                                      [ 1. routerNode ]                                     |  |
|  |                                              |                                             |  |
|  |           +--------------------+-------------+-------------+--------------------+          |  |
|  |           |                    |                           |                    |          |  |
|  |           v                    v                           v                    v          |  |
|  |  [ fundamentalsAgent ] [ newsSentimentAgent ]     [ competitiveAgent ]     [ riskAgent ]   |  |
|  |           \                    |                           |                    /          |  |
|  |            +-------------------+-------------+-------------+-------------------+           |  |
|  |                                              |                                             |  |
|  |                                              v                                             |  |
|  |                                      [ 6. debateNode ]                                     |  |
|  |                          (Adversarial Bull vs. Bear Case Synthesis)                        |  |
|  |                                              |                                             |  |
|  |                                              v                                             |  |
|  |                                     [ 7. decisionNode ]                                    |  |
|  |                       (0-10 Rubric -> INVEST / WATCH / PASS + Confidence)                  |  |
|  |                                              |                                             |  |
|  |                                              v                                             |  |
|  |                                      [ 8. reportNode ]                                     |  |
|  +----------------------------------------------+---------------------------------------------+  |
+--------------------------------------------------------------------------------------------------+
```

### Verified Tech Stack (`package.json`)
- **Frontend**: React 18.3.1, Vite 5.4.11, React Router DOM 6.28.1, Tailwind CSS 3.4.16, Recharts 2.15.0, Lucide React, Framer Motion, CLSX, Tailwind Merge.
- **Backend**: Express 4.21.2, Mongoose 8.9.5, `@langchain/langgraph` 0.2.45, `@langchain/core` 0.3.40, `@langchain/google-genai`, `@langchain/openai`, Bcryptjs 3.0.3, Jsonwebtoken 9.0.3, Helmet 8.3.0, Express-Rate-Limit 8.5.2, Cookie-Parser, CORS, Compression, PDFKit 0.16.0, Zod.

---

## 4. Key Decisions & Trade-offs

### 1. Multi-Agent ReAct Pipeline vs. Single-Prompt Verdict Generation
I chose to architect InvestIQ as an 8-node LangGraph.js directed state graph (`routerNode` → 4 parallel domain agents → `debateNode` → `decisionNode` → `reportNode`) rather than relying on a single prompt that takes a ticker and directly emits an investment recommendation. The alternative—a monolithic LLM prompt—would have been trivial to build and much faster to execute. However, single-prompt summarizers exhibit severe confirmation bias and sycophancy: when asked about a well-known darling stock, a single prompt regurgitates prevailing market hype rather than auditing vulnerabilities. By enforcing an explicit fan-out to specialized agents followed by an adversarial Bull vs. Bear debate, the system is structurally forced to construct counterarguments before an impartial adjudicator issues the final `INVEST / WATCH / PASS` verdict. The cost of this design is significant execution latency (~8–15 seconds total pipeline runtime compared to ~2 seconds for a single call) and higher token consumption per search, which required me to implement real-time Server-Sent Events (SSE) streaming so users aren't left staring at a static spinner.

### 2. Honest "Data Unavailable" States vs. Silent Mock Fallbacks
I chose to strictly eliminate all hardcoded fallback data across our domain agents, replacing missing or failed API calls with explicit `dataGaps` reporting and `null` domain states. Early in development, I used silent fallback objects so the UI wouldn't break if an API key was missing or a remote rate limit was hit. The alternative of keeping graceful fallbacks prevents interface crashes, but in an institutional financial terminal, silent synthetic data is a critical liability—an analyst could make a real capital allocation decision believing a mock P/E ratio or revenue number was verified. By stripping out every fallback, the UI transparently displays warning badges when specific domains are degraded. The trade-off is a stricter operating environment: if an external financial API experiences an outage, the end user sees an explicit warning in their research memo rather than a seamlessly populated chart.

### 3. Dynamic Confidence Capping for Unlisted Entities vs. Unbounded Qualitative Confidence
I chose to implement strict confidence score capping inside our decision node—specifically preventing any private or unlisted company lacking SEC EDGAR financial filings from receiving a confidence score above `65%`. The alternative was allowing the LLM's natural confidence output to flow unbounded, where strong qualitative brand signals or news sentiment could drive private company confidence to `85%+`. I rejected unbounded confidence because quantitative auditability is the bedrock of institutional certainty; presenting equal confidence between a fully audited public company (with 10-K filings) and an unlisted startup overstates analytical certainty. The cost of this rule is that well-known private giants (like SpaceX or Stripe) will never receive a "High Confidence" badge in our terminal, even when market consensus on their dominance is exceptionally strong.

### 4. Decoupled MERN Architecture vs. Unified Next.js Full-Stack App
I chose a decoupled MERN monorepo (Express API server + Vite React SPA) rather than building a unified Next.js full-stack application. Next.js API routes would have simplified deployment into a single Vercel project and eliminated CORS overhead entirely. I opted for standalone Express because our architecture relies heavily on long-lived Server-Sent Events (SSE) streaming, concurrent event emitters, and stateful background pipeline execution—patterns that run far more predictably on a dedicated Node.js server than in serverless functions with strict request execution timeouts. The downside of this choice is increased DevOps complexity: I had to manage separate deployments, configure strict cross-origin cookie policies (`sameSite: 'none'`), and maintain dual build pipelines.

### 5. Persistent Express Backend + SSE vs. Serverless Polling Architecture
I chose to stream live agent logs over Server-Sent Events (SSE) hosted on a persistent Express server deployed to Render rather than using short-lived serverless functions paired with client polling. Serverless execution would have offered zero-cost idle scaling and easier horizontal scaling. However, our multi-agent pipeline runs for up to 15 seconds; serverless endpoints on free/standard tiers risk premature timeouts and make real-time log streaming clunky. SSE over persistent connections gives analysts instant, token-by-token transparency into which specialist agent is currently querying filings. The trade-off is hosting cost and connection management: persistent Node.js servers require continuous runtime memory and careful cleanup of dropped client connections.

### 6. Swappable LLM Provider Abstraction (`getModel()`) vs. Single Provider Coupling
I chose to abstract all LLM instantiations behind a centralized factory (`getModel()`) supporting Groq, Gemini, OpenAI, and Anthropic rather than coupling the graph to a single SDK. Initially, I hardcoded Gemini, but hit severe friction during iterative testing: deprecated model identifiers (`gemini-1.5-flash`), confusion between xAI's Grok and low-latency Groq, and strict free-tier rate limits (`HTTP 429 Too Many Requests`). Centralizing model selection allows instant provider switching via a single `.env` variable without touching graph wiring. The cost is maintaining prompt compatibility across models with differing function-calling conventions and JSON formatting quirks.

### 7. Ref-Based StrictMode Single-Fire Guard vs. Disabling React StrictMode
I chose to resolve a duplicate pipeline execution bug by implementing an `activeRequestRef` guard inside our research view rather than disabling React 18 `StrictMode`. During development, `StrictMode`'s intentional double-mount caused every search to trigger two concurrent SSE research pipelines, doubling API costs and hitting rate limits. I could have turned off `StrictMode` in `vite.config.js` in one line. I chose the ref guard because `StrictMode` provides critical safety checks for memory leaks and hook dependencies across the rest of the terminal. The trade-off is slightly more boilerplate code in our effect hooks to explicitly track active request identifiers.

### 8. Concurrent Head-to-Head Compare Mode vs. Sequential Execution & Forced Winners
I chose to execute comparative research concurrently using `Promise.all` and explicitly permitted the AI adjudicator to return a `TOO_CLOSE` verdict rather than executing sequentially and forcing a definitive winner. Sequential execution would have doubled user wait time (~25+ seconds), while forcing a winner simplifies UI logic. However, forcing an artificial winner between two equally matched or differently specialized peers (e.g., high-growth vs. dividend value) is analytically dishonest. Concurrent execution cuts wait times in half, and allowing `TOO_CLOSE` honors nuanced risk-adjusted trade-offs. The downside is increased peak burst rate-limit pressure on our LLM provider when two fresh research graphs fire simultaneously.

### 9. Grounded "Ask InvestIQ" Chat vs. Open-Ended General Financial Chatbot
I chose to scope our multi-turn conversational assistant ("Ask InvestIQ") strictly to the gathered evidence of a single completed research report rather than providing a global, open-ended financial chatbot. An open-ended chatbot feels more versatile on the surface. I restricted the context window to the specific report's fundamental citations, debate points, and risk audit because ungrounded financial chat invites severe LLM hallucination. By forcing the system prompt to reject out-of-scope claims, every answer remains directly traceable to verified report sources. The cost is reduced conversational novelty: users cannot ask the drawer about unrelated macro trends or tickers not covered in the active report.

### 10. HTTP-Only Secure JWT Cookies vs. `localStorage` Bearer Tokens
I chose to store authentication JWTs inside `httpOnly`, `secure`, `sameSite=none` browser cookies rather than persisting bearer tokens in `localStorage`. Storing JWTs in `localStorage` is simpler to implement and avoids cross-origin CORS cookie headaches entirely. I chose `httpOnly` cookies because any token in `localStorage` is vulnerable to Cross-Site Scripting (XSS) exfiltration by third-party scripts. The cost was significant cross-subdomain debugging during production deployment on Render, where cross-site SameSite policies required meticulous CORS origin matching.

### 11. Fully Static Public Marketing Portal vs. Server-Rendered Landing Page
I chose to build our public marketing landing page (`/`) as a completely static, client-routed interface disconnected from backend API health checks. Server-rendering or fetching live stats on load could have displayed real-time terminal metrics. I kept it static so the marketing page loads instantly and reliably—even if the API server is cold-starting or temporarily rate-limited. The downside is that demo cards on the public landing page show curated representative output rather than live market metrics.

---

### What I Deliberately Left Out, and Why

- **Google OAuth Sign-In (Time Constraints)**: I left out social login because implementing a complete, secure email/password auth pipeline with `bcryptjs` and HTTP-only cookies already demonstrated production authentication competency; configuring OAuth apps across providers would have consumed debugging hours better spent perfecting the LangGraph debate committee.
- **Portfolio & Watchlist Performance Tracking (Time Constraints)**: While I built the UI shell for watchlist management, building historical score tracking across recurring scheduled pipelines required cron workers and time-series aggregation that exceeded the hackathon timeline.
- **Automated Integration & E2E Test Suite (Time Constraints)**: I performed comprehensive manual verification of streaming flows and edge cases, but writing automated Jest/Playwright tests for non-deterministic SSE token streams would have cut into core feature delivery.
- **Second Financial Data Provider Integration (Deliberate Scope Decision)**: I chose not to wire up a secondary market data provider (like Alpha Vantage) as a fallback source. I judged that one robust provider combined with transparent "data unavailable" reporting was sufficient to prove the multi-agent ReAct gathering pattern without duplicating schema normalization logic.
- **Confidence-Over-Time Longitudinal Charting (Deliberate Scope Decision)**: I excluded multi-month confidence trend plotting because the core value proposition of InvestIQ is deep, adversarial point-in-time debate analysis rather than standard portfolio ticker tracking.

---

## 5. Real Example Runs

### Run 1: Tesla, Inc. (`TSLA`) — Public Company
- **Verdict**: `INVEST` (Confidence: **85%**)
- **Scores**:
  - Financial Health: **8/10**
  - Growth Potential: **7/10**
  - Market Position: **9/10**
  - Risk Level: **6/10**
- **Sample Bull Point**: *"Tesla's wide moat in battery technology and software integration provides a significant competitive advantage."* (`strength: strong`, `basedOn: Competitive Position`)
- **Sample Bear Point**: *"Tesla's high regulatory risk due to autonomous driving technology raises concerns about future compliance and potential fines."* (`strength: strong`, `basedOn: Risk Profile`)
- **Reasoning Summary**: *"Based on our analysis, we recommend investing in Tesla due to its strong brand, innovative products, and competitive advantage. However, we have a moderate level of confidence in our verdict due to the high regulatory risk and debt rating."*

### Run 2: Private / Unlisted Company
<!-- RUN LOCALLY AND PASTE REAL OUTPUT HERE — do not submit with placeholder text -->

### Run 3: Compare Mode Run (`TSLA` vs Competitor)
- **Winner**: `TOO_CLOSE`
- **Winner Reasoning**: *"Both companies have comparable risk-adjusted outlooks, with Tesla's strong brand and innovative products offset by regulatory risks and debt concerns."*
- **Category Comparison Highlights**:
  - **Financial Health**: `TIE` (Both scored 8/10)
  - **Growth Potential**: `Company B` (Scored 9/10 vs 7/10)
  - **Market Position**: `Company A` (Scored 9/10 vs 7/10)

---

## 6. Project Directory Structure

Verified tree listing of `backend/src` and `frontend/src`:

```
backend/src/
├── ai/
│   ├── comparison.js        # Compare Mode synthesis engine
│   ├── graph.js             # 8-node LangGraph.js StateGraph definition
│   ├── model.js             # LLM provider factory (Groq, Gemini, OpenAI)
│   └── tools/
│       ├── fundamentalsTool.js
│       └── searchTool.js
├── middleware/
│   ├── rateLimiter.js       # express-rate-limit configurations
│   └── requireAuth.js       # JWT cookie authentication guard
├── models/
│   ├── Chat.js              # Mongoose schema for Ask InvestIQ chats
│   ├── Comparison.js        # Mongoose schema for Compare Mode memos
│   ├── Report.js            # Mongoose schema for research reports
│   └── User.js              # Mongoose schema & JSON repository for users
├── routes/
│   ├── auth.js              # /api/auth signup, login, logout, me
│   ├── compare.js           # /api/compare SSE comparator endpoint
│   ├── reports.js           # /api/reports archive & PDF / chat endpoints
│   └── research.js          # /api/research SSE LangGraph endpoint
├── services/
│   └── pdfService.js        # Professional PDFKit 2-page memo generator
├── index.js                 # Express app server, CORS, Helmet, health route
└── polyfill.js              # Node.js compatibility polyfills

frontend/src/
├── components/
│   ├── AskInvestIQ.jsx          # Interactive Q&A chat modal/drawer
│   ├── AskInvestIQChat.jsx      # Conversational UI component
│   ├── DebatePanels.jsx         # Adversarial Bull vs Bear cards
│   ├── ErrorBoundary.jsx        # Production React error boundary
│   ├── GraphVisualizer.jsx      # LangGraph 8-node execution flow UI
│   ├── LiveLogConsole.jsx       # Real-time SSE log terminal window
│   ├── Navbar.jsx               # Navigation bar with auth state
│   ├── ProtectedRoute.jsx       # Route guard redirecting to /signin
│   ├── ScoreRadarChart.jsx      # Recharts 4-dimension radar chart
│   ├── Skeletons.jsx            # Loading skeleton states
│   └── SourcesList.jsx          # SEC EDGAR & web citations component
├── context/
│   └── AuthContext.jsx          # Global JWT session provider
├── views/
│   ├── CompareView.jsx          # Head-to-head comparison interface
│   ├── DashboardView.jsx        # Protected analyst command center
│   ├── HistoryView.jsx          # Saved research memos archive
│   ├── LandingView.jsx          # Public marketing landing page
│   ├── NotFoundView.jsx         # 404 page
│   ├── ResearchView.jsx         # Live streaming evaluation terminal
│   ├── SignInView.jsx           # Sign in interface
│   ├── SignUpView.jsx           # Account registration interface
│   └── WatchlistView.jsx        # Analyst watchlist interface
├── App.jsx                      # Route configurations
├── index.css                    # Design system tokens & styles
└── main.jsx                     # React application entry
```

---

## 7. Future Improvements & Personal Reflections

### What I'd Build Next
- **Portfolio & Watchlist Tracking**: Enable analysts to save tickers to an active watchlist and track confidence score shifts across repeated research runs over time.
- **Secondary Financial Data Fallback**: Integrate a second fundamental market data provider (e.g., Alpha Vantage or Polygon.io) to cross-check API responses and eliminate single-provider rate-limit bottlenecks.
- **Automated Integration & E2E Testing**: Add automated tests for the LangGraph.js execution graph and Server-Sent Events (SSE) streaming flow to catch parsing or timeout regressions early.
- **Google OAuth Sign-In**: Extend our JWT authentication flow with one-click Google OAuth for faster onboarding.
- **Adaptive Rate-Limit & Quota Handling**: Implement intelligent queueing and exponential backoff when free-tier LLM provider quotas (such as Gemini's daily tier limits) are approached.

### Personal Build Journey & Debugging Reflections
What made this build challenging wasn't just connecting to LLM APIs—it was debugging silent failures and making the multi-agent pipeline genuinely trustworthy. Early on, I discovered the pipeline was silently returning hardcoded mock data whenever an API key was missing or a request failed, masking underlying errors; I stripped out every silent fallback so the UI honestly reports when specific data gaps occur. I also ran into real-world integration quirks: troubleshooting deprecated Gemini model IDs (`gemini-1.5-flash`), navigating confusingly similar provider names (xAI's Grok vs. Groq), handling 429 quota exhaustion errors, and hardening our debate/decision nodes against malformed or markdown-wrapped JSON payloads. On the frontend, diagnosing a React 18 `StrictMode` double-render bug that ran our entire research pipeline twice per search—and fixing a hardcoded confidence bug where `INVEST` always defaulted to 80%—taught me the importance of strict state boundaries and ensuring every metric displayed is genuinely grounded in the LLM's analytical synthesis.

---

## 8. LLM Transcript Instructions

Full conversation logs and development session transcripts are located in the `/transcripts` directory of this repository.
- **Contents**: Includes both high-level architecture planning discussions and raw coding-agent execution logs capturing iterative debugging sessions.
- **What They Show**: The transcripts document our authentic iterative development journey, detailing how we discovered and resolved real production bugs—including stripping out silent fallback data, fixing the React 18 double-pipeline execution bug, and replacing hardcoded verdict confidence scores with genuine per-company LLM evaluation.
