/**
 * Utility functions for FlowGraph component
 */

import type { Node } from '@xyflow/react';

interface Service {
  serviceId: string;
  serviceName: string;
  serviceDescription?: string;
  serviceType?: string;
  serviceLabel?: string;
  status?: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
  tier?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
}

interface FlowGraphConfig {
  services: Service[];
  connections: [string, string, string?][];
  tiers?: string[] | null;
}

interface ServiceTypeDefaults {
  icon: string;
  iconBg: string;
  iconColor: string;
  tier: string;
}

/**
 * Default service type configurations
 */
export const serviceTypeDefaults: Record<string, ServiceTypeDefaults> = {
  web: { icon: 'mdi:web', iconBg: '#dbeafe', iconColor: '#2563eb', tier: 'presentation' },
  mobile: { icon: 'mdi:cellphone', iconBg: '#dbeafe', iconColor: '#2563eb', tier: 'presentation' },
  loadbalancer: {
    icon: 'mdi:scale-balance',
    iconBg: '#fed7aa',
    iconColor: '#ea580c',
    tier: 'application',
  },
  server: { icon: 'mdi:server', iconBg: '#fed7aa', iconColor: '#ea580c', tier: 'application' },
  database: { icon: 'mdi:database', iconBg: '#e9d5ff', iconColor: '#9333ea', tier: 'data' },
  cache: { icon: 'mdi:database-clock', iconBg: '#e9d5ff', iconColor: '#9333ea', tier: 'data' },
};

/**
 * Convert config to ReactFlow nodes and edges
 */
export function configToFlow(config: FlowGraphConfig) {
  const { services = [], connections = [], tiers = null } = config;

  // Use custom tiers if provided, otherwise use defaults
  const defaultTiers = ['presentation', 'application', 'data'];
  const tierList = tiers || defaultTiers;

  // Group services by tier
  const tierGroups: Record<string, Service[]> = {};
  tierList.forEach((tier) => {
    tierGroups[tier] = [];
  });

  services.forEach((service) => {
    const serviceType = service.serviceType || 'server';
    const defaults = serviceTypeDefaults[serviceType] || serviceTypeDefaults.server;
    const tier = service.tier || defaults.tier;

    // If tier doesn't exist in tierGroups, add it
    if (!tierGroups[tier]) {
      tierGroups[tier] = [];
    }

    tierGroups[tier].push({ ...service, ...defaults, tier });
  });

  // Calculate positions based on number of tiers
  const nodes: Node[] = [];
  const startX = 100;
  const tierSpacing = 400;

  const tierXPositions: Record<string, number> = {};
  const tierLabels: Record<string, number> = {};

  tierList.forEach((tier, index) => {
    tierXPositions[tier] = startX + index * tierSpacing;
    tierLabels[tier] = startX + index * tierSpacing - 80;
  });

  const yStart = 150;
  const ySpacing = 200;

  // Add tier labels
  Object.entries(tierLabels).forEach(([tier, x]) => {
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
    nodes.push({
      id: `tier-${tier}`,
      type: 'tierLabel',
      data: { label: `${tierName}` },
      position: { x, y: 50 },
      draggable: false,
    });
  });

  // Add service nodes
  Object.entries(tierGroups).forEach(([tier, tierServices]) => {
    tierServices.forEach((service, index) => {
      const xPos = tierXPositions[tier];
      const yPos = yStart + index * ySpacing;

      nodes.push({
        id: service.serviceId,
        type: 'custom',
        data: {
          label: service.serviceLabel || service.serviceId,
          title: service.serviceName,
          subtitle: service.serviceDescription,
          icon: service.icon,
          iconBg: service.iconBg,
          iconColor: service.iconColor,
          health: service.status || 'healthy',
        },
        position: { x: xPos, y: yPos },
        style: { zIndex: 10 },
      });
    });
  });

  // Create edges from connections
  const edges = connections.map((conn, index) => {
    const [source, target] = conn;
    const sourceNode = services.find((s) => s.serviceId === source);
    const targetNode = services.find((s) => s.serviceId === target);

    // Determine if this is a special connection (like replication)
    const isDatabaseReplication =
      sourceNode?.serviceType === 'database' && targetNode?.serviceType === 'database';

    return {
      id: `e${index}-${source}-${target}`,
      source,
      target,
      type: 'smart',
      label: conn[2] || '1-5ms',
      animated: true,
      data: { nodes },
      style: {
        stroke: isDatabaseReplication ? '#a78bfa' : '#94a3b8',
        strokeWidth: 2,
        strokeDasharray: '8,8',
        zIndex: 0,
      },
      labelStyle: {
        fill: isDatabaseReplication ? '#7c3aed' : '#475569',
        fontWeight: 600,
        fontSize: 11,
        zIndex: 5,
      },
      labelBgPadding: [8, 4] as [number, number],
      labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    };
  });

  return { nodes, edges };
}
