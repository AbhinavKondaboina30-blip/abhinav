require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { extractResumeText } = require('./extract');
const { analyzeResume } = require('./analyzer');
const { DEMO_ANALYSIS_RESULT, DEMO_JOB_TITLE, DEMO_COMPANY, DEMO_JOB_DESCRIPTION, DEMO_RESUME_TEXT } = require('./demoData');
const { getHistory, saveAnalysis, getAnalysisById } = require('./history');
const { isSupabaseConfigured } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite frontend
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 MB max
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Please upload a PDF or DOCX resume.'));
    }
  }
});

// Middleware for Multer error catching
const handleUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 8MB limit. Please upload a smaller file.' });
      }
      return res.status(400).json({ error: err.message || 'Please upload a PDF or DOCX resume.' });
    }
    next();
  });
};

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY);
  res.json({
    status: 'ok',
    app: 'CareerMatch AI',
    aiConfigured: hasKey,
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Demo Data endpoint
 */
app.get('/api/demo', (req, res) => {
  res.json({
    success: true,
    data: {
      jobTitle: DEMO_JOB_TITLE,
      company: DEMO_COMPANY,
      jobDescription: DEMO_JOB_DESCRIPTION,
      resumeText: DEMO_RESUME_TEXT,
      analysis: DEMO_ANALYSIS_RESULT
    }
  });
});

/**
 * Resume text extraction endpoint
 */
app.post('/api/extract', handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF or DOCX resume.' });
    }

    const text = await extractResumeText(req.file);
    return res.json({
      success: true,
      text,
      filename: req.file.originalname,
      characterCount: text.length
    });
  } catch (err) {
    console.error('Extraction error:', err.message);
    return res.status(400).json({
      error: err.message || "We couldn't read this resume. Please upload a text-based PDF or DOCX."
    });
  }
});

/**
 * Main Analysis endpoint
 * Supports multipart file upload OR JSON body with raw resumeText.
 */
app.post('/api/analyze', handleUpload, async (req, res) => {
  try {
    let { resumeText, jobTitle, company, jobDescription, isDemo } = req.body || {};

    const isDemoRequest = isDemo === true || isDemo === 'true';

    // If demo mode is explicitly requested, return predefined sample analysis
    if (isDemoRequest) {
      const demoResult = {
        ...DEMO_ANALYSIS_RESULT,
        jobTitle: jobTitle && jobTitle.trim() ? jobTitle.trim() : DEMO_JOB_TITLE,
        company: company && company.trim() ? company.trim() : DEMO_COMPANY,
        createdAt: new Date().toISOString()
      };
      saveAnalysis(demoResult);
      return res.json({
        success: true,
        data: demoResult
      });
    }

    // If file was attached, extract text from it
    if (req.file) {
      try {
        resumeText = await extractResumeText(req.file);
      } catch (extractErr) {
        return res.status(400).json({ error: extractErr.message });
      }
    }

    // Validate inputs
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({
        error: 'Please upload a valid resume or provide resume text before analyzing.'
      });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return res.status(400).json({
        error: 'Please enter a job description before analyzing.'
      });
    }

    // Run AI analysis
    const analysis = await analyzeResume({
      resumeText: resumeText.trim(),
      jobTitle: (jobTitle || '').trim(),
      company: (company || '').trim(),
      jobDescription: jobDescription.trim()
    });

    // Save to history
    await saveAnalysis(analysis);

    return res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    console.warn('Analysis execution caught error, using fallback engine:', err.message);
    try {
      const { generateFallbackAnalysis } = require('./fallbackEngine');
      const fallback = generateFallbackAnalysis({
        resumeText: resumeText || '',
        jobTitle: (jobTitle || '').trim(),
        company: (company || '').trim(),
        jobDescription: jobDescription || ''
      });
      await saveAnalysis(fallback);
      return res.json({
        success: true,
        data: fallback
      });
    } catch (fallbackErr) {
      return res.status(500).json({
        error: 'Unable to complete resume analysis. Please try Demo Mode.'
      });
    }
  }
});

/**
 * History endpoints
 */
app.get('/api/history', async (req, res) => {
  try {
    const history = await getHistory();
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

app.get('/api/analysis/:id', async (req, res) => {
  try {
    const item = await getAnalysisById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    res.json({
      success: true,
      data: item.analysis
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve analysis record' });
  }
});

// Serve frontend build if exists
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    // If request starts with /api, pass to error handler instead of sending html
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Server encountered an error. Please try again.'
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 CareerMatch AI backend listening on port ${PORT}`);
});

module.exports = { app, server };
