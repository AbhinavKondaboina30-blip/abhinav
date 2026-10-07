import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  ListOrdered,
  Tag,
  ArrowLeft,
  Copy,
  Check,
  Info,
  ShieldAlert
} from 'lucide-react';
import ScoreGauge, { getScoreTheme } from '../components/ScoreGauge';

export default function Results({ analysis, onResetAnalyzer }) {
  const [copied, setCopied] = useState(false);

  if (!analysis) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No analysis loaded.</p>
        <button className="btn-primary" onClick={onResetAnalyzer} style={{ marginTop: 16 }}>
          Start an Analysis
        </button>
      </div>
    );
  }

  const {
    isDemo,
    isFallback,
    fallbackMessage,
    jobTitle,
    company,
    compatibilityScore = 0,
    scoreRating = 'Moderate Match',
    scoreBreakdown = {},
    summary,
    matchedSkills = [],
    missingSkills = [],
    partialSkills = [],
    foundKeywords = [],
    missingKeywords = [],
    weaknesses = [],
    improvements = [],
    actionPlan = []
  } = analysis;

  const scoreTheme = getScoreTheme(compatibilityScore);

  const handleCopySummary = () => {
    const textToCopy = `CareerMatch AI Analysis for: ${jobTitle || 'Target Role'} ${company ? `(${company})` : ''}
Compatibility Score: ${compatibilityScore}% (${scoreRating})
Matched Skills: ${matchedSkills.join(', ')}
Missing Skills: ${missingSkills.map((m) => (typeof m === 'string' ? m : m.skill)).join(', ')}
Summary: ${summary}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="results-view">
      {/* DEMO NOTICE BANNER */}
      {isDemo && !isFallback && (
        <div className="alert-banner demo">
          <Info size={20} />
          <div style={{ flex: 1 }}>
            <strong>Demo Analysis:</strong> Evaluated with predefined sample data. No API key required. This sample illustrates how CareerMatch identifies genuine matches, high-priority gaps, and action items.
          </div>
        </div>
      )}

      {/* FALLBACK NOTICE BANNER */}
      {isFallback && (
        <div className="alert-banner warning" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fde68a' }}>
          <AlertCircle size={20} color="#fbbf24" />
          <div style={{ flex: 1 }}>
            <strong>Fallback Analysis:</strong> {fallbackMessage || 'AI analysis is currently unavailable, so this analysis was generated using the built-in fallback engine.'}
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="results-header">
        <div className="results-meta">
          <button
            className="nav-btn"
            style={{ padding: '4px 0', marginBottom: 8 }}
            onClick={onResetAnalyzer}
          >
            <ArrowLeft size={16} />
            <span>Back to Analyzer</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1>{jobTitle || 'Role Compatibility Analysis'}</h1>
            {isFallback && (
              <span className="brand-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                Fallback Analysis
              </span>
            )}
            {isDemo && (
              <span className="brand-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                Demo Analysis
              </span>
            )}
          </div>
          <p className="results-subtitle">
            {company ? `${company} • ` : ''}{isFallback ? 'Fallback Analysis' : 'Target Match Evaluation'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={handleCopySummary} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
          <button className="btn-primary" onClick={onResetAnalyzer} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Analyze Another Resume
          </button>
        </div>
      </div>

      {/* OVERALL SCORE HERO CARD */}
      <div className="score-hero-card">
        <div>
          <ScoreGauge score={compatibilityScore} />
        </div>

        <div className="score-details-col">
          <div className="score-title-row">
            <h2 className="score-main-title">CareerMatch Compatibility Score</h2>
            <span
              className="score-rating-badge"
              style={{
                backgroundColor: scoreTheme.bg,
                color: scoreTheme.text,
                border: `1px solid ${scoreTheme.border}`
              }}
            >
              {scoreRating}
            </span>
          </div>

          <p className="score-summary-text">{summary}</p>

          {/* Breakdown bars */}
          <div className="score-bars-grid">
            <div className="score-bar-item">
              <div className="score-bar-header">
                <span>Skill Match (60%)</span>
                <strong>{scoreBreakdown.skillMatchScore ?? Math.round(compatibilityScore * 0.6)} / 60</strong>
              </div>
              <div className="score-bar-track">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${((scoreBreakdown.skillMatchScore ?? (compatibilityScore * 0.6)) / 60) * 100}%`,
                    backgroundColor: scoreTheme.stroke
                  }}
                />
              </div>
            </div>

            <div className="score-bar-item">
              <div className="score-bar-header">
                <span>Keyword Match (20%)</span>
                <strong>{scoreBreakdown.keywordMatchScore ?? Math.round(compatibilityScore * 0.2)} / 20</strong>
              </div>
              <div className="score-bar-track">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${((scoreBreakdown.keywordMatchScore ?? (compatibilityScore * 0.2)) / 20) * 100}%`,
                    backgroundColor: '#818cf8'
                  }}
                />
              </div>
            </div>

            <div className="score-bar-item">
              <div className="score-bar-header">
                <span>Experience Relevance (20%)</span>
                <strong>{scoreBreakdown.experienceRelevanceScore ?? Math.round(compatibilityScore * 0.2)} / 20</strong>
              </div>
              <div className="score-bar-track">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${((scoreBreakdown.experienceRelevanceScore ?? (compatibilityScore * 0.2)) / 20) * 100}%`,
                    backgroundColor: '#ec4899'
                  }}
                />
              </div>
            </div>
          </div>

          <p className="disclaimer-note">
            Note: Calculated based on verified evidence in resume versus job specifications. Not an official ATS score.
          </p>
        </div>
      </div>

      {/* SKILLS SECTION: MATCHED, MISSING, PARTIAL */}
      <div className="results-grid">
        {/* MATCHED SKILLS */}
        <div className="results-card">
          <div className="card-title-bar">
            <h3>
              <CheckCircle size={18} color="#34d399" />
              <span>Matched Skills</span>
            </h3>
            <span className="panel-badge">{matchedSkills.length} Verified</span>
          </div>

          {matchedSkills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No direct skill matches identified.</p>
          ) : (
            <div className="skills-tags-wrap">
              {matchedSkills.map((skill, idx) => (
                <div key={idx} className="badge-matched">
                  <span>✓</span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PARTIAL SKILLS */}
        <div className="results-card">
          <div className="card-title-bar">
            <h3>
              <AlertCircle size={18} color="#fbbf24" />
              <span>Partial / Related Skills</span>
            </h3>
            <span className="panel-badge">{partialSkills.length} Detected</span>
          </div>

          {partialSkills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No partial skill overlaps detected.</p>
          ) : (
            <div className="partial-skills-list">
              {partialSkills.map((item, idx) => (
                <div key={idx} className="partial-skill-item">
                  <div className="partial-skill-header">
                    <span className="partial-skill-name">{typeof item === 'string' ? item : item.skill}</span>
                    <span className="partial-badge">Partial Match</span>
                  </div>
                  <p className="partial-skill-reason">{typeof item === 'string' ? '' : item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MISSING SKILLS (WITH MANDATORY GUIDANCE) */}
        <div className="results-card full-width">
          <div className="card-title-bar">
            <h3>
              <XCircle size={18} color="#f87171" />
              <span>Missing Skills</span>
            </h3>
            <span className="panel-badge">{missingSkills.length} Missing</span>
          </div>

          {missingSkills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No major skill omissions detected.</p>
          ) : (
            <div className="missing-skills-list">
              {missingSkills.map((item, idx) => {
                const skillName = typeof item === 'string' ? item : item.skill;
                const reason = typeof item === 'string' ? 'Required by job specification.' : item.reason;
                const importance = typeof item === 'object' && item.importance ? item.importance : 'High';
                const guidance =
                  typeof item === 'object' && item.guidance
                    ? item.guidance
                    : 'If you have genuine experience with this skill, add relevant evidence. Otherwise, consider learning it before claiming it.';

                return (
                  <div key={idx} className="missing-skill-item">
                    <div className="missing-skill-header">
                      <span className="missing-skill-name">
                        <span>❌</span>
                        <span>{skillName}</span>
                      </span>
                      <span className="missing-skill-importance">{importance} Priority</span>
                    </div>

                    <p className="missing-skill-reason">
                      <strong>Why it matters:</strong> {reason}
                    </p>

                    <div className="skill-guidance-box">
                      <strong>Guidance:</strong> {guidance}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KEYWORDS */}
        <div className="results-card full-width">
          <div className="card-title-bar">
            <h3>
              <Tag size={18} color="#818cf8" />
              <span>Keywords</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Found Keywords ({foundKeywords.length})
              </h4>
              <div className="skills-tags-wrap">
                {foundKeywords.map((kw, idx) => (
                  <span key={idx} className="badge-keyword found">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Missing Keywords ({missingKeywords.length})
              </h4>
              <div className="skills-tags-wrap">
                {missingKeywords.map((kw, idx) => (
                  <span key={idx} className="badge-keyword missing">
                    ✕ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RESUME WEAKNESSES */}
        <div className="results-card">
          <div className="card-title-bar">
            <h3>
              <ShieldAlert size={18} color="#f87171" />
              <span>Resume Weaknesses</span>
            </h3>
            <span className="panel-badge">{weaknesses.length} Identified</span>
          </div>

          <div className="weaknesses-list">
            {weaknesses.map((weakness, idx) => (
              <div key={idx} className="weakness-item">
                <AlertCircle size={16} />
                <span>{weakness}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMPROVEMENT SUGGESTIONS */}
        <div className="results-card">
          <div className="card-title-bar">
            <h3>
              <TrendingUp size={18} color="#34d399" />
              <span>Improvement Suggestions</span>
            </h3>
            <span className="panel-badge">{improvements.length} Recommendations</span>
          </div>

          <div className="improvements-list">
            {improvements.map((imp, idx) => {
              const priority = typeof imp === 'object' && imp.priority ? imp.priority : 'HIGH PRIORITY';
              const section = typeof imp === 'object' && imp.section ? imp.section : 'General';
              const text = typeof imp === 'object' ? imp.recommendation || imp.text : imp;

              const priorityClass = priority.toLowerCase().includes('high')
                ? 'high'
                : priority.toLowerCase().includes('medium')
                ? 'medium'
                : 'low';

              return (
                <div key={idx} className="improvement-item">
                  <div className="improvement-header">
                    <span className={`priority-tag ${priorityClass}`}>{priority}</span>
                    <span className="section-tag">Section: {section}</span>
                  </div>
                  <p className="improvement-text">{text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTION PLAN */}
        <div className="results-card full-width">
          <div className="card-title-bar">
            <h3>
              <ListOrdered size={18} color="#818cf8" />
              <span>Action Plan</span>
            </h3>
            <span className="panel-badge">{actionPlan.length} Steps</span>
          </div>

          <div className="action-plan-list">
            {actionPlan.map((step, idx) => {
              // Strip leading number if present (e.g. "1. Step...")
              const cleanStepText = step.replace(/^\d+[\.\)]\s*/, '');
              return (
                <div key={idx} className="action-step-item">
                  <div className="step-number-bubble">{idx + 1}</div>
                  <div className="step-text">{cleanStepText}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
