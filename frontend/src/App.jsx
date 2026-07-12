import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingView } from './views/LandingView';
import { ResearchView } from './views/ResearchView';
import { HistoryView } from './views/HistoryView';
import { CompareView } from './views/CompareView';
import { WatchlistView } from './views/WatchlistView';
import { NotFoundView } from './views/NotFoundView';
import { SignInView } from './views/SignInView';
import { SignUpView } from './views/SignUpView';
import { DashboardView } from './views/DashboardView';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/terminal"
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              }
            />
            <Route path="/signin" element={<SignInView />} />
            <Route path="/signup" element={<SignUpView />} />
            <Route
              path="/research/:queryOrId"
              element={
                <ProtectedRoute>
                  <ResearchView />
                </ProtectedRoute>
              }
            />
            <Route path="/report/:queryOrId/public" element={<ResearchView />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <CompareView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <WatchlistView />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
