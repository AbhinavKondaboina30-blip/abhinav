/**
 * Deterministic Fallback Analysis Engine
 * Extracts skills, compares requirements, computes score, and generates
 * actionable insights without requiring an external AI API key or credits.
 */

const { calculateCompatibilityScore } = require('./analyzer');

const SKILL_DATABASE = [
  // Web & Frontend
  { name: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'es6+', 'ecmascript'], category: 'Frontend' },
  { name: 'TypeScript', aliases: ['typescript', 'ts'], category: 'Frontend' },
  { name: 'React', aliases: ['react', 'react.js', 'reactjs', 'react-dom'], category: 'Frontend' },
  { name: 'HTML', aliases: ['html', 'html5'], category: 'Frontend' },
  { name: 'CSS', aliases: ['css', 'css3', 'scss', 'sass', 'tailwind', 'bootstrap'], category: 'Frontend' },
  { name: 'Vue', aliases: ['vue', 'vue.js', 'vuejs'], category: 'Frontend' },
  { name: 'Angular', aliases: ['angular', 'angularjs'], category: 'Frontend' },
  { name: 'Next.js', aliases: ['next.js', 'nextjs'], category: 'Frontend' },
  { name: 'Redux', aliases: ['redux', 'redux-toolkit', 'state management'], category: 'Frontend' },
  { name: 'Responsive Web Design', aliases: ['responsive web design', 'responsive design', 'mobile-first', 'flexbox', 'css grid'], category: 'Frontend' },

  // Backend & APIs
  { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node js', 'node'], category: 'Backend' },
  { name: 'Express', aliases: ['express', 'express.js', 'expressjs'], category: 'Backend' },
  { name: 'REST APIs', aliases: ['rest apis', 'rest api', 'restful', 'restful apis', 'api integration', 'apis', 'rest'], category: 'Backend' },
  { name: 'GraphQL', aliases: ['graphql', 'apollo'], category: 'Backend' },
  { name: 'Microservices', aliases: ['microservices', 'microservice architecture'], category: 'Backend' },
  { name: 'Python', aliases: ['python', 'django', 'flask', 'fastapi'], category: 'Backend' },
  { name: 'Java', aliases: ['java', 'spring', 'spring boot'], category: 'Backend' },
  { name: 'C#', aliases: ['c#', 'csharp', '.net', 'asp.net'], category: 'Backend' },
  { name: 'Go', aliases: ['go', 'golang'], category: 'Backend' },
  { name: 'PHP', aliases: ['php', 'laravel'], category: 'Backend' },

  // Databases
  { name: 'SQL', aliases: ['sql', 'relational database', 'relational databases'], category: 'Database' },
  { name: 'PostgreSQL', aliases: ['postgresql', 'postgres'], category: 'Database' },
  { name: 'MySQL', aliases: ['mysql'], category: 'Database' },
  { name: 'MongoDB', aliases: ['mongodb', 'mongo', 'nosql'], category: 'Database' },
  { name: 'Redis', aliases: ['redis'], category: 'Database' },

  // DevOps & Tooling
  { name: 'Git', aliases: ['git', 'github', 'gitlab', 'version control'], category: 'Tools' },
  { name: 'Docker', aliases: ['docker', 'containerization', 'containers'], category: 'DevOps' },
  { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'], category: 'DevOps' },
  { name: 'AWS', aliases: ['aws', 'amazon web services', 's3', 'ec2', 'lambda'], category: 'Cloud' },
  { name: 'Azure', aliases: ['azure', 'microsoft azure'], category: 'Cloud' },
  { name: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'continuous integration', 'github actions', 'jenkins'], category: 'DevOps' },
  { name: 'Linux', aliases: ['linux', 'unix', 'bash', 'shell scripting'], category: 'Systems' },

  // Testing & Quality
  { name: 'Unit Testing', aliases: ['unit testing', 'jest', 'cypress', 'mocha', 'automated testing', 'tdd'], category: 'Quality' },
  { name: 'Agile', aliases: ['agile', 'scrum', 'kanban', 'sprint'], category: 'Methodology' }
];

/**
 * Helper to match skill in text safely
 */
