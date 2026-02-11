import { NextResponse } from 'next/server';

// Map UptimeRobot monitor names to service IDs
const MONITOR_NAME_TO_SERVICE_ID: Record<string, string> = {
  'ArOZOS': 'arozos-1',
  'ArOZOS 2': 'arozos-2',
  'ArOZOS 3': 'arozos-1', // Fallback to arozos-1 if there's a third instance
  'CAS Controller': 'cas',
  'Jenkins': 'jenkins',
  'GitLab': 'gitlab',
  'Git Server': 'gogs',
  'Gogs': 'gogs',
  'Minecraft 25565': 'minecraft-25565',
  'Minecraft 25566': 'minecraft-25566',
  'Synology': 'core-data-storage', // Map Synology to data storage
};

// Map UptimeRobot statusClass to our health status
function mapStatusToHealth(statusClass: string | undefined): 'healthy' | 'unhealthy' | 'warning' | 'unknown' {
  if (!statusClass) return 'unknown';

  switch (statusClass.toLowerCase()) {
    case 'success':
      return 'healthy';
    case 'danger':
      return 'unhealthy';
    case 'warning':
      return 'warning';
    default:
      return 'unknown';
  }
}

// Map ratio label to health status
function mapRatioLabelToHealth(label: string | undefined): 'healthy' | 'unhealthy' | 'warning' | 'unknown' {
  if (!label) return 'unknown';

  switch (label.toLowerCase()) {
    case 'excellent':
    case 'good':
      return 'healthy';
    case 'fair':
      return 'warning';
    case 'poor':
      return 'unhealthy';
    default:
      return 'unknown';
  }
}

export async function GET() {
  try {
    const response = await fetch(
      'https://stats.uptimerobot.com/api/getMonitorList/JKvyVhBqBO?page=1&_=' + Date.now(),
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch UptimeRobot data:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch monitoring data' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.psp?.monitors) {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Process monitors and create status map
    const statusMap: Record<string, {
      status: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
      monitorName: string;
      ratio30d?: string;
      ratio90d?: string;
      statusClass?: string;
    }> = {};

    for (const monitor of data.psp.monitors) {
      const monitorName = monitor.name;
      const serviceId = MONITOR_NAME_TO_SERVICE_ID[monitorName];

      if (serviceId) {
        // Prefer statusClass, fall back to ratio label
        const statusFromClass = mapStatusToHealth(monitor.statusClass);
        const statusFromRatio = mapRatioLabelToHealth(monitor['30dRatio']?.label);
        const finalStatus = statusFromClass !== 'unknown' ? statusFromClass : statusFromRatio;

        statusMap[serviceId] = {
          status: finalStatus,
          monitorName: monitorName,
          ratio30d: monitor['30dRatio']?.label,
          ratio90d: monitor['90dRatio']?.label,
          statusClass: monitor.statusClass,
        };
      }
    }

    return NextResponse.json({
      success: true,
      statusMap,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching UptimeRobot data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}
