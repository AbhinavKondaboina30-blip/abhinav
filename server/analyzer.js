/**
 * CareerMatch AI Analysis Engine
 * Uses OpenAI-compatible API with strict schema validation, retry logic,
 * safe fallback, and deterministic Compatibility Score calculation.
 */

const SYSTEM_PROMPT = `You are an expert resume and job-description analyst.

Analyze the resume only using information actually present in it.

Do not invent skills, experience, projects, education, certifications, achievements, technologies, companies, or metrics.

Identify:
1. Matched skills
2. Partially matched skills
3. Missing skills
4. Important keywords
5. Resume weaknesses
6. Improvement suggestions
7. Actionable next steps

Never tell a candidate to falsely claim a skill.

Return only valid JSON with this exact structure:
{
  "summary": "Concise 2-3 sentence overview of candidate match against the job description.",
  "matchedSkills": ["skill1", "skill2"],
  "partialSkills": [
    {
      "skill": "skill name",
      "matchStatus": "Partial Match",
      "reason": "Clear explanation of why it is only partially demonstrated."
    }
  ],
  "missingSkills": [
    {
      "skill": "skill name",
      "importance": "High or Medium",
      "reason": "Brief explanation of why this skill matters for this role.",
      "guidance": "If you have genuine experience with this skill, add relevant evidence. Otherwise, consider learning it before claiming it."
    }
  ],
  "foundKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "weaknesses": [
    "Weakness or gap 1",
    "Weakness or gap 2"
  ],
  "improvements": [
    {
      "priority": "HIGH PRIORITY or MEDIUM PRIORITY or LOW PRIORITY",
      "section": "Projects or Experience or Skills or Summary",
      "recommendation": "Concrete honest advice on improving this section."
    }
  ],
  "actionPlan": [
    "Step 1...",
    "Step 2...",
    "Step 3...",
    "Step 4..."
  ],
  "projectExperienceRelevance": 75
}`;

/**
 * Score bands and rating calculation
 * 90–100: Excellent Match
 * 75–89: Strong Match
 * 60–74: Moderate Match
 * 40–59: Needs Improvement
 * 0–39: Low Match
 */
function getScoreRating(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Moderate Match';
  if (score >= 40) return 'Needs Improvement';
  return 'Low Match';
}

/**
 * Deterministically compute CareerMatch Compatibility Score:
 * - Skill Match: 60%
 * - Keyword Match: 20%
 * - Project/Experience relevance: 20%
 */
function calculateCompatibilityScore(analysis) {
  const matched = Array.isArray(analysis.matchedSkills) ? analysis.matchedSkills.length : 0;
  const partial = Array.isArray(analysis.partialSkills) ? analysis.partialSkills.length : 0;
  const missing = Array.isArray(analysis.missingSkills) ? analysis.missingSkills.length : 0;

  const totalSkills = matched + partial + missing;
  let skillRatio = 0.5;
  if (totalSkills > 0) {
    // Each matched skill counts as 1.0, partial counts as 0.5
    skillRatio = Math.min(1, (matched * 1.0 + partial * 0.5) / totalSkills);
  }
  const skillMatchScore = Math.round(skillRatio * 60);

  const foundKw = Array.isArray(analysis.foundKeywords) ? analysis.foundKeywords.length : 0;
  const missingKw = Array.isArray(analysis.missingKeywords) ? analysis.missingKeywords.length : 0;
  const totalKw = foundKw + missingKw;
  let kwRatio = 0.5;
  if (totalKw > 0) {
    kwRatio = Math.min(1, foundKw / totalKw);
  }
  const keywordMatchScore = Math.round(kwRatio * 20);

  // Experience relevance: bounded 0 to 100, converted to 20%
  let expRelevanceRaw = 65;
  if (typeof analysis.projectExperienceRelevance === 'number' && !isNaN(analysis.projectExperienceRelevance)) {
    expRelevanceRaw = Math.max(10, Math.min(95, analysis.projectExperienceRelevance));
  } else {
    // Deduce from weaknesses count
    const weaknessPenalty = Math.min(40, (analysis.weaknesses || []).length * 10);
    expRelevanceRaw = Math.max(20, 80 - weaknessPenalty);
  }
  const experienceRelevanceScore = Math.round((expRelevanceRaw / 100) * 20);

  const totalScore = Math.max(5, Math.min(100, skillMatchScore + keywordMatchScore + experienceRelevanceScore));

  return {
    totalScore,
    scoreRating: getScoreRating(totalScore),
    breakdown: {
      skillMatchScore,
      keywordMatchScore,
      experienceRelevanceScore
    }
  };
}

