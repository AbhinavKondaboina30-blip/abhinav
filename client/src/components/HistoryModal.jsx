import React, { useEffect, useState } from 'react';
import { X, Calendar, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { getScoreTheme } from './ScoreGauge';

export default function HistoryModal({ isOpen, onClose, onSelectAnalysis }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setHistoryList(data.data);
      }
    } catch (err) {
      console.warn('Could not load history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Analysis History</h3>
          <button className="btn-icon-danger" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spinner" />
              <p style={{ marginTop: 8 }}>Loading history...</p>
            </div>
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <p>No previous analyses found.</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
                Run an analysis or try Demo Mode to see history records here.
              </p>
            </div>
          ) : (
            historyList.map((item) => {
              const theme = getScoreTheme(item.score);
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recent';

              return (
                <div
                  key={item.id}
                  className="history-item-card"
                  onClick={() => {
                    onSelectAnalysis(item.analysis);
                    onClose();
                  }}
                >
                  <div className="history-item-meta">
                    <h4>
                      {item.jobTitle} {item.company ? `• ${item.company}` : ''}
                    </h4>
                    <p>
                      <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {dateStr} {item.isDemo ? '• Demo' : ''}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: theme.text,
                        background: theme.bg,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      {item.score}%
                    </span>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
