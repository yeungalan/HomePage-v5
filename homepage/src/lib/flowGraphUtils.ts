/**
 * Utility functions for FlowGraph component
 */

import * as dagre from 'dagre';

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
 * Convert config to ReactFlow nodes and edges using dagre layout
 */
export function configToFlow(config: FlowGraphConfig) {
  const { services = [], connections = [], tiers = null } = config;

  // Use custom tiers if provided, otherwise use defaults
  const defaultTiers = ['presentation', 'application', 'data'];
  const tierList = tiers || defaultTiers;

  // Group services by tier and apply defaults
  const enrichedServices = services.map((service) => {
    const serviceType = service.serviceType || 'server';
    const defaults = serviceTypeDefaults[serviceType] || serviceTypeDefaults.server;
    const tier = service.tier || defaults.tier;
    return { ...defaults, ...service, tier };
  });

  // Create a dagre graph for automatic layout
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure the graph layout
  dagreGraph.setGraph({
    rankdir: 'LR', // Left to right layout
    nodesep: 80,   // Horizontal spacing between nodes in the same rank
    ranksep: 250,  // Vertical spacing between ranks (tiers)
    edgesep: 50,   // Spacing between edges
    marginx: 50,
    marginy: 50,
  });

  // Node dimensions (must match the actual rendered size)
  const nodeWidth = 240;
  const nodeHeight = 100;

  // Add nodes to dagre graph
  enrichedServices.forEach((service) => {
    dagreGraph.setNode(service.serviceId, {
      width: nodeWidth,
      height: nodeHeight,
      tier: service.tier,
    });
  });

  // Add edges to dagre graph
  connections.forEach((conn) => {
    const [source, target] = conn;
    dagreGraph.setEdge(source, target);
  });

  // Let dagre calculate the layout
  dagre.layout(dagreGraph);

  // Convert dagre nodes to ReactFlow nodes
  const nodes: any[] = [];

  // Get all unique tiers and their positions
  const tierPositions: Record<string, number[]> = {};

  enrichedServices.forEach((service) => {
    const nodeData = dagreGraph.node(service.serviceId);
    const tier = service.tier;

    if (!tierPositions[tier]) {
      tierPositions[tier] = [];
    }
    tierPositions[tier].push(nodeData.x);
  });

  // Calculate average X position for each tier (for tier labels)
  const tierLabelPositions: Record<string, { x: number; minY: number }> = {};
  Object.entries(tierPositions).forEach(([tier, xPositions]) => {
    const avgX = xPositions.reduce((a, b) => a + b, 0) / xPositions.length;
    tierLabelPositions[tier] = { x: avgX - nodeWidth / 2 - 100, minY: Infinity };
  });

  // Add service nodes with dagre-calculated positions
  enrichedServices.forEach((service) => {
    const nodeData = dagreGraph.node(service.serviceId);

    // Track minimum Y position for tier labels
    if (nodeData.y < tierLabelPositions[service.tier].minY) {
      tierLabelPositions[service.tier].minY = nodeData.y;
    }

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
      position: {
        x: nodeData.x - nodeWidth / 2,
        y: nodeData.y - nodeHeight / 2,
      },
      style: { zIndex: 10 },
    });
  });

  // Add tier labels
  Object.entries(tierLabelPositions).forEach(([tier, pos]) => {
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
    nodes.push({
      id: `tier-${tier}`,
      type: 'tierLabel',
      data: { label: tierName },
      position: { x: pos.x, y: pos.minY - nodeHeight / 2 - 30 },
      draggable: false,
    });
  });

  // Create edges from connections
  const edges = connections.map((conn, index) => {
    const [source, target] = conn;
    const sourceNode = enrichedServices.find((s) => s.serviceId === source);
    const targetNode = enrichedServices.find((s) => s.serviceId === target);

    // Determine if this is a special connection (like replication)
    const isDatabaseReplication =
      sourceNode?.serviceType === 'database' && targetNode?.serviceType === 'database';

    return {
      id: `e${index}-${source}-${target}`,
      source,
      target,
      type: 'custom',
      label: conn[2] || '1-5ms',
      animated: true,
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
