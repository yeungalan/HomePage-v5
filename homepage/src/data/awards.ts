/**
 * Awards and certifications data
 */

export interface Award {
  id: string;
  title: string;
  created: string;
}

export const AWARDS: Award[] = [
  { id: "1", title: "(ISC)² Certified Information Systems Security Professional (CISSP)", created: "2026-09-02 00:00:00" },
  { id: "2", title: "Scrum.org Professional Scrum Master I", created: "2026-01-29 00:00:00" },
  { id: "3", title: "Professional Association of Diving Instructors - Open Water", created: "2025-07-28 00:00:00" },
  { id: "4", title: "Japanese-Language Proficiency Test - N5", created: "2025-01-10 00:00:00" },
  { id: "5", title: "AWS Certified Security – Specialty", created: "2024-02-27 00:00:00" },
  { id: "6", title: "University of Washington - Annual Dean's List", created: "2023-06-13 00:00:00" },
  { id: "7", title: "AWS Certified Solutions Architect – Associate", created: "2022-07-27 00:00:00" },
  { id: "8", title: "AWS Certified Cloud Practitioner", created: "2022-07-06 00:00:00" },
];
