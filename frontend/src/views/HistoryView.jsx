import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react';

export const HistoryView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching research history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the research report for "${name}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/reports/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReports((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert('Failed to delete report.');
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Error connecting to server.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllReports = async () => {
    if (!window.confirm('Are you sure you want to delete ALL previously searched company reports from the archive? This action cannot be undone.')) {
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/reports`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReports([]);
      } else {
        alert('Failed to clear reports.');
      }
    } catch (err) {
      console.error('Error clearing reports:', err);
      alert('Error connecting to server.');
    }
  };

  const handleDownloadPdf = (id, ticker) => {
    if (!id) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    window.open(`${apiUrl}/api/reports/${id}/pdf`, '_blank');
  };

  const filteredReports = reports.filter((r) =>
    (r.companyName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.resolvedTicker || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const renderVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'INVEST':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            INVEST
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            WATCH
          </span>
        );
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            PASS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {verdict}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>INVESTIQ ARCHIVE DATABASE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Research History & Dashboards
          </h1>
          <p className="text-sm text-slate-400">
            All completed institutional investment research runs saved in MongoDB / local repository.
          </p>
        </div>

        {/* Filter Input and Clear Archive */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {reports.length > 0 && (
            <button
              onClick={handleClearAllReports}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="Delete all research reports"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Archive
            </button>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter company or ticker..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm font-mono">Loading archive records...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <Sparkles className="w-10 h-10 text-slate-600" />
          <div>
            <h3 className="font-bold text-white text-base">No Completed Research Runs Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Start your first multi-agent investment research run by searching any company on the terminal landing page.
            </p>
          </div>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20"
          >
            Launch New Research
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-xs font-mono uppercase text-slate-400">
                  <th className="py-4 px-6">Company / Ticker</th>
                  <th className="py-4 px-6">AI Committee Verdict</th>
                  <th className="py-4 px-6">Confidence</th>
                  <th className="py-4 px-6">Date Run</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredReports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-4 px-6 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {report.companyName}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                          {report.resolvedTicker}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{renderVerdictBadge(report.verdict)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">
                          {report.confidence}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${report.confidence}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-400">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString()
                        : 'Recent'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/research/${report._id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Memo
                        </Link>
                        <button
                          onClick={() => handleDownloadPdf(report._id, report.resolvedTicker)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 transition-colors"
                          title="Download PDF Memo"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report._id, report.companyName)}
                          disabled={deletingId === report._id}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors disabled:opacity-50"
                          title="Delete Report"
                        >
                          {deletingId === report._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
