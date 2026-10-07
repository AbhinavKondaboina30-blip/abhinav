import React from 'react';
import { ArrowRight, Play, CheckCircle2, AlertTriangle, Target, Zap } from 'lucide-react';

export default function Home({ onStartAnalyzer, onTriggerDemo }) {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-pill">
          <Zap size={15} />
          <span>Smart Career Compatibility Assistant</span>
        </div>

        <h1 className="hero-title">
          Know How Well Your Resume Matches the Job
        </h1>

        <p className="hero-subtitle">
          Upload your resume and compare it with a job description to discover matching skills, missing skills, and ways to improve your resume.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={onStartAnalyzer}>
            <span>Analyze Resume</span>
            <ArrowRight size={18} />
          </button>

          <button className="btn-secondary" onClick={onTriggerDemo}>
            <Play size={16} fill="currentColor" />
            <span>Try Demo</span>
          </button>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="feature-title">Skill Gap Detection</h3>
          <p className="feature-desc">
            Instantly identifies your exact matched skills and pinpoint missing high-priority requirements without false guesswork.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrap">
            <Target size={24} />
          </div>
          <h3 className="feature-title">Semantic Matching Engine</h3>
          <p className="feature-desc">
            Understands conceptual relationships (e.g., MySQL satisfies relational database experience) rather than naive keyword stuffing.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrap">
            <AlertTriangle size={24} />
          </div>
          <h3 className="feature-title">Actionable Weakness Fixes</h3>
          <p className="feature-desc">
            Get targeted resume recommendations, specific project suggestions, and a realistic step-by-step career action plan.
          </p>
        </div>
      </section>
    </div>
  );
}
