/**
 * Every fact on the site lives here, taken from Samaila_Peter_Resume.pdf and
 * the previous portfolio. Components only lay this out — if something about
 * Perey changes, change it here and nowhere else.
 */

export const PROFILE = {
  name: "Samaila Peter",
  fullName: "Samaila Ibrahim Peter",
  brand: "Codex Prime",
  nickname: "Pete",
  role: "Backend Developer",
  stack: "Python, Django & PostgreSQL",
  tagline: "I build efficient, scalable, and clean backend systems using Python.",
  summary:
    "Computer Science student and backend developer who builds and ships complete products, from database and API to the page the user clicks.",
  about: [
    "I'm a self-taught developer turned Computer Science student at the Nigerian Army University, Biu. I like owning the whole product: the schema, the API, the deployment and the page the user actually clicks.",
    "My most recent build is SABAGeo, a Web-GIS land registry that detects overlapping land parcels with PostGIS and anchors records on the Polygon blockchain. Before that: client sites, a live quiz platform for university contests, and a lot of Python.",
    "I also have a research background in data analysis, and I design graphics and edit video when a project needs it.",
  ],
  location: "Nigeria",
  availability: "Open to remote and on-site roles",
  lookingFor: "Backend, software engineering or data roles",
  languages: ["English", "Hausa"],
  cgpa: "4.80",
  resumeUrl: "/Samaila_Peter_Resume.pdf",
} as const;

export const CONTACT = {
  email: "samailaperey2@gmail.com",
  phone: "+234 802 248 7875",
  phoneHref: "tel:+2348022487875",
  github: "https://github.com/Codex-Prime01",
  githubHandle: "Codex-Prime01",
  tiktok: "https://tiktok.com/@codexprime_",
  tiktokHandle: "@codexprime_",
} as const;

export const STATS = [
  { value: "4.80", unit: "/5.00", label: "CGPA, B.Sc. Computer Science" },
  { value: "2023", unit: "→", label: "Freelancing since January" },
  { value: "10", unit: "", label: "Projects on this page" },
  { value: "4", unit: "", label: "Certifications" },
] as const;

export const SKILLS = [
  { group: "Languages", items: ["Python", "JavaScript (ES6+)", "SQL", "HTML5", "CSS3"] },
  {
    group: "Backend",
    items: ["Django", "Django REST Framework", "Flask", "FastAPI", "REST APIs", "Authentication", "OOP"],
  },
  {
    group: "Databases & GIS",
    items: ["PostgreSQL", "PostGIS", "SQLite", "MySQL", "MongoDB", "Leaflet", "WGS84 / UTM"],
  },
  {
    group: "Deploy & tools",
    items: ["Git", "GitHub", "Render", "Neon", "Gunicorn", "Env variables", "Postman", "VS Code", "PyCharm"],
  },
  {
    group: "Also",
    items: ["Polygon blockchain anchoring", "Data analysis (pandas, SPSS)", "Graphic design", "Video editing (Premiere Pro)"],
  },
] as const;

/**
 * `offline` marks a link that exists but was not reachable when last checked
 * (2026-10-24). It renders as plain text, never as a dead link. Delete the
 * flag once the site is back up.
 */
export type ProjectLink = { label: string; href: string; offline?: boolean };

export interface Project {
  slug: string;
  index: string;
  name: string;
  kind: string;
  year?: string;
  role?: string;
  summary: string;
  points: string[];
  tech: string[];
  links: ProjectLink[];
  /** A real screenshot of the live site, in /public/projects. */
  image?: string;
  imageAlt?: string;
  /** Shown instead of a screenshot when there is no public demo. */
  note?: string;
  /** A verbatim excerpt from the public repository. */
  code?: { file: string; source: string };
}

