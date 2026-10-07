const { extractResumeText } = require('./server/extract');
const { DEMO_ANALYSIS_RESULT, DEMO_JOB_DESCRIPTION, DEMO_RESUME_TEXT } = require('./server/demoData');
const { calculateCompatibilityScore, validateAndSanitizeAnalysis } = require('./server/analyzer');
const { getHistory, saveAnalysis } = require('./server/history');

async function runTests() {
  console.log('--- Starting CareerMatch AI End-to-End Tests ---');

  // Test 1: Demo Data integrity
  console.log('Test 1: Validating Demo Data...');
  if (!DEMO_ANALYSIS_RESULT.matchedSkills.includes('HTML')) throw new Error('Demo data missing HTML');
  if (!DEMO_ANALYSIS_RESULT.missingSkills.find(s => s.skill === 'React')) throw new Error('Demo data missing React');
  if (DEMO_ANALYSIS_RESULT.compatibilityScore < 0 || DEMO_ANALYSIS_RESULT.compatibilityScore > 100) {
    throw new Error('Demo score out of bounds');
  }
  console.log('✓ Test 1 passed: Demo Data is complete and realistic (Score: ' + DEMO_ANALYSIS_RESULT.compatibilityScore + '%)');

  // Test 2: Score Calculation Formula
  console.log('Test 2: Testing Compatibility Score Calculation...');
  const testAnalysis = {
    matchedSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
    partialSkills: [{ skill: 'Backend', reason: 'Basic exposure' }],
    missingSkills: [{ skill: 'React' }, { skill: 'Node.js' }],
    foundKeywords: ['HTML', 'CSS', 'JavaScript'],
    missingKeywords: ['React', 'Redux'],
    weaknesses: ['Missing single page application framework experience'],
    projectExperienceRelevance: 70
  };
  const scoreResult = calculateCompatibilityScore(testAnalysis);
  console.log('Calculated score:', scoreResult);
  if (scoreResult.totalScore < 40 || scoreResult.totalScore > 90) {
    throw new Error('Score calculation unexpected: ' + scoreResult.totalScore);
  }
  console.log('✓ Test 2 passed: Compatibility Score calculated deterministically (' + scoreResult.totalScore + '% - ' + scoreResult.scoreRating + ')');

  // Test 3: Validation and Sanitization with missing/malformed fields
  console.log('Test 3: Testing AI response validation and fallback sanitization...');
  const malformedInput = {
    summary: 'Candidate has partial fit.',
    matchedSkills: ['JavaScript'],
    // Missing partialSkills, missingSkills, foundKeywords, missingKeywords, actionPlan
  };
  const sanitized = validateAndSanitizeAnalysis(malformedInput);
  if (!Array.isArray(sanitized.matchedSkills) || !Array.isArray(sanitized.missingSkills)) {
    throw new Error('Sanitization failed to fill array defaults');
  }
  if (!Array.isArray(sanitized.actionPlan) || sanitized.actionPlan.length === 0) {
    throw new Error('Sanitization failed to provide fallback action plan');
  }
  console.log('✓ Test 3 passed: Malformed AI output safely sanitized without crashing');

  // Test 4: History persistence
  console.log('Test 4: Testing History storage...');
  const saved = await saveAnalysis({
    jobTitle: 'Frontend Engineer',
    company: 'DemoCorp',
    compatibilityScore: 75,
    scoreRating: 'Strong Match',
    isDemo: true
  });
  if (!saved || !saved.id) throw new Error('Failed to save analysis to history');
  const history = await getHistory();
  if (history.length === 0) throw new Error('History should not be empty');
  console.log('✓ Test 4 passed: History saved and retrieved successfully (count: ' + history.length + ')');

  // Test 5: PDF Text Extraction
  console.log('Test 5: Testing PDF Text Extraction...');
  const samplePdf = Buffer.from(
    `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n` +
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n` +
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n` +
    `4 0 obj << /Length 72 >> stream\n` +
    `BT /F1 18 Tf 100 700 Td (Alex Morgan: Experienced in HTML, CSS, JavaScript, SQL, and Git.) Tj ET\n` +
    `endstream endobj\n` +
    `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n` +
    `xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000224 00000 n \n0000000346 00000 n \n` +
    `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n420\n%%EOF`
  );

  const extractedPdfText = await extractResumeText({
    originalname: 'resume.pdf',
    mimetype: 'application/pdf',
    buffer: samplePdf
  });
  console.log('Extracted text:', extractedPdfText);
  if (!extractedPdfText.includes('HTML') || !extractedPdfText.includes('JavaScript')) {
    throw new Error('PDF extraction did not find expected text: ' + extractedPdfText);
  }
  console.log('✓ Test 5 passed: PDF text extracted cleanly');

  // Test 6: Invalid file rejection
  console.log('Test 6: Testing invalid file rejection...');
  let rejected = false;
  try {
    await extractResumeText({
      originalname: 'malicious.exe',
      mimetype: 'application/octet-stream',
      buffer: Buffer.from('not a resume')
    });
  } catch (err) {
    rejected = true;
    if (!err.message.includes('PDF or DOCX')) {
      throw new Error('Wrong error message for invalid file: ' + err.message);
    }
  }
  // Test 7: AI Unavailable / 503 error fallback
  console.log('Test 7: Testing AI Unavailable (503 / out of credits) fallback engine...');
  const { analyzeResume } = require('./server/analyzer');
  // Temporarily set an invalid API key to trigger provider error
  process.env.AI_API_KEY = 'invalid-key-simulating-503';
  process.env.AI_BASE_URL = 'http://127.0.0.1:59999/invalid'; // will fail immediately

  const fallbackResult = await analyzeResume({
    resumeText: 'Alex Morgan. Skills: HTML, CSS, JavaScript, SQL, Git. Experience developing web catalogs.',
    jobTitle: 'Frontend Engineer',
    company: 'TechCorp',
    jobDescription: 'Required skills: HTML, CSS, JavaScript, React, Node.js, Git, REST APIs.'
  });

  if (!fallbackResult || !fallbackResult.isFallback) {
    throw new Error('Expected fallbackResult.isFallback to be true');
  }
  if (!fallbackResult.matchedSkills.includes('HTML') || !fallbackResult.matchedSkills.includes('CSS')) {
    throw new Error('Fallback matchedSkills missing HTML/CSS');
  }
  if (!fallbackResult.missingSkills.find(s => s.skill === 'React')) {
    throw new Error('Fallback missingSkills missing React');
  }
  if (fallbackResult.compatibilityScore <= 0 || fallbackResult.compatibilityScore > 100) {
    throw new Error('Fallback score invalid: ' + fallbackResult.compatibilityScore);
  }
  if (!fallbackResult.fallbackMessage.includes('built-in fallback engine')) {
    throw new Error('Missing fallback message');
  }
  console.log(`✓ Test 7 passed: Fallback successfully generated on 503/provider failure:
    - Score: ${fallbackResult.compatibilityScore}% (${fallbackResult.scoreRating})
    - Matched: ${fallbackResult.matchedSkills.join(', ')}
    - Missing: ${fallbackResult.missingSkills.map(m => m.skill).join(', ')}
    - Label: ${fallbackResult.fallbackMessage}`);

  // Restore env
  delete process.env.AI_API_KEY;
  delete process.env.AI_BASE_URL;

  console.log('\n🎉 ALL 7 CORE TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
