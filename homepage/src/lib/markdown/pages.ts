/**
 * Markdown for the home page and the other pages that aren't posts. Each one
 * renders the same data as its HTML page; for client-only widgets (the globe,
 * the clocks, the live status diagram) that means the data behind them.
 */

import type { Service, ServiceStatus } from '@/components/FlowGraph';
import { SITE_CONFIG } from '@/constants/site';
import { TIMEZONES, getDaylightInfo } from '@/constants/timezones';
import { AWARDS } from '@/data/awards';
import { EXPERIENCES, sortExperiencesByDate, type Experience } from '@/data/experiences';
import { FRIENDS_DATA, type LinkEntry } from '@/data/friends';
import { GOALS_2026, GOAL_STATUS_LABELS } from '@/data/goals';
import { INFRASTRUCTURE_CONFIG, UPTIME_SLA, UPTIME_STATUS_PAGE_URL } from '@/data/infrastructure';
import { FOOTER_LINKS, HEADER_MENU_CONFIG } from '@/data/navigation';
import { PROJECTS_DATA } from '@/data/projects';
import { QUOTES_BY_LOCALE } from '@/data/quotes';
import { FLIGHT_ROUTES } from '@/data/routes';
import { getSocialLinksArray, type SocialPlatform } from '@/data/social';
import { TRAIN_DATA } from '@/data/train';
import { WORLD_AIRPORTS } from '@/data/worldAirports';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { STATUS_LABEL_KEY, averageUptime, overallStatus, withLiveStatus } from '@/lib/arch-status';
import { OFFICIAL_STATUS_PAGES, type OfficialStatuses } from '@/lib/official-status';
import { formatDuration, formatRatio, type UptimeMonitor } from '@/lib/uptime';
import type { TrainPath } from '@/types/world';
import { absoluteUrl, bulletList, isoDate, link, t, table, utcMinute, type MarkdownPage } from './document';

/** Keep a trailing full stop single when a message already ends a sentence. */
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

// ---------------------------------------------------------------------------
// Home (/)

/** The roles the greeting in components/greet-text/GreetText.tsx cycles through after "I'm a". */
const HERO_ROLES = ['Traveller', 'Software Engineer', 'Photographer', 'Adventurer', 'Security Researcher'];

/** Profile URLs for the icons under the greeting (components/SocialIcon.tsx). */
const SOCIAL_PROFILES: Record<SocialPlatform, { name: string; url: (id: string) => string }> = {
  github: { name: 'GitHub', url: (id) => `https://github.com/${id}` },
  linkedin: { name: 'LinkedIn', url: (id) => `https://linkedin.com/in/${id}` },
  instagram: { name: 'Instagram', url: (id) => `https://instagram.com/${id}` },
  twitter: { name: 'Twitter', url: (id) => `https://twitter.com/${id}` },
};

/** The date range on an experience card (components/ActivityCard.tsx). */
const experienceDates = ({ startDate, endDate, isOngoing }: Experience) => {
  if (isOngoing) return `${startDate} - ${t('activity.present')}`;
  return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
};

export const homeMarkdown = (): MarkdownPage => ({
  path: '/',
  title: SITE_CONFIG.title,
  meta: { description: SITE_CONFIG.description },
  body: [
    '# Hi, This is Alan.',
    `I'm a ${new Intl.ListFormat('en', { type: 'conjunction' }).format(HERO_ROLES)}.`,
    t('hero.tagline'),
    `![${SITE_CONFIG.author.name}](${absoluteUrl(SITE_CONFIG.ogImage)})`,
    bulletList(
      getSocialLinksArray().map(([platform, id]) =>
        link(SOCIAL_PROFILES[platform].name, SOCIAL_PROFILES[platform].url(id)),
      ),
    ),
    `## ${t('home.awards')}`,
    bulletList(AWARDS.map((award) => `${award.title} (${isoDate(award.created)})`)),
    `## ${t('home.experience')}`,
    bulletList(
      sortExperiencesByDate(EXPERIENCES).map(
        (item) =>
          `**${item.title}**${item.organization ? `, ${item.organization}` : ''} (${experienceDates(item)})`,
      ),
    ),
    '## Quotes',
    'The page shows one of these at random:',
    bulletList([...QUOTES_BY_LOCALE[DEFAULT_LOCALE]]),
    `## ${t('footer.quickLinksTitle')}`,
    t('footer.quickLinksSubtitle'),
    bulletList(FOOTER_LINKS.map((item) => link(item.titleKey ? t(item.titleKey) : item.title, item.path))),
  ].join('\n\n'),
});

// ---------------------------------------------------------------------------
// Projects (/projects) and friends (/friends)

const linkCards = (entries: LinkEntry[]) =>
  bulletList(entries.map((entry) => `${link(entry.name, entry.url)}: ${entry.description}`));

