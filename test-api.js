const http = require('http');

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (_) {}
        resolve({ statusCode: res.statusCode, data: parsed, raw: data });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('--- Starting CareerMatch AI API Server Integration Tests ---');

  // Start server on test port 5056
  process.env.PORT = '5056';
  require('./server/index.js');

  // Wait 1 second for server to bind
  await new Promise(r => setTimeout(r, 1000));

  const baseOpt = {
    hostname: 'localhost',
    port: 5056
  };

  // 1. Health check
  console.log('Testing GET /api/health...');
  const health = await makeRequest({ ...baseOpt, path: '/api/health', method: 'GET' });
  if (health.statusCode !== 200 || health.data.status !== 'ok') {
    throw new Error('Health check failed: ' + JSON.stringify(health));
  }
  console.log('✓ GET /api/health passed:', health.data);

  // 2. Demo endpoint
  console.log('Testing GET /api/demo...');
  const demo = await makeRequest({ ...baseOpt, path: '/api/demo', method: 'GET' });
  if (demo.statusCode !== 200 || !demo.data.data?.analysis) {
    throw new Error('Demo endpoint failed: ' + JSON.stringify(demo));
  }
  console.log('✓ GET /api/demo passed (Score: ' + demo.data.data.analysis.compatibilityScore + '%)');

  // 3. Analyze with Demo Mode flag
  console.log('Testing POST /api/analyze with isDemo=true...');
  const analyzeDemo = await makeRequest(
    {
      ...baseOpt,
      path: '/api/analyze',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { isDemo: true, jobTitle: 'Frontend Engineer' }
  );
  if (analyzeDemo.statusCode !== 200 || !analyzeDemo.data.data?.isDemo) {
    throw new Error('Analyze Demo mode failed: ' + JSON.stringify(analyzeDemo));
  }
  console.log('✓ POST /api/analyze isDemo=true passed');

  // 4. Analyze flow when AI provider is unavailable / has no credits -> Fallback Analysis
  console.log('Testing Resume Upload -> Job Description -> Analyze -> AI Unavailable -> Fallback Analysis flow...');
  const analyzeFallback = await makeRequest(
    {
      ...baseOpt,
      path: '/api/analyze',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      resumeText: 'Alex Morgan. Experienced Web Developer with skills in HTML, CSS, JavaScript, SQL, and Git. Built responsive catalog websites.',
      jobTitle: 'Frontend Developer',
      company: 'TechNova',
      jobDescription: 'Seeking Frontend Developer proficient in HTML, CSS, JavaScript, React, Node.js, REST APIs, and Git.'
    }
  );

  if (analyzeFallback.statusCode !== 200) {
    throw new Error('Fallback analysis failed with status: ' + analyzeFallback.statusCode + ' ' + JSON.stringify(analyzeFallback.data));
  }

  const result = analyzeFallback.data.data;
  if (!result) throw new Error('No data returned in response');
  if (result.isFallback !== true) throw new Error('Expected isFallback to be true');
  if (typeof result.compatibilityScore !== 'number') throw new Error('Compatibility score missing');
  if (!Array.isArray(result.matchedSkills) || result.matchedSkills.length === 0) throw new Error('Matched skills missing');
  if (!Array.isArray(result.missingSkills) || result.missingSkills.length === 0) throw new Error('Missing skills missing');
  if (!Array.isArray(result.improvements) || result.improvements.length === 0) throw new Error('Improvements missing');
  if (!Array.isArray(result.actionPlan) || result.actionPlan.length === 0) throw new Error('Action plan missing');

  console.log('✓ Fallback Analysis succeeded:');
  console.log(`  - Compatibility Score: ${result.compatibilityScore}% (${result.scoreRating})`);
  console.log(`  - Matched Skills: ${result.matchedSkills.join(', ')}`);
  console.log(`  - Missing Skills: ${result.missingSkills.map(m => m.skill).join(', ')}`);
  console.log(`  - Improvements: ${result.improvements.length} items`);
  console.log(`  - Action Plan: ${result.actionPlan.length} steps`);
  console.log(`  - Notice: "${result.fallbackMessage}"`);

  // 5. Empty inputs rejected with 400
  console.log('Testing POST /api/analyze with empty inputs...');
  const analyzeEmpty = await makeRequest(
    {
      ...baseOpt,
      path: '/api/analyze',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { resumeText: '', jobDescription: '' }
  );
  if (analyzeEmpty.statusCode !== 400) {
    throw new Error('Expected 400 for empty inputs, got: ' + analyzeEmpty.statusCode);
  }
  console.log('✓ POST /api/analyze rejected empty inputs correctly: "' + analyzeEmpty.data.error + '"');

  // 6. History endpoint
  console.log('Testing GET /api/history...');
  const history = await makeRequest({ ...baseOpt, path: '/api/history', method: 'GET' });
  if (history.statusCode !== 200 || !Array.isArray(history.data.data)) {
    throw new Error('History failed: ' + JSON.stringify(history));
  }
  console.log('✓ GET /api/history passed, recorded count: ' + history.data.data.length);

  // 7. Frontend index.html served
  console.log('Testing GET / (Frontend serving)...');
  const frontend = await makeRequest({ ...baseOpt, path: '/', method: 'GET' });
  if (frontend.statusCode !== 200 || !frontend.raw.includes('CareerMatch AI')) {
    throw new Error('Frontend serving failed');
  }
  console.log('✓ GET / served compiled React frontend successfully');

  console.log('\n🎉 ALL API INTEGRATION TESTS PASSED PERFECTLY! 🎉');
  process.exit(0);
}

runApiTests().catch(err => {
  console.error('❌ API Test failed:', err);
  process.exit(1);
});
