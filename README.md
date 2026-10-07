# CareerMatch AI — Hackathon MVP

> "Know How Well Your Resume Matches the Job"

CareerMatch AI is a credit-efficient, full-stack web application that compares a candidate's resume (PDF or DOCX) against a job description to pinpoint matching skills, missing high-priority requirements, semantic overlap, and actionable resume improvements.

---

## ⚡ Quick Start

### 1. Install & Run
```bash
# Start backend and serve frontend (built production bundle)
npm start
```
The application will be accessible at: **`http://localhost:5000`**

### 2. Development Mode (Optional)
To run with Vite Hot Module Reloading:
```bash
# Terminal 1: Run Express API Server
npm run server

# Terminal 2: Run Vite Dev Server
npm run client
```
Access Vite frontend at: **`http://localhost:3000`** (requests to `/api` proxy automatically to port 5000).

---

## 🚀 Features

- **Resume Upload & Extraction**:
  - In-memory parsing of text-based **PDF** and **DOCX** files.
  - Safe extraction with whitespace normalization and preview capability.
  - File size and format validation with user-friendly error banners.
- **CareerMatch Compatibility Score (0–100%)**:
  - Deterministic formula:
    - **Skill Match: 60%**
    - **Keyword Match: 20%**
    - **Project & Experience Relevance: 20%**
  - Score categories: Excellent Match (90–100), Strong Match (75–89), Moderate Match (60–74), Needs Improvement (40–59), Low Match (0–39).
- **Comprehensive Match Breakdown**:
  - **Matched Skills**: Confirmed skills present on resume.
  - **Missing Skills**: Prioritized gaps with concise explanations of why they matter and honest advice.
  - **Partial / Related Skills**: Semantic overlaps where foundational exposure is present but depth is lacking.
  - **Keywords**: Found vs. missing industry terms.
  - **Resume Weaknesses**: Specific gaps in project/experience descriptions.
  - **Improvement Suggestions**: Categorized by priority (High/Medium/Low) and section.
  - **Action Plan**: 3–5 step roadmap.
- **Demo Mode (Zero-Credit / No API Key Needed)**:
  - Instant one-click demo using realistic predefined frontend engineer data.
  - Demonstrates full match dashboard without consuming any AI credits.
- **Analysis History**:
  - Automatic persistence of recent analyses with 1-click reload.

---

## 🔑 AI API Configuration

CareerMatch AI works with any OpenAI-compatible API endpoint (OpenAI, Groq, Together AI, DeepSeek, Ollama, etc.).

Configure your environment variables in `.env`:
```env
PORT=5000
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

*Note: If no API key is provided, Demo Mode continues to work 100% offline, and real analyses display a friendly prompt rather than crashing.*

---

## 🧪 Testing

Run the automated end-to-end and API integration tests:
```bash
npm test
```
All tests verify file extraction, validation, compatibility scoring, error resilience, and API routes.
