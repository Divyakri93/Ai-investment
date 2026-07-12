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
  Trash2
} from 'lucide-react';
import { GraphVisualizer } from '../components/GraphVisualizer';
import { LiveLogConsole } from '../components/LiveLogConsole';
import { ScoreRadarChart } from '../components/ScoreRadarChart';
import { DebatePanels } from '../components/DebatePanels';
import { SourcesList } from '../components/SourcesList';

export const ResearchView = () => {
  const { queryOrId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeNodes, setActiveNodes] = useState(['routerNode']);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

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
      const res = await fetch(`${apiUrl}/api/reports/${id}`);
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

  const startLiveResearchStream = async (companyQuery) => {
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
        body: JSON.stringify({ companyQuery })
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
      const res = await fetch(`${apiUrl}/api/reports/${id}`, { method: 'DELETE' });
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
          {/* Main Verdict Card */}
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
                {renderVerdictBadge(report.verdict)}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">INSTITUTIONAL CONFIDENCE:</span>
                  <span className="font-bold text-white text-sm">
                    {report.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>

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
        </div>
      )}
    </div>
  );
};
