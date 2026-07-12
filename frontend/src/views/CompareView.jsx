import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search
} from 'lucide-react';

export const CompareView = () => {
  const [reports, setReports] = useState([]);
  const [tickerA, setTickerA] = useState('');
  const [tickerB, setTickerB] = useState('');
  const [reportA, setReportA] = useState(null);
  const [reportB, setReportB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetch(`${apiUrl}/api/reports`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
          if (data.length >= 2) {
            setReportA(data[0]);
            setReportB(data[1]);
            setTickerA(data[0].resolvedTicker || data[0].companyName);
            setTickerB(data[1].resolvedTicker || data[1].companyName);
          } else if (data.length === 1) {
            setReportA(data[0]);
            setTickerA(data[0].resolvedTicker || data[0].companyName);
          }
        }
      })
      .catch((e) => console.error('Failed to load history for comparison:', e));
  }, [apiUrl]);

  const handleCompareSelect = (rep, side) => {
    if (side === 'A') {
      setReportA(rep);
      setTickerA(rep.resolvedTicker || rep.companyName);
    } else {
      setReportB(rep);
      setTickerB(rep.resolvedTicker || rep.companyName);
    }
  };

  const renderVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'INVEST':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4" />
            INVEST
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-4 h-4" />
            WATCH
          </span>
        );
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-red-500/15 text-red-400 border border-red-500/40">
            <XCircle className="w-4 h-4" />
            PASS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-500/15 text-slate-300 border border-slate-500/40">
            {verdict || 'N/A'}
          </span>
        );
    }
  };

  const renderScoreRow = (label, scoreA, scoreB) => (
    <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-slate-800/80 text-xs font-mono">
      <div className="text-right font-bold text-cyan-400">{scoreA ?? 'N/A'} / 10</div>
      <div className="text-center text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-left font-bold text-cyan-400">{scoreB ?? 'N/A'} / 10</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO TERMINAL LANDING</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-cyan-400" />
            Institutional Compare Mode
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Side-by-side adversarial investment committee comparison across two companies
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company A Selector */}
        <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-3">
          <label className="text-xs font-mono text-cyan-400 font-bold block uppercase tracking-wider">
            Select Company A
          </label>
          <select
            value={reportA?._id || reportA?.reportId || ''}
            onChange={(e) => {
              const selected = reports.find((r) => (r._id || r.reportId) === e.target.value);
              if (selected) handleCompareSelect(selected, 'A');
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">-- Choose from archive --</option>
            {reports.map((r, i) => (
              <option key={i} value={r._id || r.reportId}>
                {r.companyName || r.resolvedCompanyName} ({r.resolvedTicker}) - {r.verdict}
              </option>
            ))}
          </select>
        </div>

        {/* Company B Selector */}
        <div className="glass-card p-6 rounded-3xl border border-blue-500/30 space-y-3">
          <label className="text-xs font-mono text-blue-400 font-bold block uppercase tracking-wider">
            Select Company B
          </label>
          <select
            value={reportB?._id || reportB?.reportId || ''}
            onChange={(e) => {
              const selected = reports.find((r) => (r._id || r.reportId) === e.target.value);
              if (selected) handleCompareSelect(selected, 'B');
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Choose from archive --</option>
            {reports.map((r, i) => (
              <option key={i} value={r._id || r.reportId}>
                {r.companyName || r.resolvedCompanyName} ({r.resolvedTicker}) - {r.verdict}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      {reportA && reportB ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Header Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">
                    {reportA.companyName || reportA.resolvedCompanyName}
                  </h2>
                  <span className="text-xs font-mono text-cyan-400">
                    {reportA.resolvedTicker}
                  </span>
                </div>
                {renderVerdictBadge(reportA.verdict)}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">CONFIDENCE:</span>
                <span className="font-extrabold text-white">{reportA.confidence}%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                {reportA.plainSummary || reportA.reasoningSummary}
              </p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-blue-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">
                    {reportB.companyName || reportB.resolvedCompanyName}
                  </h2>
                  <span className="text-xs font-mono text-blue-400">
                    {reportB.resolvedTicker}
                  </span>
                </div>
                {renderVerdictBadge(reportB.verdict)}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">CONFIDENCE:</span>
                <span className="font-extrabold text-white">{reportB.confidence}%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                {reportB.plainSummary || reportB.reasoningSummary}
              </p>
            </div>
          </div>

          {/* Dimension Scorecard Comparison */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-center text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              Direct Dimension Scorecard Breakdown
            </h3>
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-3 gap-4 pb-3 border-b border-slate-700 text-xs font-bold font-mono text-slate-400">
                <div className="text-right text-cyan-400">
                  {reportA.resolvedTicker || reportA.companyName}
                </div>
                <div className="text-center">METRIC</div>
                <div className="text-left text-blue-400">
                  {reportB.resolvedTicker || reportB.companyName}
                </div>
              </div>
              {renderScoreRow('Financial Health', reportA.scores?.financialHealth?.score, reportB.scores?.financialHealth?.score)}
              {renderScoreRow('Growth Potential', reportA.scores?.growthPotential?.score, reportB.scores?.growthPotential?.score)}
              {renderScoreRow('Market Position', reportA.scores?.marketPosition?.score, reportB.scores?.marketPosition?.score)}
              {renderScoreRow('Risk Level', reportA.scores?.riskLevel?.score, reportB.scores?.riskLevel?.score)}
            </div>
          </div>

          {/* Bull / Bear Thesis Point Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {reportA.resolvedTicker} Bull Points ({Array.isArray(reportA.bullCase) ? reportA.bullCase.length : 1})
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                {Array.isArray(reportA.bullCase) ? (
                  reportA.bullCase.map((p, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20">
                      • {p.point || p}
                    </div>
                  ))
                ) : (
                  <p>{reportA.bullCase}</p>
                )}
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {reportB.resolvedTicker} Bull Points ({Array.isArray(reportB.bullCase) ? reportB.bullCase.length : 1})
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                {Array.isArray(reportB.bullCase) ? (
                  reportB.bullCase.map((p, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20">
                      • {p.point || p}
                    </div>
                  ))
                ) : (
                  <p>{reportB.bullCase}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <p className="text-slate-400 text-sm font-mono">
            Please select two companies from your research history above to compare them side by side.
          </p>
        </div>
      )}
    </div>
  );
};