export const projectsMarkdown = (): MarkdownPage => ({
  path: '/projects',
  title: t('projects.title'),
  body: [`# ${t('projects.title')}`, t('projects.subtitle'), linkCards(PROJECTS_DATA)].join('\n\n'),
});

export const friendsMarkdown = (): MarkdownPage => ({
  path: '/friends',
  title: t('friends.title'),
  body: [`# ${t('friends.title')}`, t('friends.subtitle'), linkCards(FRIENDS_DATA)].join('\n\n'),
});

// ---------------------------------------------------------------------------
// Goals (/goals)

const DAY_MS = 86_400_000;

/**
 * The goals page at `now`. The page works out its clocks and progress bars in
 * the reader's time zone; this uses UTC and lists the page's city clocks.
 */
export const goalsMarkdown = (now: Date): MarkdownPage => {
  const year = now.getUTCFullYear();
  const yearStart = Date.UTC(year, 0, 1);
  const nextYearStart = Date.UTC(year + 1, 0, 1);
  const dayStart = Date.UTC(year, now.getUTCMonth(), now.getUTCDate());
  const percent = (value: number) => `${value.toFixed(2)}%`;
  const cityTime = (timeZone: string) =>
    now.toLocaleString('en-US', {
      timeZone,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });

  return {
    path: '/goals',
    title: t('nav.goals'),
    body: [
      `# ${t('goals.titleYear', { year })}`,
      t('goals.daysLeft', { days: Math.floor((nextYearStart - 1 - now.getTime()) / DAY_MS), year: year + 1 }),
      `As of ${utcMinute(now)}:`,
      bulletList([
        `UTC: ${now.toISOString().slice(11, 19)}`,
        `${t('goals.dayOfYear')}: ${(dayStart - yearStart) / DAY_MS + 1}`,
        `${t('goals.yearProgress')}: ${percent(((now.getTime() - yearStart) / (nextYearStart - yearStart)) * 100)}`,
        `${t('goals.todayProgress')}: ${percent(((now.getTime() - dayStart) / DAY_MS) * 100)}`,
        ...TIMEZONES.map(
          ({ label, tz, lat, lng }) => `${label}: ${cityTime(tz)} (${getDaylightInfo(now, lat, lng).phase})`,
        ),
      ]),
      `## ${t('flightCalculator.title')}`,
      `${t('flightCalculator.subtitle')} On the web page, enter two IATA airport codes to use it.`,
      `## ${t('goals.titleYear', { year })}`,
      bulletList(
        GOALS_2026.map(
          (goal) =>
            `**${goal.title}** (${GOAL_STATUS_LABELS[goal.status]})${goal.description ? `: ${goal.description}` : ''}`,
        ),
      ),
    ].join('\n\n'),
  };
};

// ---------------------------------------------------------------------------
// World map (/world)

/** "Kaohsiung ↔ Taichung", from the stops' cities (some route names in data/train.ts are stale). */
const tripName = (route: TrainPath) => {
  const cities = route.coords.map((point) => (Array.isArray(point) ? undefined : point.city));
  return cities.every(Boolean) ? cities.join(' ↔ ') : route.properties.name;
};

