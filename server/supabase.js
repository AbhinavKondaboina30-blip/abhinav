const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://vqpxfuvhoouxeoyfvgzh.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✓ Supabase client initialized successfully.');
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
}

/**
 * Check if Supabase client is configured and ready
 */
function isSupabaseConfigured() {
  return Boolean(supabase);
}

/**
 * Save analysis to Supabase table `analyses`
 */
async function saveAnalysisToSupabase(record) {
  if (!supabase) return null;

  try {
    const payload = {
      id: record.id,
      job_title: record.jobTitle || 'Target Role',
      company: record.company || '',
      score: record.score,
      score_rating: record.scoreRating,
      analysis_json: record.analysis,
      is_demo: Boolean(record.isDemo),
      created_at: record.createdAt || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('analyses')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase insert note:', error.message);
      return null;
    }

    return data?.[0] || record;
  } catch (err) {
    console.warn('Supabase save error (falling back to local):', err.message);
    return null;
  }
}

/**
 * Fetch analysis history from Supabase table `analyses`
 */
async function getHistoryFromSupabase(limit = 25) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase query note:', error.message);
      return null;
    }

    // Map database columns to app model format
    return (data || []).map((row) => ({
      id: row.id,
      jobTitle: row.job_title,
      company: row.company,
      score: row.score,
      scoreRating: row.score_rating,
      isDemo: row.is_demo,
      createdAt: row.created_at,
      analysis: row.analysis_json
    }));
  } catch (err) {
    console.warn('Supabase fetch error (falling back to local):', err.message);
    return null;
  }
}

/**
 * Get analysis by ID from Supabase
 */
async function getAnalysisByIdFromSupabase(id) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      jobTitle: data.job_title,
      company: data.company,
      score: data.score,
      scoreRating: data.score_rating,
      isDemo: data.is_demo,
      createdAt: data.created_at,
      analysis: data.analysis_json
    };
  } catch (err) {
    return null;
  }
}

module.exports = {
  supabase,
  isSupabaseConfigured,
  saveAnalysisToSupabase,
  getHistoryFromSupabase,
  getAnalysisByIdFromSupabase
};
