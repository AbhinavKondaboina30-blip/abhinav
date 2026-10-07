import React from 'react';
import { Sparkles, FileSearch, PlayCircle, History, Database } from 'lucide-react';

export default function Header({
  currentView,
  setView,
  aiConfigured,
  supabaseConfigured,
  onTriggerDemo,
  onOpenHistory
}) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setView('home')}>
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <span className="brand-title">CareerMatch AI</span>
          <span className="brand-badge" style={{ marginLeft: 8 }}>Hackathon MVP</span>
        </div>
      </div>

      <nav className="nav-links">
        {/* Supabase status badge */}
        {supabaseConfigured && (
          <div
            className="api-status-badge configured"
            title="Connected to Supabase Cloud for persistent analysis storage"
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}
          >
            <Database size={12} />
            <span>Supabase Cloud</span>
          </div>
        )}

        {/* AI Status indicator */}
        <div
          className={`api-status-badge ${aiConfigured ? 'configured' : 'demo-only'}`}
          title={
            aiConfigured
              ? 'AI API Key configured via environment'
              : 'No AI key configured. Real analysis requires an API key, Demo Mode works 100% offline.'
          }
        >
          <span className="status-dot"></span>
          <span>{aiConfigured ? 'AI Ready' : 'Demo Mode Active'}</span>
        </div>

        <button
          className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setView('home')}
        >
          Home
        </button>

        <button
          className={`nav-btn ${currentView === 'analyzer' ? 'active' : ''}`}
          onClick={() => setView('analyzer')}
        >
          <FileSearch size={16} />
          Analyzer
        </button>

        <button
          className="nav-btn"
          onClick={onTriggerDemo}
          title="Run instant analysis with sample resume and job description"
        >
          <PlayCircle size={16} />
          Try Demo
        </button>

        <button
          className="nav-btn"
          onClick={onOpenHistory}
          title="View recent resume analyses"
        >
          <History size={16} />
          History
        </button>
      </nav>
    </header>
  );
}