/** The main work, in the order the resume gives it. */
export const PROJECTS: Project[] = [
  {
    slug: "sabageo",
    index: "01",
    name: "SABAGeo",
    kind: "Web-GIS Land Registry",
    year: "2026",
    summary:
      "A land registry that checks every new parcel against all registered plots and flags overlaps on a satellite map.",
    points: [
      "Every new land parcel is checked against all registered plots with PostGIS spatial queries, showing a clear pass or overlap flag on a satellite map.",
      "Each registration is anchored on the Polygon blockchain (Amoy testnet), with a tamper-evident hash-chain ledger.",
      "Searchable registry, printable parcel reports (area, perimeter, map), CSV and beacon-photo upload, coordinates in lat/long or UTM zones 31–33.",
      "Client accounts with access-code login, verifiable payment receipts and a self-service “Register New Plot” flow.",
    ],
    tech: ["Python", "PostgreSQL + PostGIS", "Neon", "Leaflet", "Polygon PoS", "Render"],
    // Render showed "This service has been suspended" on 2026-10-24.
    links: [{ label: "Live site", href: "https://sabageo-land-registry.onrender.com/", offline: true }],
  },
  {
    slug: "nuesa-quiz",
    index: "02",
    name: "NUESA Quiz Platform",
    kind: "Live competition system",
    summary:
      "The timed quiz system used by NUESA (University of Ibadan, UI-FCES chapter) in live academic contests.",
    points: [
      "Per-contestant scoring and on-the-fly question management during a live contest.",
      "A big-screen mode for running the competition in front of an audience.",
    ],
    tech: ["JavaScript", "HTML", "CSS"],
    links: [{ label: "Live demo", href: "https://enhanced-nuesa-quiz-fc1u.bolt.host/" }],
    image: "/projects/nuesa.jpg",
    imageAlt: "NUESA quiz competition platform",
  },
  {
    slug: "quantumtasker",
    index: "03",
    name: "QuantumTasker",
    kind: "Task management app",
    summary:
      "A task-management web app with user authentication, a structured Django backend and API endpoints for the interface.",
    points: [
      "User authentication and a structured Django backend.",
      "Configured for deployment with Gunicorn and environment variables — and the deployment issues fixed along the way.",
    ],
    tech: ["Python", "Django", "JavaScript", "Gunicorn"],
    links: [],
    note: "No public demo",
  },
  {
    slug: "vendigo",
    index: "04",
    name: "Vendigo Food",
    kind: "Campus food ordering platform",
    role: "Contributor — planning and backend",
    summary:
      "A multi-role platform for customers, vendors, riders and admins, including payment and notification flows.",
    points: ["Contributed to planning and backend development of the multi-role platform."],
    tech: ["Django", "Django REST Framework", "PostgreSQL"],
    links: [],
    note: "Team project",
  },
  {
    slug: "codex-bank",
    index: "05",
    name: "Codex Bank",
    kind: "Banking application",
    summary:
      "Savings and checking account classes, deposits, withdrawals and transaction history, saved to JSON with input validation.",
    points: ["Object-oriented account model with input validation.", "Transaction history persisted to JSON."],
    tech: ["Python", "OOP", "Tkinter", "JSON"],
    links: [{ label: "GitHub", href: "https://github.com/codex-prime01/bank-app" }],
    code: {
      file: "bankAppTerminal.py",
      source: `class CheckingAccount(Account):
    def __init__(self,accountNumber ,accountHolderName, balance, overdraftLimit):
        super().__init__(accountNumber,accountHolderName, balance)
        self.overdraftLimit = overdraftLimit

        #polymorphism is  the act of overriding a method from another base
    def withdraw(self, amount):
        if amount <= 0:
            print('Withdrawal amount must be positive')
            return False
        if amount > (self.balance + self.overdraftLimit):
            print('Withdrawal exceeds overdraft limit.')
            return False
        self.balance -= amount`,
    },
  },
];

