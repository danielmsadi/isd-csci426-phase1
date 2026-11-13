// Client-owned identity. Only configure assets and contact details with permission.
export const brand = {
  name: import.meta.env.VITE_UNIVERSITY_NAME || "LIU",
  shortName: import.meta.env.VITE_UNIVERSITY_SHORT_NAME || "LIU",
  tagline:
    import.meta.env.VITE_UNIVERSITY_TAGLINE || "Knowledge opens possibilities",
  logo: import.meta.env.VITE_UNIVERSITY_LOGO || "",
  admissionsEmail:
    import.meta.env.VITE_ADMISSIONS_EMAIL || "admissions@liu.edu.lb",
  phone: import.meta.env.VITE_CONTACT_PHONE || "+961 1 705080",
};

export const contentStatus = {
  tuition: "published-information-subject-to-change",
  degreeRequirements: "cohort-dependent",
  campuses: "published-directory",
};