/**
 * Validate and sanitize AI response JSON
 */
function validateAndSanitizeAnalysis(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('AI response is not an object');
  }

  const sanitized = {
    summary: typeof data.summary === 'string' && data.summary.trim() ? data.summary.trim() : 'Analysis completed based on the provided resume and job description.',
    matchedSkills: Array.isArray(data.matchedSkills) ? data.matchedSkills.map(s => typeof s === 'string' ? s.trim() : String(s)).filter(Boolean) : [],
    partialSkills: [],
    missingSkills: [],
    foundKeywords: Array.isArray(data.foundKeywords) ? data.foundKeywords.map(k => typeof k === 'string' ? k.trim() : String(k)).filter(Boolean) : [],
    missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords.map(k => typeof k === 'string' ? k.trim() : String(k)).filter(Boolean) : [],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses.map(w => typeof w === 'string' ? w.trim() : String(w)).filter(Boolean) : [],
    improvements: [],
    actionPlan: Array.isArray(data.actionPlan) ? data.actionPlan.map(a => typeof a === 'string' ? a.trim() : String(a)).filter(Boolean) : [],
    projectExperienceRelevance: typeof data.projectExperienceRelevance === 'number' ? data.projectExperienceRelevance : 65
  };

  // Sanitize partialSkills
  if (Array.isArray(data.partialSkills)) {
    sanitized.partialSkills = data.partialSkills.map(p => {
      if (typeof p === 'string') {
        return {
          skill: p,
          matchStatus: 'Partial Match',
          reason: 'Mentioned in resume, but lacks complete evidence of depth required by role.'
        };
      }
      return {
        skill: p.skill || 'Related Skill',
        matchStatus: p.matchStatus || 'Partial Match',
        reason: p.reason || 'Present on resume but does not demonstrate required depth.'
      };
    });
  }

  // Sanitize missingSkills
  const defaultGuidance = 'If you have genuine experience with this skill, add relevant evidence. Otherwise, consider learning it before claiming it.';
  if (Array.isArray(data.missingSkills)) {
    sanitized.missingSkills = data.missingSkills.map(m => {
      if (typeof m === 'string') {
        return {
          skill: m,
          importance: 'High',
          reason: 'Identified as a core requirement in the job description.',
          guidance: defaultGuidance
        };
      }
      return {
        skill: m.skill || 'Required Skill',
        importance: m.importance || 'High',
        reason: m.reason || 'Identified as a requirement in the job description.',
        guidance: m.guidance || defaultGuidance
      };
    });
  }

  // Sanitize improvements
  if (Array.isArray(data.improvements)) {
    sanitized.improvements = data.improvements.map((imp, idx) => {
      if (typeof imp === 'string') {
        return {
          priority: idx === 0 ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY',
          section: 'Resume Content',
          recommendation: imp
        };
      }
      return {
        priority: imp.priority || (idx === 0 ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'),
        section: imp.section || 'General',
        recommendation: imp.recommendation || imp.text || 'Add verifiable evidence for relevant experience.'
      };
    });
  }

  // Ensure minimum action plan steps
  if (sanitized.actionPlan.length === 0) {
    sanitized.actionPlan = [
      '1. Review identified missing skills and align authentic experience.',
      '2. Update project bullet points with concrete metrics and tools used.',
      '3. Re-run analysis against this job description to verify improved compatibility.'
    ];
  }

  return sanitized;
}

/**
 * Clean JSON string output from LLM (strip Markdown fences)
 */
