import catalog from "./publicPrograms.json";
export const schools = [
  {
    id: "engineering",
    name: "School of Engineering",
    short: "Engineering",
    icon: "engineering",
    description:
      "Explore the systems, technologies and structures that shape our world.",
    disciplines: "Computing · Energy · Design",
  },
  {
    id: "business",
    name: "School of Business",
    short: "Business",
    icon: "business",
    description:
      "Find your direction in management, markets and the business of tomorrow.",
    disciplines: "Management · Finance · Strategy",
  },
  {
    id: "arts-sciences",
    name: "School of Arts & Sciences",
    short: "Arts & Sciences",
    icon: "arts",
    description:
      "Connect creative expression, scientific discovery and digital thinking.",
    disciplines: "Science · Creativity · Technology",
  },
  {
    id: "education",
    name: "School of Education",
    short: "Education",
    icon: "education",
    description:
      "Explore learning, language and the possibilities of teaching.",
    disciplines: "Teaching · Language · Leadership",
  },
  {
    id: "pharmacy",
    name: "School of Pharmacy",
    short: "Pharmacy",
    icon: "pharmacy",
    description:
      "Explore pharmaceutical education and the science behind patient care.",
    disciplines: "Pharmaceutical Science · Practice",
  },
];
export const programs = [
  ...catalog,
  ...["Arts", "Sciences", "Engineering"].map((track) => ({
    id: "freshman-" + track.toLowerCase(),
    name: "Freshman " + track,
    school: "freshman",
    level: "Foundation",
    credits: 30,
  })),
];
export const schoolName = (id) =>
  schools.find((s) => s.id === id)?.name || "Freshman Program";
export const tuitionRows = [
  {
    name: "School of Business",
    undergraduate: 179,
    graduate: 225,
  },
  {
    name: "School of Engineering",
    undergraduate: 215,
    graduate: 285,
  },
  {
    name: "School of Arts & Sciences",
    undergraduate: 169,
    graduate: null,
  },
  {
    name: "MS in Applied Math",
    undergraduate: null,
    graduate: 190,
  },
  {
    name: "MS in Food Technology",
    undergraduate: null,
    graduate: 240,
  },
  {
    name: "Computer Science",
    undergraduate: 215,
    graduate: 285,
  },
  {
    name: "Information Technology",
    undergraduate: 215,
    graduate: null,
  },
  {
    name: "School of Pharmacy",
    undergraduate: 299,
    graduate: null,
  },
  {
    name: "School of Education",
    undergraduate: 169,
    graduate: 190,
  },
  {
    name: "Freshman",
    undergraduate: 165,
    graduate: null,
  },
];

export const universityFees = [
  ["Change of major", "LBP 2,500,000"],
  ["Entrance exam", "LBP 1,000,000"],
  ["Undergraduate application", "LBP 1,500,000"],
  ["Graduate application", "LBP 2,500,000"],
  ["Late tuition penalty", "LBP 500,000 + USD 10"],
  ["Late registration penalty", "LBP 2,500,000"],
  ["NSSF", "LBP 2,500,000"],
  ["New ID", "LBP 500,000"],
  ["Registration fee", "USD 150"],
  ["Official transcript", "LBP 500,000"],
  ["Attestation", "LBP 250,000"],
  ["Graduation fees", "LBP 7,500,000"],
];

export const admissionLists = {
  Undergraduate: [
    "Certified BACC II, BT3 or recognized equivalent.",
    "English proficiency evidence, or the LIU placement test.",
    "Identification, family civil-status record and a recent passport photo.",
    "Applicable NSSF documentation for Lebanese applicants.",
  ],
  Graduate: [
    "Certified bachelor’s degree and official university transcript.",
    "Bachelor’s equivalency and school-specific academic eligibility.",
    "Secondary qualification and identity documents.",
    "Any required English assessment and remedial study.",
  ],
  Transfer: [
    "Certified university transcript and course descriptions for evaluation.",
    "Secondary qualification and identity documents.",
    "School review determines transferable credit; acceptance is not automatic.",
  ],
  Freshman: [
    "Ministry permission and certified school records for grades 10–12.",
    "Identity documents, family record and a recent photo.",
    "Confirm current testing and equivalency requirements with admissions.",
  ],
};

export const photos = {
  campus: {
    url: "https://images.unsplash.com/photo-1743461420949-c3ba200ca84a?auto=format&fit=crop&w=1600&q=85",
    alt: "Illustrative university architecture",
  },
  library: {
    url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1100&q=85",
    alt: "Illustrative university library",
  },
};
export const projectPolicies = [
  [
    "Registration",
    "A course may be taken only once. Full sections close; there is no waitlist. Prerequisites, capacity, deadlines, credit limits and holds must be validated.",
  ],
  [
    "Drops & refunds",
    "Dropping before the configured deadline reverses the full course tuition charge.",
  ],
  [
    "Installments",
    "Four equal tuition installments, with a one-time $20 penalty per late installment.",
  ],
  [
    "Financial holds",
    "Overdue payments restrict grades, GPA, transcripts and next-semester registration until settled. Admin may override registration holds, not academic-record restrictions.",
  ],
  ["Major changes", "Approved major changes become effective next semester."],
  [
    "Academic records",
    "Grades, assessment breakdowns, GPA and transcripts become available after publication.",
  ],
  [
    "Account access",
    "Student accounts are created by administrators. Password setup uses your university email. Password-reset requests are limited to two.",
  ],
];

export const campuses = [
  {
    name: "Beirut",
    country: "Lebanon",
    address: "Mouseitbeh",
    phone: "+961 1 706881",
  },
  {
    name: "Bekaa",
    country: "Lebanon",
    address: "Al Khyara, West Bekaa",
    phone: "+961 8 640930",
  },
  {
    name: "Saida",
    country: "Lebanon",
    address: "Behind Saray",
    phone: "+961 7 750550",
  },
  {
    name: "Nabatieh",
    country: "Lebanon",
    address: "Facing Lebanese University",
    phone: "+961 7 767603",
  },
  {
    name: "Tripoli",
    country: "Lebanon",
    address: "Dahr el Ain Road, Al Haykalieh",
    phone: "+961 6 416333",
  },
  {
    name: "Tyre",
    country: "Lebanon",
    address: "Abbasiyeh Diversion",
    phone: "+961 7 351410",
  },
  {
    name: "Rayak",
    country: "Lebanon",
    address: "Rayak",
    phone: "+961 8 901666",
  },
  {
    name: "Mount Lebanon",
    country: "Lebanon",
    address: null,
    phone: null,
  },
  {
    name: "Akkar",
    country: "Lebanon",
    address: null,
    phone: null,
  },
  {
    name: "Sana’a",
    country: "Yemen",
    address: "50 Street, near Shahran roundabout",
    phone: "+967 1 434360",
  },
  {
    name: "Aden",
    country: "Yemen",
    address: "Khormaksar, near Al-Razi Hospital",
    phone: "+967 2 239925",
  },
  {
    name: "Taiz",
    country: "Yemen",
    address: "Camp Area",
    phone: "+967 4 282501",
  },
  {
    name: "Nouakchott",
    country: "Mauritania",
    address: "Nouakchott",
    phone: "+222 5251888",
  },
  {
    name: "Dakar",
    country: "Senegal",
    address: "Dakar",
    phone: "+221 338251437",
  },
];
