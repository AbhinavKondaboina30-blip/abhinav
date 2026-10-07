import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import Results from './pages/Results';
import HistoryModal from './components/HistoryModal';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'analyzer' | 'results'
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Check health on mount to detect if AI API Key and Supabase are configured
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setAiConfigured(Boolean(data.aiConfigured));
        setSupabaseConfigured(Boolean(data.supabaseConfigured));
      }
    } catch (err) {
      console.warn('Backend health check error:', err);
    }
  };

  // Trigger Demo Mode: Works 100% offline without API key
  const handleTriggerDemo = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/demo');
      const json = await res.json();
      if (json.success && json.data?.analysis) {
        setAnalysisData(json.data.analysis);
        setCurrentView('results');
      } else {
        throw new Error('Could not load demo data.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Demo mode failed to load.');
    } finally {
      setIsLoading(false);
    }
  };

  // Perform Real Analysis
  const handleAnalyze = async ({ file, resumeText, jobTitle, company, jobDescription }) => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Send either JSON or Multipart FormData
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeText,
          jobTitle,
          company,
          jobDescription,
          isDemo: false
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Analysis failed. Please check inputs and try again.');
      }

      if (json.success && json.data) {
        setAnalysisData(json.data);
        setCurrentView('results');
      } else {
        throw new Error('Analysis response was malformed. Please try again.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromHistory = (savedAnalysis) => {
    setAnalysisData(savedAnalysis);
    setCurrentView('results');
  };

  return (
    <div className="app-container">
      <Header
        currentView={currentView}
        setView={setCurrentView}
        aiConfigured={aiConfigured}
        supabaseConfigured={supabaseConfigured}
        onTriggerDemo={handleTriggerDemo}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="main-content">
        {currentView === 'home' && (
          <Home
            onStartAnalyzer={() => setCurrentView('analyzer')}
            onTriggerDemo={handleTriggerDemo}
          />
        )}

        {currentView === 'analyzer' && (
          <Analyzer
            onAnalyze={handleAnalyze}
            onTriggerDemo={handleTriggerDemo}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {currentView === 'results' && (
          <Results
            analysis={analysisData}
            onResetAnalyzer={() => {
              setErrorMessage('');
              setCurrentView('analyzer');
            }}
          />
        )}
      </main>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectAnalysis={handleSelectFromHistory}
      />

      <footer className="footer">
        <p>CareerMatch AI — Hackathon MVP • Built for precision resume & job compatibility</p>
      </footer>
    </div>
  );
}