function cleanJsonString(raw) {
  if (!raw) return '';
  let str = raw.trim();
  // Remove markdown code blocks ```json ... ```
  if (str.startsWith('```')) {
    str = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return str;
}

/**
 * Execute AI call with retry logic
 */
async function callOpenAICompatible(apiKey, baseUrl, model, userPrompt) {
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const payload = {
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedErr = errorText;
    try {
      const errJson = JSON.parse(errorText);
      parsedErr = errJson.error?.message || errorText;
    } catch (_) {}
    throw new Error(`AI Provider Error (${response.status}): ${parsedErr}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('AI returned an empty response.');
  }

  const cleaned = cleanJsonString(rawContent);
  return JSON.parse(cleaned);
}

/**
 * Analyze resume against job description using AI, with automatic fallback
 * to deterministic local engine if AI provider has no credits or is unavailable.
 */
async function analyzeResume({ resumeText, jobTitle, company, jobDescription }) {
  const { generateFallbackAnalysis } = require('./fallbackEngine');
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

  // If no API key configured, use deterministic fallback
  if (!apiKey) {
    console.log('No AI API key found. Using deterministic fallback analysis engine.');
    return generateFallbackAnalysis({ resumeText, jobTitle, company, jobDescription });
  }

  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  const userPrompt = `JOB TITLE: ${jobTitle || 'Not specified'}
COMPANY: ${company || 'Not specified'}

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeText}

Analyze this resume against the job description strictly adhering to the system instructions. Output only valid JSON.`;

  let parsedOutput = null;

  try {
    // Attempt 1: Call AI Provider
    parsedOutput = await callOpenAICompatible(apiKey, baseUrl, model, userPrompt);
  } catch (firstErr) {
    const errLower = (firstErr.message || '').toLowerCase();
    const isCreditsOrUnavailable =
      errLower.includes('503') ||
      errLower.includes('401') ||
      errLower.includes('402') ||
      errLower.includes('403') ||
      errLower.includes('429') ||
      errLower.includes('500') ||
      errLower.includes('credit') ||
      errLower.includes('quota') ||
      errLower.includes('insufficient') ||
      errLower.includes('unavailable') ||
      errLower.includes('enotfound') ||
      errLower.includes('econnrefused');

    if (isCreditsOrUnavailable) {
      console.warn(`AI Provider unavailable/no credits (${firstErr.message}). Automatically using fallback engine.`);
      return generateFallbackAnalysis({ resumeText, jobTitle, company, jobDescription });
    }

    // Attempt 2: Retry once for malformed response
    try {
      console.log('Retrying AI analysis (Attempt 2)...');
      const retryPrompt = `${userPrompt}\n\nIMPORTANT: Return ONLY raw, valid JSON. Do not include markdown code blocks.`;
      parsedOutput = await callOpenAICompatible(apiKey, baseUrl, model, retryPrompt);
    } catch (secondErr) {
      console.warn(`Second AI attempt failed (${secondErr.message}). Automatically using fallback engine.`);
      return generateFallbackAnalysis({ resumeText, jobTitle, company, jobDescription });
    }
  }

  try {
    const sanitized = validateAndSanitizeAnalysis(parsedOutput);
    const { totalScore, scoreRating, breakdown } = calculateCompatibilityScore(sanitized);

    return {
      isDemo: false,
      isFallback: false,
      jobTitle: jobTitle || 'Target Role',
      company: company || '',
      compatibilityScore: totalScore,
      scoreRating,
      scoreBreakdown: breakdown,
      summary: sanitized.summary,
      matchedSkills: sanitized.matchedSkills,
      partialSkills: sanitized.partialSkills,
      missingSkills: sanitized.missingSkills,
      foundKeywords: sanitized.foundKeywords,
      missingKeywords: sanitized.missingKeywords,
      weaknesses: sanitized.weaknesses,
      improvements: sanitized.improvements,
      actionPlan: sanitized.actionPlan,
      createdAt: new Date().toISOString()
    };
  } catch (sanitizeErr) {
    console.warn(`Error sanitizing AI output (${sanitizeErr.message}). Using fallback engine.`);
    return generateFallbackAnalysis({ resumeText, jobTitle, company, jobDescription });
  }
}

module.exports = {
  analyzeResume,
  calculateCompatibilityScore,
  getScoreRating,
  validateAndSanitizeAnalysis
};
