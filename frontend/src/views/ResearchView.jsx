import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Share2,
  Activity,
  Trash2,
  RefreshCw,
  HelpCircle,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { toggleWatchlist, isInWatchlist } from '../utils/watchlist';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { LiveLogConsole } from '../components/LiveLogConsole';
import { ScoreRadarChart } from '../components/ScoreRadarChart';
import { DebatePanels } from '../components/DebatePanels';
import { SourcesList } from '../components/SourcesList';
import { AskInvestIQ } from '../components/AskInvestIQ';

export const ResearchView = () => {
  const { queryOrId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeNodes, setActiveNodes] = useState(['routerNode']);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [explainMode, setExplainMode] = useState('beginner');
  const [chatTriggerPrompt, setChatTriggerPrompt] = useState(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (report) {
      setIsPinned(isInWatchlist(report));
    }
  }, [report]);

  const hasStarted = useRef(false);
  const lastQueryOrId = useRef(null);

  useEffect(() => {
    if (!queryOrId) return;
    if (hasStarted.current && lastQueryOrId.current === queryOrId) return;
    hasStarted.current = true;
    lastQueryOrId.current = queryOrId;

    // Check if queryOrId looks like a Mongo or Local ID
    if (queryOrId.startsWith('local-') || /^[0-9a-fA-F]{24}$/.test(queryOrId)) {
      fetchReportById(queryOrId);
    } else {
      startLiveResearchStream(decodeURIComponent(queryOrId));
    }
  }, [queryOrId]);

  const fetchReportById = async (id) => {
    setIsStreaming(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/reports/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setCompletedNodes([
          'routerNode',
          'fundamentalsAgent',
          'newsSentimentAgent',
          'competitiveAgent',
          'riskAgent',
          'debateNode',
          'decisionNode',
          'reportNode'
        ]);
      } else {
        setErrorMessage('Failed to load archived research report.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error fetching report from server.');
    }
  };

  const startLiveResearchStream = async (companyQuery, forceRefresh = false) => {
    setIsStreaming(true);
    setLogs([]);
    setActiveNodes(['routerNode']);
    setCompletedNodes([]);
    setReport(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ companyQuery, forceRefresh })
      });

      if (!response.ok || !response.body) {
        throw new Error('Server returned invalid stream response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const eventBlock of events) {
          const lines = eventBlock.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.replace('data: ', '').trim();
            }
          }

          if (eventType && dataStr) {
            try {
              const payload = JSON.parse(dataStr);
              if (eventType === 'log') {
                setLogs((prev) => [...prev, payload]);
              } else if (eventType === 'partial') {
                const nodeName = payload.node;
                setActiveNodes((prev) => prev.filter((n) => n !== nodeName));
                setCompletedNodes((prev) =>
                  prev.includes(nodeName) ? prev : [...prev, nodeName]
                );
                if (payload.state) {
                  setReport((prev) => ({
                    ...(prev || {}),
                    ...payload.state
                  }));
                }
              } else if (eventType === 'final') {
                setReport(payload);
                setIsStreaming(false);
                setActiveNodes([]);
                setCompletedNodes([
                  'routerNode',
                  'fundamentalsAgent',
                  'newsSentimentAgent',
                  'competitiveAgent',
                  'riskAgent',
                  'debateNode',
                  'decisionNode',
                  'reportNode'
                ]);
              } else if (eventType === 'error') {
                setErrorMessage(payload.message);
                setIsStreaming(false);
              }
            } catch (err) {
              // Parse error ignored
            }
          }
        }
      }
    } catch (err) {
      console.error('SSE Live Stream failed:', err);
      setErrorMessage(err.message || 'Error connecting to research pipeline.');
      setIsStreaming(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!report?.reportId && !report?._id) return;
    const id = report.reportId || report._id;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    window.open(`${apiUrl}/api/reports/${id}/pdf`, '_blank');
  };

  const handleDeleteCurrentReport = async () => {
    if (!report?.reportId && !report?._id) return;
    const id = report.reportId || report._id;
    const name = report.companyName || report.resolvedCompanyName || report.resolvedTicker || 'this report';
    if (!window.confirm(`Are you sure you want to delete the research report for "${name}"?`)) {
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/reports/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        navigate('/history');
      } else {
        alert('Failed to delete report.');
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Error connecting to server.');
    }
  };

  const handleCopyShareLink = () => {
    if (!report) return;
    const id = report.reportId || report._id;
    const url = `${window.location.origin}/report/${id}/public`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const renderVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'INVEST':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-4 h-4" />
            FINAL VERDICT: INVEST
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-4 h-4" />
            FINAL VERDICT: WATCH
          </span>
        );
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-extrabold bg-red-500/15 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10">
            <XCircle className="w-4 h-4" />
            FINAL VERDICT: PASS
          </span>
        );
      case 'INCOMPLETE':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-extrabold bg-slate-500/15 text-slate-300 border border-slate-500/40 shadow-lg shadow-slate-500/10">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            FINAL VERDICT: INCOMPLETE (DATA GAPS)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumbs & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO TERMINAL LANDING</span>
        </Link>

        {report && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Investment Memo</span>
            </button>
            <button
              onClick={() => startLiveResearchStream(report.companyName || report.resolvedTicker || queryOrId, true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Force a brand new live AI evaluation bypassing 24h cache"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Force New Evaluation</span>
            </button>
            <button
              onClick={() => {
                toggleWatchlist(report);
                setIsPinned(isInWatchlist(report));
              }}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border ${
                isPinned
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Pin this memo to your session Watchlist"
            >
              {isPinned ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Pinned to Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Pin to Watchlist</span>
                </>
              )}
            </button>
            <button
              onClick={handleCopyShareLink}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Copy public link to this report"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareCopied ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>
            <button
              onClick={handleDeleteCurrentReport}
              className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Delete this report"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Report</span>
            </button>
          </div>
        )}
      </div>

      {/* LangGraph Visualizer */}
      <GraphVisualizer
        activeNodes={activeNodes}
        completedNodes={completedNodes}
      />

      {/* Error Banner if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm flex items-center gap-3 font-mono">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Stream Status Banner */}
      {isStreaming && (
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-blue-950/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Agentic Committee Live Evaluation in Progress...
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Streaming Server-Sent Events (SSE) telemetry from Express LangGraph pipeline
              </p>
            </div>
          </div>
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Telemetry Log Console */}
      <LiveLogConsole logs={logs} />

      {/* Final Verdict Memo Dashboard */}
      {report && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Executive Summary Card (Explainability Toggle & Interactive Inquiry) */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-blue-950/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                      EXECUTIVE SYNTHESIS
                    </span>
                    {/* Explainability Mode Toggle (Differentiator #17) */}
                    <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/80 p-0.5 rounded-lg text-[10px] font-mono">
                      <button
                        onClick={() => setExplainMode('beginner')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          explainMode === 'beginner'
                            ? 'bg-cyan-500 text-slate-950 font-extrabold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Beginner (Plain Language)
                      </button>
                      <button
                        onClick={() => setExplainMode('technical')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          explainMode === 'technical'
                            ? 'bg-cyan-500 text-slate-950 font-extrabold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Institutional Detail
                      </button>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    InvestIQ recommends {report.verdict} on {report.companyName || report.resolvedCompanyName} with {report.confidence}% confidence.
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {renderVerdictBadge(report.verdict)}
                {/* One-Click Inquiry Button (Differentiator #18) */}
                <button
                  onClick={() => {
                    setChatTriggerPrompt(
                      `Why did InvestIQ rate ${report.companyName || report.resolvedTicker} a ${report.verdict} (${report.confidence}% confidence) instead of a stronger alternative? Explain the exact trade-offs.`
                    );
                    setTimeout(() => {
                      document.getElementById('ask-investiq-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Ask Ask InvestIQ AI why this verdict was selected"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why {report.verdict}?</span>
                </button>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
              {explainMode === 'beginner'
                ? report.plainSummary || report.reasoningSummary
                : report.reasoningSummary || report.plainSummary}
            </p>
          </div>

          {/* Main Verdict & Data Completeness Card */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {report.companyName || report.resolvedCompanyName}
                  </h1>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700">
                    {report.resolvedTicker}
                  </span>
                  {(report.isPubliclyTraded === false || report.fundamentalsData?.isPubliclyTraded === false) && (
                    <span className="text-xs font-mono px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
                      Private / Not Publicly Traded
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
                  {report.reasoningSummary}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">INSTITUTIONAL CONFIDENCE:</span>
                  <span className="font-bold text-white text-sm">
                    {report.confidence}%
                  </span>
                </div>

                {/* Data Completeness Visual Meter (B3) */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 mr-1">DATA INDEX:</span>
                  {[
                    { label: 'FIN', active: report.fundamentalsData && Object.keys(report.fundamentalsData).length > 0 && !report.fundamentalsData.error },
                    { label: 'NEWS', active: report.newsData && Object.keys(report.newsData).length > 0 && !report.newsData.error },
                    { label: 'CMP', active: report.competitiveData && Object.keys(report.competitiveData).length > 0 && !report.competitiveData.error },
                    { label: 'RSK', active: report.riskData && Object.keys(report.riskData).length > 0 && !report.riskData.error }
                  ].map((seg, i) => (
                    <span
                      key={i}
                      title={seg.active ? `${seg.label} verified` : `${seg.label} degraded/unavailable`}
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        seg.active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {seg.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What Would Change This Verdict Section (A3) */}
          {Array.isArray(report.watchTriggers) && report.watchTriggers.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-transparent space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>WHAT WOULD CHANGE THIS VERDICT (KEY WATCH TRIGGERS)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.watchTriggers.map((trigger, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-amber-500/20 flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-slate-200 leading-relaxed font-sans">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Gaps Warning Box */}
          {Array.isArray(report.dataGaps) && report.dataGaps.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-amber-500/40 bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>DATA GAPS & DEGRADED RESEARCH WARNINGS</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                {report.dataGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Private Company Status Banner */}
          {(report.isPubliclyTraded === false || report.fundamentalsData?.isPubliclyTraded === false) && (
            <div className="glass-card p-6 rounded-3xl border border-purple-500/40 bg-purple-950/20 space-y-2">
              <div className="flex items-center gap-2.5 text-purple-300 font-bold text-sm">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-xs font-mono uppercase tracking-wider">Private / Not Publicly Traded</span>
                <span>Qualitative Market & Valuation Profile</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {report.fundamentalsData?.publicStatusMessage || `${report.companyName || report.resolvedCompanyName} is not an independently publicly traded company — fundamentals data is not available via public market APIs. Proceeding with qualitative research only.`}
              </p>
            </div>
          )}

          {/* Score Radar Chart & Fundamentals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScoreRadarChart scores={report.scores} />
            </div>

            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Institutional Dimension Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.scores &&
                  Object.entries(report.scores).map(([key, item]) => {
                    if (!item) return null;
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 uppercase font-mono">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-sm font-extrabold font-mono text-cyan-400">
                            {item.score}/10
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">
                          {item.rationale}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Adversarial Debate Panels */}
          <DebatePanels bullCase={report.bullCase} bearCase={report.bearCase} />

          {/* Primary Research Sources List */}
          <SourcesList sources={report.sources} />

          {/* Ask InvestIQ Grounded Multi-Turn Conversational Assistant Panel */}
          <div id="ask-investiq-section">
            <AskInvestIQ
              reportId={report.reportId || report._id}
              companyName={report.companyName || report.resolvedCompanyName}
              triggerPrompt={chatTriggerPrompt}
              onClearTrigger={() => setChatTriggerPrompt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
