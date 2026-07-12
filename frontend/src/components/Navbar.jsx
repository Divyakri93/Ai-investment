import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Activity, History, Terminal, GitCompare, BookmarkCheck, LogOut, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white">InvestIQ</span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                INSTITUTIONAL AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              MULTI-AGENT EQUITY RESEARCH TERMINAL
            </p>
          </div>
        </Link>

        {/* Navigation Controls */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {user && (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  location.pathname === '/dashboard' || location.pathname === '/terminal'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>TERMINAL</span>
              </Link>

              <Link
                to="/compare"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  location.pathname === '/compare'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>COMPARE</span>
              </Link>

              <Link
                to="/watchlist"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  location.pathname === '/watchlist'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>WATCHLIST</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  location.pathname === '/history'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>ARCHIVE</span>
              </Link>

              <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[11px] font-mono text-emerald-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pl-2 sm:pl-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>GO TO DASHBOARD</span>
                </Link>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{user.name || user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/signin"
                  className="text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <span>GET STARTED FREE</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
