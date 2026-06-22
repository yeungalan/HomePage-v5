/**
 * Professional experience and education timeline data
 */

export interface Experience {
  id: string;
  type: 'work' | 'education' | 'milestone';
  title: string;
  organization?: string;
  startDate: string;
  endDate: string;
  icon: string;
  isOngoing?: boolean;
}

/**
 * Timeline of experiences, education, and milestones
 */
export const EXPERIENCES: Experience[] = [
  {
    id: '-1',
    type: 'study',
    title: 'Student',
    organization: 'Kudan Institute of Japanese language',
    startDate: 'Apr 2024',
    endDate: 'Current',
    icon: 'mdi:school',
    isOngoing: true,
  },
  {
    id: '0',
    type: 'milestone',
    title: 'Moved to Japan',
    startDate: 'Apr 2026',
    endDate: 'Apr 2026',
    icon: 'mdi:airplane',
  },
  {
    id: '1',
    type: 'work',
    title: 'Software Engineer I',
    organization: 'Amazon Web Services',
    startDate: 'Sept 2024',
    endDate: 'Apr 2026',
    icon: 'mdi:aws',
  },
  {
    id: '2',
    type: 'work',
    title: 'Cloud Engineer I',
    organization: 'Amazon Web Services',
    startDate: 'Sept 2023',
    endDate: 'Sept 2024',
    icon: 'mdi:aws',
  },
  {
    id: '3',
    type: 'education',
    title: 'Computer Engineering (GPA 3.75/4.00)',
    organization: 'University of Washington - Seattle Campus',
    startDate: 'June 2021',
    endDate: 'June 2023',
    icon: 'mdi:school',
  },
  {
    id: '4',
    type: 'education',
    title: 'Engineering',
    organization: 'The Chinese University of Hong Kong',
    startDate: 'Sept 2019',
    endDate: 'July 2020',
    icon: 'mdi:school',
  },
  {
    id: '5',
    type: 'milestone',
    title: 'Moved to America',
    startDate: '2019',
    endDate: '2019',
    icon: 'mdi:airplane',
  },
  {
    id: '6',
    type: 'work',
    title: 'imuslab',
    startDate: '2018',
    endDate: '2023',
    icon: 'mdi:office-building',
  },
  {
    id: '7',
    type: 'education',
    title: 'High school graduation',
    startDate: '2018',
    endDate: '2018',
    icon: 'mdi:school-outline',
  },
];

/**
 * Month name to number mapping for date parsing
 */
export const MONTH_MAP: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  June: '06',
  Jul: '07',
  Aug: '08',
  Sept: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
} as const;

/**
 * Parse a date string into a comparable format
 * Handles formats like "Sept 2024", "June 2021", or just "2019"
 */
export const parseExperienceDate = (dateStr: string): string => {
  if (dateStr === 'Present') return '9999-12';

  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const [month, year] = parts;
    return `${year}-${MONTH_MAP[month] || '01'}`;
  }
  return `${dateStr}-01`; // For year-only dates
};

/**
 * Sort experiences by start date (most recent first)
 */
export const sortExperiencesByDate = (experiences: Experience[]): Experience[] => {
  return [...experiences].sort((a, b) => {
    const dateA = parseExperienceDate(a.startDate);
    const dateB = parseExperienceDate(b.startDate);
    return dateB.localeCompare(dateA);
  });
};