export const worldMarkdown = (): MarkdownPage => {
  const airportByIata = new Map(WORLD_AIRPORTS.map((airport) => [airport.iata, airport]));
  const visited = new Set(FLIGHT_ROUTES.flatMap((route) => [route.srcIata, route.dstIata]));
  const airports = WORLD_AIRPORTS.filter((airport) => visited.has(airport.iata)).sort(
    (a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
  );
  const place = (iata: string) => {
    const city = airportByIata.get(iata)?.city;
    return city ? `${iata} (${city})` : iata;
  };
  const flights = FLIGHT_ROUTES.map((route) => `${place(route.srcIata)} ↔ ${place(route.dstIata)}`);
  const trips = [...new Set(TRAIN_DATA.map(tripName))];

  return {
    path: '/world',
    title: t('nav.world'),
    body: [
      `# ${t('nav.world')}`,
      'The airports, flights and train or car trips on the interactive 3D globe of the web page.',
      `## ${t('world.legendAirports')} (${airports.length})`,
      table(
        ['IATA', 'Airport', 'City', 'Country'],
        airports.map((airport) => [airport.iata, airport.name, airport.city, airport.country]),
      ),
      `## ${t('world.legendFlightRoutes')} (${flights.length})`,
      bulletList(flights),
      `## ${t('world.legendTrainRoutes')} (${trips.length})`,
      bulletList(trips),
    ].join('\n\n'),
  };
};

// ---------------------------------------------------------------------------
// Architecture (/arch)

export interface ArchLiveStatus {
  /** UptimeRobot monitors by ID, or null if they couldn't be loaded. */
  monitors: Map<number, UptimeMonitor> | null;
  /** Providers' official statuses, or null if they couldn't be loaded. */
  officials: OfficialStatuses | null;
  /** When the live status was read. */
  checkedAt: Date;
}

const statusLabel = (status: ServiceStatus) => t(`arch.uptime.status.${STATUS_LABEL_KEY[status]}`);

/** What a service's detail panel says about its status (components/arch/ServiceUptime.tsx). */
const serviceDetails = (
  service: Service,
  monitor: UptimeMonitor | undefined,
  officials: OfficialStatuses | null,
): string[] => {
  if (service.statusSource) {
    const official = officials?.[service.statusSource];
    if (!official) return [t('arch.uptime.unavailable')];
    const source = t('arch.uptime.officialSource', { source: OFFICIAL_STATUS_PAGES[service.statusSource].name });
    return official.summary ? [source, official.summary] : [source];
  }
  if (service.statusFromDownstream) return [t('arch.uptime.downstream')];
  if (service.uptimeMonitorId === undefined) return [t('arch.uptime.notMonitored')];
  if (!monitor) return [t('arch.uptime.unavailable')];
  if (monitor.status === 'paused') return [t('arch.uptime.paused')];

  const details: string[] = [];
  if (monitor.ratio30d !== null) details.push(`${t('arch.uptime.last30Days')}: ${formatRatio(monitor.ratio30d)}`);
  if (monitor.ratio90d !== null) details.push(`${t('arch.uptime.last90Days')}: ${formatRatio(monitor.ratio90d)}`);
  const { lastDowntime } = monitor;
  details.push(
    `${t('arch.uptime.lastDowntime')}: ${
      lastDowntime
        ? t('arch.uptime.lastDowntimeValue', {
            date: utcMinute(lastDowntime.at),
            duration: formatDuration(lastDowntime.seconds, DEFAULT_LOCALE),
          })
        : t('arch.uptime.noDowntime')
    }`,
  );
  return details;
};

export const archMarkdown = ({ monitors, officials, checkedAt }: ArchLiveStatus): MarkdownPage => {
  const config = withLiveStatus(INFRASTRUCTURE_CONFIG, monitors, officials, t);
  const overall = overallStatus(config.services);
  const uptime = averageUptime(config.services, monitors);
  const nameOf = new Map(config.services.map((service) => [service.serviceId, service.serviceName]));

  const summary = [sentence(overall ? t(`arch.summary.${overall}`) : t('arch.summary.unavailable'))];
  if (uptime !== null) {
    const sla = t(uptime >= UPTIME_SLA ? 'arch.summary.slaMet' : 'arch.summary.slaMissed', { target: `${UPTIME_SLA}%` });
    summary.push(`${t('arch.summary.uptime30d', { ratio: formatRatio(uptime) })} (${sla}).`);
  }
  const caption = monitors
    ? t('arch.uptime.updatedAt', { time: utcMinute(checkedAt) })
    : t('arch.uptime.unavailable');

  // The diagram's columns in order, then any tier only a service names, so no service is left out.
  const tierNames = [...new Set([...(config.tiers ?? []), ...config.services.map((service) => service.tier ?? '')])];
  const tiers = tierNames.flatMap((tier) => {
    const services = config.services.filter((service) => (service.tier ?? '') === tier);
    if (services.length === 0) return [];
    const items = services.map((service) => {
      const monitor = service.uptimeMonitorId === undefined ? undefined : monitors?.get(service.uptimeMonitorId);
      const description = service.serviceDescription ? ` (${service.serviceDescription})` : '';
      return [
        `- **${service.serviceName}**${description}: ${statusLabel(service.status ?? 'unknown')}`,
        ...serviceDetails(service, monitor, officials).map((detail) => `  - ${detail}`),
      ].join('\n');
    });
    return [`### ${tier || 'Other'}`, items.join('\n')];
  });

  const connections = config.connections.map(([from, to, latency]) => {
    const label = latency && latency !== '-' ? ` (${latency})` : '';
    return `${nameOf.get(from) ?? from} → ${nameOf.get(to) ?? to}${label}`;
  });

  return {
    path: '/arch',
    title: t('arch.title'),
    body: [
      `# ${t('arch.title')}`,
      t('arch.subtitle'),
      '## Status',
      summary.join(' '),
      `${sentence(caption)} ${link(t('arch.uptime.viewStatusPage'), UPTIME_STATUS_PAGE_URL)}`,
      '## Services',
      ...tiers,
      '## Connections',
      bulletList(connections),
    ].join('\n\n'),
  };
};

// ---------------------------------------------------------------------------
// 404

export const notFoundMarkdown = (): MarkdownPage => ({
  title: t('notFound.title'),
  body: [
    `# ${t('notFound.title')}`,
    `${t('notFound.eyebrow')}. ${t('notFound.description')}`,
    link(t('notFound.home'), '/'),
    `## ${t('notFound.suggestions')}`,
    bulletList(
      HEADER_MENU_CONFIG.flatMap((item) => item.subMenu ?? [item])
        .filter((item) => item.path !== '/')
        .map((item) => link(item.titleKey ? t(item.titleKey) : item.title, item.path)),
    ),
  ].join('\n\n'),
});
