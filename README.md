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

| Decision / Area | Selected Approach | Technical Reasoning |
| :--- | :--- | :--- |
| **LLM Provider** | **Groq (`LLM_PROVIDER=groq`)** | Configured in `model.js` & `.env` for ultra-low latency token generation during SSE live streaming. Supports fallback to Gemini, OpenAI, or Anthropic. |
| **Multi-Agent Orchestration** | **LangGraph.js Directed State Graph** | Provides deterministic execution order, state channel persistence, and explicit parallel fan-out / fan-in execution over unstructured LLM chains. |
| **Full-Stack Framework** | **MERN Monorepo (Express + Vite React)** | <!-- TODO: Developer to fill in personal reasoning for choosing MERN Express over Next.js API routes --> |
| **Database & Fallback Strategy** | **MongoDB + Local JSON Fallback** | Ensures 100% demo reliability even if external DB connectivity drops or network restrictions apply. |

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
<!-- Personal developer reflections and planned enhancements -->

## 8. LLM Transcript Instructions
<!-- Instructions for review of model execution transcripts -->
