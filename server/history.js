const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  isSupabaseConfigured,
  saveAnalysisToSupabase,
  getHistoryFromSupabase,
  getAnalysisByIdFromSupabase
} = require('./supabase');

const HISTORY_FILE = path.join(__dirname, 'analyses_history.json');

/**
 * Read local fallback history file
 */
function getLocalHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return [];
    }
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read local history file:', err.message);
    return [];
  }
}

/**
 * Save record to local fallback file
 */
function saveLocalHistory(record) {
  try {
    const history = getLocalHistory();
    const updated = [record, ...history].slice(0, 25);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(updated, null, 2), 'utf8');
    return record;
  } catch (err) {
    console.warn('Could not save to local history file:', err.message);
    return record;
  }
}

/**
 * Save an analysis to history (both Supabase and local cache)
 */
async function saveAnalysis(analysis) {
  const id = crypto.randomUUID ? crypto.randomUUID() : `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const record = {
    id,
    jobTitle: analysis.jobTitle || 'Target Role',
    company: analysis.company || '',
    score: analysis.compatibilityScore,
    scoreRating: analysis.scoreRating,
    isDemo: Boolean(analysis.isDemo),
    createdAt: analysis.createdAt || new Date().toISOString(),
    analysis: analysis
  };

  // 1. Always save to local cache immediately
  saveLocalHistory(record);

  // 2. If Supabase is configured, persist to Supabase
  if (isSupabaseConfigured()) {
    saveAnalysisToSupabase(record).catch(err => {
      console.warn('Async Supabase save error:', err.message);
    });
  }

  return record;
}

/**
 * Read analyses history (prefers Supabase if configured, falls back to local)
 */
async function getHistory() {
  if (isSupabaseConfigured()) {
    const remote = await getHistoryFromSupabase();
    if (remote && remote.length > 0) {
      return remote;
    }
  }
  return getLocalHistory();
}

/**
 * Get an analysis by ID
 */
async function getAnalysisById(id) {
  if (isSupabaseConfigured()) {
    const remote = await getAnalysisByIdFromSupabase(id);
    if (remote) return remote;
  }
  const local = getLocalHistory();
  return local.find(item => item.id === id) || null;
}

module.exports = {
  getHistory,
  saveAnalysis,
  getAnalysisById,
  getLocalHistory
};
