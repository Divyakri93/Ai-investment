import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingView } from './views/LandingView';
import { ResearchView } from './views/ResearchView';
import { HistoryView } from './views/HistoryView';

export const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/research/:queryOrId" element={<ResearchView />} />
            <Route path="/history" element={<HistoryView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
