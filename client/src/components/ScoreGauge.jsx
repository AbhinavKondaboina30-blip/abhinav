import React from 'react';

/**
 * Returns color scheme based on CareerMatch score bands:
 * 90-100: Excellent (Emerald)
 * 75-89: Strong (Indigo / Blue)
 * 60-74: Moderate (Amber / Yellow)
 * 40-59: Needs Improvement (Orange)
 * 0-39: Low Match (Rose / Red)
 */
export function getScoreTheme(score) {
  if (score >= 90) {
    return {
      stroke: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#34d399',
      label: 'Excellent Match'
    };
  }
  if (score >= 75) {
    return {
      stroke: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.3)',
      text: '#818cf8',
      label: 'Strong Match'
    };
  }
  if (score >= 60) {
    return {
      stroke: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
      label: 'Moderate Match'
    };
  }
  if (score >= 40) {
    return {
      stroke: '#f97316',
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.3)',
      text: '#fb923c',
      label: 'Needs Improvement'
    };
  }
  return {
    stroke: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#f87171',
    label: 'Low Match'
  };
}

export default function ScoreGauge({ score = 0, size = 160 }) {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  const theme = getScoreTheme(boundedScore);

  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (boundedScore / 100) * circumference;

  return (
    <div className="gauge-wrapper" style={{ width: size, height: size }}>
      <svg className="gauge-svg" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="gauge-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="gauge-circle-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={theme.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-center-text">
        <span className="gauge-number" style={{ color: theme.text }}>
          {boundedScore}
          <span className="gauge-percent">%</span>
        </span>
      </div>
    </div>
  );
}
