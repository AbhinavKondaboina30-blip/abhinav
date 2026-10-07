import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Loader2, Play, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SAMPLE_JOB_DESCRIPTION = `Job Title: Frontend Developer
Company: TechNova Solutions

We are seeking a Frontend Developer to build dynamic, high-performance web applications. You will collaborate with cross-functional teams to design responsive user interfaces and consume backend REST APIs.

Key Responsibilities:
- Build responsive, accessible user interfaces using HTML5, CSS3, and modern JavaScript (ES6+).
- Develop modular UI components using React.
- Integrate frontend interfaces with backend microservices via REST APIs.
- Write clean, maintainable code and collaborate using Git version control.
- Work closely with Node.js backend services and relational databases when troubleshooting endpoints.

Requirements:
- Strong proficiency in HTML, CSS, and modern JavaScript.
- Practical experience with React and component-driven architecture.
- Familiarity with Node.js and building/consuming REST APIs.
- Experience with Git and version control workflows.
- Understanding of SQL / relational databases is a plus.`;

export default function Analyzer({ onAnalyze, onTriggerDemo, isLoading, errorMessage }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [showExtractedPreview, setShowExtractedPreview] = useState(false);

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Validate and handle file
  const handleSelectedFile = async (selectedFile) => {
    setExtractError('');
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isDocx = fileName.endsWith('.docx');

    if (!isPdf && !isDocx) {
      setExtractError('Please upload a PDF or DOCX resume.');
      setFile(null);
      setExtractedText('');
      return;
    }

    if (selectedFile.size > 8 * 1024 * 1024) {
      setExtractError('File size exceeds 8MB. Please upload a smaller PDF or DOCX resume.');
      setFile(null);
      setExtractedText('');
      return;
    }

    setFile(selectedFile);

    // Proactively extract text so user knows it succeeded and can view it
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "We couldn't read this resume. Please upload a text-based PDF or DOCX.");
      }

      setExtractedText(data.text);
    } catch (err) {
      setExtractError(err.message || "We couldn't read this resume. Please upload a text-based PDF or DOCX.");
      setFile(null);
      setExtractedText('');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setExtractedText('');
    setExtractError('');
    setShowExtractedPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleJob = () => {
    setJobTitle('Frontend Developer');
    setCompany('TechNova Solutions');
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
  };

  const isAnalyzeDisabled =
    !file ||
    !extractedText ||
    !jobDescription.trim() ||
    isExtracting ||
    isLoading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAnalyzeDisabled) return;

    onAnalyze({
      file,
      resumeText: extractedText,
      jobTitle,
      company,
      jobDescription
    });
  };

  return (
    <div className="analyzer-page">
      <div className="analyzer-header">
        <div>
          <h1 className="analyzer-title">Resume Analyzer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Compare your candidate resume against target job requirements in real-time.
          </p>
        </div>

        <button className="btn-secondary" onClick={onTriggerDemo} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
          <Play size={15} fill="currentColor" />
          <span>Try Demo Mode</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {(errorMessage || extractError) && (
        <div className="alert-banner danger">
          <AlertCircle size={20} />
          <span>{errorMessage || extractError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="analyzer-grid">
          {/* SECTION 1: RESUME */}
          <div className="analyzer-panel">
            <div className="panel-header">
              <div className="panel-title">
                <FileText size={18} color="#818cf8" />
                <span>1. Resume</span>
              </div>
              <span className="panel-badge">PDF or DOCX</span>
            </div>

            {!file ? (
              <div
                className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div className="dropzone-icon">
                  <Upload size={36} />
                </div>
                <p className="dropzone-text">Click to upload or drag & drop</p>
                <p className="dropzone-hint">Supports PDF or DOCX (up to 8MB)</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="file-card">
                  <div className="file-info">
                    <FileText size={28} color="#818cf8" />
                    <div>
                      <div className="file-name" title={file.name}>
                        {file.name}
                      </div>
                      <div className="file-meta">
                        {isExtracting ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Loader2 size={12} className="spinner" /> Extracting text...
                          </span>
                        ) : (
                          <span>
                            {(file.size / 1024).toFixed(1)} KB • Extracted {extractedText.length} characters
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={removeFile}
                    title="Remove file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {extractedText && (
                  <div>
                    <button
                      type="button"
                      className="nav-btn"
                      style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                      onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                    >
                      {showExtractedPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{showExtractedPreview ? 'Hide Extracted Text' : 'Preview Extracted Text'}</span>
                    </button>

                    {showExtractedPreview && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: 12,
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {extractedText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Note: Text extraction runs locally and securely in memory without executing uploaded files.
            </div>
          </div>

          {/* SECTION 2: JOB DESCRIPTION */}
          <div className="analyzer-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Sparkles size={18} color="#818cf8" />
                <span>2. Job Description</span>
              </div>
              <button
                type="button"
                className="nav-btn"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                onClick={handleLoadSampleJob}
                title="Fill with example Frontend Developer role"
              >
                Insert Sample Job
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label">Job Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* ANALYZE BUTTON BAR */}
        <div className="analyzer-actions-bar">
          <div className="action-status-hint">
            {!file ? (
              <span>• Please upload a resume</span>
            ) : !jobDescription.trim() ? (
              <span>• Please enter a job description</span>
            ) : (
              <span style={{ color: '#34d399' }}>✓ Ready for analysis</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isAnalyzeDisabled}
            style={{ minWidth: 200, justifyContent: 'center' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Analyzing resume...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze Resume</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