/** Earlier builds from the first portfolio. Smaller, but real. */
export const ARCHIVE: {
  name: string;
  note: string;
  tech: string;
  href: string;
  kind: "Code" | "Live";
  offline?: boolean;
  preview?: string;
}[] = [
  {
    name: "Velocity Wear Hub",
    note: "Mobile-responsive fashion storefront",
    tech: "HTML · CSS · JS",
    href: "https://velocity-wear-hub.lovable.app/",
    kind: "Live",
    preview: "/projects/velocity.jpg",
  },
  {
    name: "Love Meter Game",
    note: "Animated questions and a scoring system",
    tech: "HTML · CSS · JS",
    // GitHub Pages returned 404 on 2026-10-24.
    href: "https://codex-prime01.github.io/love-meter/",
    kind: "Live",
    offline: true,
  },
  {
    name: "Birthday Website",
    note: "A creative birthday greeting site",
    tech: "HTML · CSS · JS",
    href: "https://codex-prime01.github.io/birthday-website/index.html",
    kind: "Live",
  },
  {
    name: "Rock, Paper, Scissors",
    note: "Command-line game against the computer",
    tech: "Python",
    href: "https://github.com/Codex-Prime01/rock-paper-scissors",
    kind: "Code",
  },
  {
    name: "Text Adventure Game",
    note: "Branching story with a replay option",
    tech: "Python",
    href: "https://github.com/Codex-Prime01/my-adventure-game",
    kind: "Code",
  },
];

export interface JourneyEntry {
  when: string;
  title: string;
  place: string;
  kind: "Education" | "Work" | "Build";
  points: string[];
}

/** Oldest first — the rail runs down the page in time order. */
export const JOURNEY: JourneyEntry[] = [
  {
    when: "2008 – 2024",
    title: "Primary & Secondary Education",
    place: "Lord's Secondary School, Oyo State",
    kind: "Education",
    points: [],
  },
  {
    when: "Jan 2023 – Now",
    title: "Freelance Software Developer",
    place: "Self-employed · Remote",
    kind: "Work",
    points: [
      "Design, build and deploy websites and web apps for students, student associations and small businesses, from first brief to launch.",
      "Built the live quiz-competition platform used by NUESA (University of Ibadan, UI-FCES chapter).",
      "Produced a 60-second AI-generated YouTube advert for Coizo, a multi-asset trading platform, through an agency referral.",
      "Handle hosting, domains, basic SEO and post-launch updates for client sites.",
    ],
  },
  {
    when: "Apr – Oct 2025",
    title: "Backend Developer Intern",
    place: "Federal College of Education (Special), Oyo",
    kind: "Work",
    points: [
      "Developed Python backend features for the college's education management systems.",
      "Wrote and tested REST API endpoints and worked with the frontend team to connect them.",
      "Helped design database schemas; took part in code reviews and technical documentation.",
    ],
  },
  {
    when: "2025 – Now",
    title: "B.Sc. Computer Science",
    place: "Nigerian Army University, Biu (NAUB)",
    kind: "Education",
    points: ["CGPA 4.80 / 5.00 — GPA 5.00 in second semester."],
  },
  {
    when: "2026",
    title: "Shipped SABAGeo",
    place: "Web-GIS land registry",
    kind: "Build",
    points: ["PostGIS overlap detection and Polygon-anchored records, deployed on Render + Neon."],
  },
];

export const CERTIFICATIONS = [
  {
    name: "Scientific Computing with Python",
    issuer: "freeCodeCamp",
    verify: "https://freecodecamp.org/certification/Codex-Prime/scientific-computing-with-python-v7",
  },
  {
    name: "Responsive Web Design",
    issuer: "freeCodeCamp",
    verify: "https://freecodecamp.org/certification/Codex-Prime/responsive-web-design",
  },
  { name: "Python Essentials 1", issuer: "Cisco Networking Academy" },
  { name: "Python Essentials 2", issuer: "Cisco Networking Academy" },
] as const;

export const NAV = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
] as const;