function skillMatchesText(skillEntry, textLower) {
  for (const alias of skillEntry.aliases) {
    // Escape special regex characters in alias (e.g. C++, .NET, Node.js)
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
    if (regex.test(textLower)) {
      return true;
    }
  }
  return false;
}

/**
 * Generate a complete, deterministic fallback analysis
 */
function generateFallbackAnalysis({ resumeText, jobTitle, company, jobDescription }) {
  const resumeLower = (resumeText || '').toLowerCase();
  const jobLower = (jobDescription || '').toLowerCase();

  const jobSkills = [];
  const resumeSkills = [];

  for (const item of SKILL_DATABASE) {
    if (skillMatchesText(item, jobLower)) {
      jobSkills.push(item);
    }
    if (skillMatchesText(item, resumeLower)) {
      resumeSkills.push(item);
    }
  }

  // If job description mentioned few or no specific skills in database, extract common capitalized tech words
  if (jobSkills.length < 3) {
    const rawMatches = (jobDescription.match(/\b[A-Z][a-zA-Z0-9.+#]{1,15}\b/g) || [])
      .filter(w => !['The', 'We', 'And', 'For', 'Our', 'You', 'Will', 'Are', 'With', 'Job', 'Title', 'Role', 'Team', 'Company'].includes(w));
    const uniqueRaw = [...new Set(rawMatches)].slice(0, 5);
    for (const word of uniqueRaw) {
      if (!jobSkills.find(s => s.name.toLowerCase() === word.toLowerCase())) {
        jobSkills.push({ name: word, aliases: [word.toLowerCase()], category: 'Technical' });
      }
    }
  }

  // Calculate Matched and Missing
  const matchedSkills = [];
  const missingSkills = [];
  const partialSkills = [];

  for (const jSkill of jobSkills) {
    const hasMatch = resumeSkills.some(rSkill => rSkill.name.toLowerCase() === jSkill.name.toLowerCase());
    if (hasMatch) {
      matchedSkills.push(jSkill.name);
    } else {
      missingSkills.push({
        skill: jSkill.name,
        importance: 'High',
        reason: `The job description specifies ${jSkill.name} as a core requirement. The resume does not clearly demonstrate verifiable hands-on experience with it.`,
        guidance: 'If you have genuine experience with this skill, add relevant evidence. Otherwise, consider learning it before claiming it.'
      });
    }
  }

  // Determine Partial / Related Skills
  const resumeHasJS = resumeSkills.some(s => s.name === 'JavaScript' || s.name === 'HTML');
  const jobHasReact = jobSkills.some(s => s.name === 'React');
  const resumeHasReact = resumeSkills.some(s => s.name === 'React');
  if (jobHasReact && !resumeHasReact && resumeHasJS) {
    partialSkills.push({
      skill: 'React / Component Architecture',
      matchStatus: 'Partial Match',
      reason: 'JavaScript fundamentals are demonstrated, but component-driven architecture in React is not explicitly shown on the resume.'
    });
  }

  const jobHasTypeScript = jobSkills.some(s => s.name === 'TypeScript');
  const resumeHasTypeScript = resumeSkills.some(s => s.name === 'TypeScript');
  if (jobHasTypeScript && !resumeHasTypeScript && resumeHasJS) {
    partialSkills.push({
      skill: 'TypeScript',
      matchStatus: 'Partial Match',
      reason: 'Strong JavaScript experience is present, but typed JavaScript (TypeScript interfaces/types) is not explicitly detailed.'
    });
  }

  const jobHasAPI = jobSkills.some(s => s.name === 'REST APIs' || s.name === 'Node.js');
  const resumeHasAPI = resumeSkills.some(s => s.name === 'REST APIs' || s.name === 'Node.js');
  const resumeHasSQL = resumeSkills.some(s => s.name === 'SQL' || s.name === 'PostgreSQL' || s.name === 'MySQL');
  if (jobHasAPI && !resumeHasAPI && resumeHasSQL) {
    partialSkills.push({
      skill: 'Backend & API Integration',
      matchStatus: 'Partial Match',
      reason: 'Database and SQL querying exposure are present, providing foundational context, but direct RESTful service consumption or backend API endpoints are missing.'
    });
  }

  const jobHasDocker = jobSkills.some(s => s.name === 'Docker' || s.name === 'Kubernetes');
  const resumeHasDocker = resumeSkills.some(s => s.name === 'Docker' || s.name === 'Kubernetes');
  const resumeHasGit = resumeSkills.some(s => s.name === 'Git' || s.name === 'Linux');
  if (jobHasDocker && !resumeHasDocker && resumeHasGit) {
    partialSkills.push({
      skill: 'Containerization & Deployment',
      matchStatus: 'Partial Match',
      reason: 'Version control workflows and environment tooling are documented, but modern container orchestration (Docker/K8s) is absent.'
    });
  }

  // If matched skills list is empty, add any verified resume skills that provide foundational value
  if (matchedSkills.length === 0 && resumeSkills.length > 0) {
    for (const rSkill of resumeSkills.slice(0, 3)) {
      matchedSkills.push(rSkill.name);
    }
  }

  // Keywords
  const foundKeywords = [
    ...new Set([...matchedSkills, ...resumeSkills.map(s => s.name)])
  ].slice(0, 10);

  const missingKeywords = [
    ...new Set(missingSkills.map(m => m.skill))
  ].slice(0, 8);

  // Weaknesses
  const weaknesses = [];
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).map(m => m.skill).join(', ');
    weaknesses.push(`Key requirements explicitly highlighted in the job description are not demonstrated: ${topMissing}.`);
  }
  if (partialSkills.length > 0) {
    weaknesses.push(`Foundational skills are present, but advanced application depth requested by the role is not documented.`);
  }
  weaknesses.push('Project bullet points could be strengthened with measurable impact, architecture decisions, and explicit technology tags.');

  // Improvements
  const improvements = [];
  if (missingSkills.length > 0) {
    improvements.push({
      priority: 'HIGH PRIORITY',
      section: 'Projects',
      recommendation: `Build and showcase a project that legitimately leverages ${missingSkills[0].skill}. Include measurable results and details on how you solved core problems.`
    });
  }
  if (partialSkills.length > 0) {
    improvements.push({
      priority: 'MEDIUM PRIORITY',
      section: 'Experience',
      recommendation: `Elaborate on ${partialSkills[0].skill} within your past experience if you have authentic exposure to it.`
    });
  }
  improvements.push({
    priority: 'LOW PRIORITY',
    section: 'Technical Skills',
    recommendation: 'Group technical competencies into clear sub-categories (e.g., Languages, Frameworks, Developer Tools) to align with applicant screening criteria.'
  });

  // Action Plan
  const actionPlan = [
    `1. Review core requirements and evaluate genuine experience with ${missingSkills[0]?.skill || 'the target stack'}.`,
    `2. Build or update a portfolio project demonstrating hands-on proficiency with required technologies.`,
    `3. Update resume bullet points with concrete metrics, technologies used, and verifiable outcomes.`,
    `4. Re-analyze your updated resume against this job posting.`
  ];

  // Calculate Deterministic Score
  const scoreData = calculateCompatibilityScore({
    matchedSkills,
    partialSkills,
    missingSkills,
    foundKeywords,
    missingKeywords,
    projectExperienceRelevance: Math.max(30, 85 - (missingSkills.length * 10))
  });

  const summary = `Candidate demonstrates foundational competencies (${matchedSkills.slice(0, 3).join(', ') || 'core skills'}), but the target job specifically emphasizes ${missingSkills.slice(0, 2).map(m => m.skill).join(' and ') || 'specialized requirements'} which are not explicitly documented in the resume.`;

  return {
    isFallback: true,
    fallbackMessage: 'AI analysis is currently unavailable, so this analysis was generated using the built-in fallback engine.',
    isDemo: false,
    jobTitle: jobTitle || 'Target Role',
    company: company || '',
    compatibilityScore: scoreData.totalScore,
    scoreRating: scoreData.scoreRating,
    scoreBreakdown: scoreData.breakdown,
    summary,
    matchedSkills,
    partialSkills,
    missingSkills,
    foundKeywords,
    missingKeywords,
    weaknesses,
    improvements,
    actionPlan,
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  generateFallbackAnalysis
};
