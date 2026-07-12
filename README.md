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

## Key Features & Institutional Differentiators

### 1. Public Marketing Portal & Protected Institutional Terminal
- **Public Marketing Page (`/`)**: High-converting, static-first institutional landing page explaining the multi-agent committee workflow and sample deliverables without requiring login.
- **Protected Analyst Command Center (`/dashboard`, `/terminal`)**: Secured via JWT authentication. Signed-in analysts can enter any ticker or company name to trigger live multi-agent evaluations, access their research archive, or launch comparative memos.

### 2. Multi-Agent LangGraph.js ReAct Pipeline (8-Node Graph)
Unlike single-prompt summarizers that suffer from confirmation bias and hallucination, InvestIQ runs a deterministic **8-node stateful directed graph**:
1. `routerNode`: Resolves company names to verified stock symbols and SEC EDGAR entity mappings.
2. `fundamentalsAgent`: Audits 10-K/10-Q metrics, revenue growth, operating margins, and cash flows.
3. `newsSentimentAgent`: Analyzes live macroeconomic headlines and market sentiment tone.
4. `competitiveAgent`: Evaluates pricing power, economic moats, and peer dynamics.
5. `riskAgent`: Audits corporate governance, customer concentration, and macro headwinds.
6. `debateNode`: Pits a dedicated **Bull Persona** against an opposing **Bear Persona** to argue structured thesis points (`strength: strong | moderate | minor` with explicit `basedOn` source attribution).
7. `decisionNode`: Weighs both sides against a 4-dimension quantitative rubric (`financialHealth`, `growthPotential`, `marketPosition`, `riskLevel` on 0-10 scales) to issue a definitive `INVEST`, `WATCH`, or `PASS` verdict with honest confidence scoring.
8. `reportNode`: Compiles the executive memo, generates interactive radar charts, and persists results.

### 3. Head-to-Head Compare Mode (`/compare`)
- Enter any two companies or stock tickers (e.g., `TSLA` vs `NVDA`) to run concurrent LangGraph pipelines via live Server-Sent Events (SSE).
- Synthesizes relative valuation, moat durability, and risk profiles to deliver a side-by-side comparative scorecard and definitive capital allocation winner.

### 4. Interactive "Ask InvestIQ" Grounded Chatbot (`/api/reports/:id/chat`)
- Every completed report features a full conversational chat drawer.
- Ask complex multi-turn follow-up questions grounded strictly in the gathered report context (no generic hallucinated financial advice).

### 5. Verified Source Citations & PDF Memo Export
- Every claim in the report is linked to its supporting data source.
- Export clean, professional two-page PDF investment briefings (`/api/reports/:id/pdf`) ready for investment committee reviews.

### 6. Enterprise Security & Full JWT Authentication
- **Secure Password Hashing**: Hashed with `bcryptjs` (cost factor 12).
- **Session Security**: Signed JWT tokens stored in `httpOnly`, `sameSite=lax`, secure cookies (`investiq_token`).
- **User Scoping**: Reports and comparison memos are automatically tagged with the authenticated user's ID so analysts manage their own private research archive.
- **API Hardening**: Protects endpoints with `helmet` security headers, `compression`, explicit CORS rules, and `express-rate-limit` (preventing DDoS or credential brute-forcing).
- **Startup Integrity Check**: Validates required environment variables on launch and fails fast with actionable diagnostics.

---

## Architecture Flow

```
+--------------------------------------------------------------------------------------------------+
|                                    FRONTEND (React 18 + Vite)                                    |
|  Public Landing Page (/) | Protected Dashboard (/dashboard) | Live SSE Terminal | Compare Mode   |
+--------------------------------------------------------------------------------------------------+
         |                                                 ^
         | POST /api/auth/login | POST /api/research       | Server-Sent Events (SSE)
         | POST /api/compare    | POST /api/reports/:id/chat| Real-time Agent Logs & Partial State
         v                                                 |
+--------------------------------------------------------------------------------------------------+
|                            BACKEND (Node.js + Express + Mongoose + JWT)                          |
|  Security Middleware: Helmet | Rate Limiters | Cookie Parser | requireAuth Route Protection      |
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
|                                                 |                                                |
|                                                 v                                                |
|                        MongoDB Persisted Storage + Local Filesystem Fallback                     |
+--------------------------------------------------------------------------------------------------+
```

---

## Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18 or v20+
- **npm**: v9+

### 2. Installation
Install dependencies for both frontend and backend from the monorepo root:
```bash
npm install
```

### 3. Environment Setup
Copy the example environment configuration in `/backend`:
```bash
cp backend/.env.example backend/.env
```

Ensure `backend/.env` contains your LLM provider configuration:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/investiq
JWT_SECRET=your-secure-jwt-secret-key

# LLM Configuration (supports groq, gemini, openai, anthropic)
LLM_PROVIDER=groq
LLM_API_KEY=your_llm_api_key_here

FRONTEND_URL=http://localhost:5173
```
*(Note: InvestIQ includes intelligent simulation fallbacks if MongoDB or specific financial data APIs are unavailable).*

### 4. Running the Application Locally
Start both the Express API server and the Vite React development server concurrently from the root directory:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5001](http://localhost:5001)

---

## Using the Terminal

1. **Visit the Public Landing Page (`/`)**: Explore the 4-step multi-agent institutional workflow and preview sample reports.
2. **Register or Sign In (`/signup` or `/signin`)**: Create an institutional analyst account to unlock the terminal.
3. **Launch Multi-Agent Research (`/dashboard`)**: Type any company name or ticker symbol (e.g., `TSLA`, `NVIDIA`, `Apple`, `Zomato`) to watch the 4 specialist agents investigate filings and debate live via SSE.
4. **Compare Two Companies (`/compare`)**: Run a head-to-head comparison between two competitors to receive a comparative scorecard and recommendation.
5. **Ask Grounded Questions**: Open the **Ask InvestIQ** chat drawer on any completed report to ask tailored follow-up questions.
6. **Export Briefing Memos**: Click **Download PDF Memo** to export a formatted briefing for your committee.

---

## Production Build & Verification
To verify and compile production bundles across the monorepo:
```bash
npm run build
```
This builds both the backend server and the production-optimized Vite static bundle in `frontend/dist`.
