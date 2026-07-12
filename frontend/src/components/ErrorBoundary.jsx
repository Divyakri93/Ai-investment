import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Institutional Terminal Error Boundary Caught Exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-red-500/30 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-extrabold">
                SYSTEM EXCEPTION DETECTED
              </span>
              <h1 className="text-xl font-bold text-white">
                InvestIQ Terminal Recovered State
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected component runtime exception occurred. The institutional session state has been isolated to prevent data loss.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Institutional Terminal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
