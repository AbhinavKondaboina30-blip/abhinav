/**
 * Predefined realistic Demo Data for CareerMatch AI
 * Works 100% offline without any AI API key.
 */

const DEMO_JOB_TITLE = "Frontend Developer";
const DEMO_COMPANY = "TechNova Solutions";

const DEMO_JOB_DESCRIPTION = `Job Title: Frontend Developer
Company: TechNova Solutions
Location: Remote / Hybrid

About the Role:
We are seeking a Frontend Developer to build dynamic, high-performance web applications. You will collaborate with cross-functional teams to design responsive user interfaces and consume backend REST APIs.

Key Responsibilities:
- Build responsive, accessible user interfaces using HTML5, CSS3, and modern JavaScript (ES6+).
- Develop modular UI components using React.
- Integrate frontend interfaces with backend microservices via REST APIs.
- Write clean, maintainable code and collaborate using Git version control.
- Work closely with Node.js backend services and relational databases when troubleshooting endpoints.
- Ensure cross-browser compatibility and optimize web performance.

Requirements:
- Strong proficiency in HTML, CSS, and modern JavaScript.
- Practical experience with React and component-driven architecture.
- Familiarity with Node.js and building/consuming REST APIs.
- Experience with Git and version control workflows.
- Understanding of SQL / relational databases is a plus.
- Good communication and problem-solving skills.`;

const DEMO_RESUME_TEXT = `Alex Morgan
alex.morgan@email.com | (555) 234-5678 | Portfolio: alexmorgan.dev | GitHub: github.com/alexmorgan

SUMMARY
Motivated Web Developer with 2+ years of experience crafting responsive web interfaces, optimizing relational database queries, and collaborating in version-controlled agile environments. Passionate about clean code, UI performance, and user accessibility.

TECHNICAL SKILLS
- Languages & Core Web: HTML5, CSS3, JavaScript (ES6+), SQL
- Tools & Version Control: Git, GitHub, VS Code, npm
- Databases: PostgreSQL, MySQL
- Other: Responsive Web Design, Flexbox, CSS Grid, DOM Manipulation

PROJECTS
E-Commerce Catalog & Product Filter
- Developed an interactive product catalog utilizing vanilla JavaScript, HTML5, and CSS3 with real-time filtering and sorting.
- Designed relational database schema in PostgreSQL and executed SQL queries to store inventory and pricing data.
- Managed collaborative project milestones using Git branches and pull requests.

Task Management Dashboard
- Built a responsive task organizer using modern JavaScript DOM manipulation and local storage persistence.
- Implemented modular CSS with Grid and Flexbox for cross-device mobile responsiveness.
- Tracked issues and feature releases with Git version control.

EXPERIENCE
Junior Web Developer | WebCraft Studios (2023 - Present)
- Developed and maintained responsive client websites using HTML, CSS, and vanilla JavaScript.
- Collaborated with senior engineers using Git version control to review code and resolve UI bugs.
- Interacted with relational SQL databases for reporting queries.

EDUCATION
B.S. in Computer Science | State University (Graduated 2023)`;

const DEMO_ANALYSIS_RESULT = {
  isDemo: true,
  jobTitle: DEMO_JOB_TITLE,
  company: DEMO_COMPANY,
  compatibilityScore: 71,
  scoreRating: "Moderate Match",
  scoreBreakdown: {
    skillMatchScore: 43, // out of 60
    keywordMatchScore: 14, // out of 20
    experienceRelevanceScore: 14 // out of 20
  },
  summary:
    "The candidate demonstrates strong foundational frontend skills (HTML, CSS, JavaScript) and good engineering hygiene with Git and SQL. However, the job specifically requires hands-on React framework expertise and REST API integration, which are currently missing from the resume's explicit technical stack.",
  matchedSkills: ["HTML", "CSS", "JavaScript", "SQL", "Git"],
  missingSkills: [
    {
      skill: "React",
      importance: "High",
      reason:
        "The job requires building modular component-driven user interfaces in React. The resume only demonstrates vanilla JavaScript DOM manipulation.",
      guidance:
        "If you have genuine experience with this skill, add relevant evidence. Otherwise, consider learning it before claiming it."
    },
    {
      skill: "Node.js",
      importance: "Medium",
      reason:
        "The role collaborates with Node.js backend services to troubleshoot endpoints and build full-stack workflows.",
      guidance:
        "If you have genuine experience with this skill, add relevant evidence. Otherwise, consider learning it before claiming it."
    },
    {
      skill: "REST APIs",
      importance: "High",
      reason:
        "Consuming RESTful APIs is a core daily responsibility in this frontend role. The resume does not currently demonstrate asynchronous HTTP/API integration (e.g., fetch, axios, REST endpoints).",
      guidance:
        "If you have genuine experience with this skill, add relevant evidence. Otherwise, consider learning it before claiming it."
    }
  ],
  partialSkills: [
    {
      skill: "Backend & Database Integration",
      matchStatus: "Partial Match",
      reason:
        "SQL and relational database querying are demonstrated on the resume, providing good foundational context for backend collaboration, but practical Node.js/REST service communication is missing."
    },
    {
      skill: "Modern JavaScript",
      matchStatus: "Partial Match",
      reason:
        "JavaScript ES6+ is present and utilized in projects, but the resume lacks evidence of advanced asynchronous patterns (async/await, promises) or state management required by the target role."
    }
  ],
  foundKeywords: [
    "HTML5",
    "CSS3",
    "JavaScript",
    "ES6+",
    "Git",
    "SQL",
    "Responsive Web Design",
    "Flexbox",
    "CSS Grid",
    "DOM Manipulation",
    "PostgreSQL",
    "MySQL"
  ],
  missingKeywords: [
    "React",
    "Component-Driven Architecture",
    "Node.js",
    "REST APIs",
    "Asynchronous API Integration",
    "Cross-Browser Compatibility",
    "Web Performance Optimization"
  ],
  weaknesses: [
    "No demonstrated experience or projects built with React or modern single-page application (SPA) frameworks.",
    "Lacks explicit evidence of connecting frontend applications to external REST APIs or microservices.",
    "Project bullet points describe basic vanilla JS DOM manipulation rather than production-grade frontend architecture or performance metrics."
  ],
  improvements: [
    {
      priority: "HIGH PRIORITY",
      section: "Projects",
      recommendation:
        "Build and showcase a React-based project that consumes a live public or custom REST API. Detail the state management, component structure, and asynchronous data fetching used."
    },
    {
      priority: "MEDIUM PRIORITY",
      section: "Experience",
      recommendation:
        "In your Junior Web Developer experience bullets, highlight any collaboration with backend engineers or API endpoints if you genuinely worked with them."
    },
    {
      priority: "LOW PRIORITY",
      section: "Technical Skills",
      recommendation:
        "Group your skills clearly into categories (e.g., 'Frontend Frameworks', 'Core Languages', 'Developer Tools') to make framework gaps immediately addressable upon completion of training."
    }
  ],
  actionPlan: [
    "1. Strengthen React fundamentals and component lifecycle/hooks.",
    "2. Build one comprehensive React project that integrates with a REST API (e.g., data fetching, error handling, state management).",
    "3. Add the project and verifiable technologies used to your resume with measurable impact.",
    "4. Highlight any authentic exposure to API consumption or Node.js tooling in your past experience.",
    "5. Re-analyze your updated resume against this Frontend Developer role."
  ]
};

module.exports = {
  DEMO_JOB_TITLE,
  DEMO_COMPANY,
  DEMO_JOB_DESCRIPTION,
  DEMO_RESUME_TEXT,
  DEMO_ANALYSIS_RESULT
};
