/**
 * Utility functions for FlowGraph component
 */

import * as dagre from 'dagre';
import type { Node } from '@xyflow/react';
import { UI_COLORS, TIER_COLORS } from '@/constants/colors';
import { EDGE_STYLES } from '@/constants/spacing';

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

interface FlowNodeData {
  [key: string]: unknown;
  label: string;
  title: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  health: string;
  hasIncomingEdge: boolean;
  hasOutgoingEdge: boolean;
  isSelected?: boolean;
}

/** Default edge label when a connection has no explicit latency annotation. */
const DEFAULT_EDGE_LABEL = '1-5ms';

/**
 * Default service type configurations — colours come from TIER_COLORS in colors.ts.
 */
export const serviceTypeDefaults: Record<string, ServiceTypeDefaults> = {
  web: { icon: 'mdi:web', iconBg: TIER_COLORS.presentation.bg, iconColor: TIER_COLORS.presentation.primary, tier: 'presentation' },
  mobile: { icon: 'mdi:cellphone', iconBg: TIER_COLORS.presentation.bg, iconColor: TIER_COLORS.presentation.primary, tier: 'presentation' },
  loadbalancer: {
    icon: 'mdi:scale-balance',
    iconBg: TIER_COLORS.application.bg,
    iconColor: TIER_COLORS.application.primary,
    tier: 'application',
  },
  server: { icon: 'mdi:server', iconBg: TIER_COLORS.application.bg, iconColor: TIER_COLORS.application.primary, tier: 'application' },
  database: { icon: 'mdi:database', iconBg: TIER_COLORS.data.bg, iconColor: TIER_COLORS.data.primary, tier: 'data' },
  cache: { icon: 'mdi:database-clock', iconBg: TIER_COLORS.data.bg, iconColor: TIER_COLORS.data.primary, tier: 'data' },
};

/**
 * Convert config to ReactFlow nodes and edges using dagre layout
 */
export function configToFlow(config: FlowGraphConfig) {
  const { services = [], connections = [] } = config;

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
  const nodes: Node<FlowNodeData>[] = [];

  // Calculate which nodes have incoming and outgoing connections
  const hasIncoming = new Set<string>();
  const hasOutgoing = new Set<string>();

  connections.forEach(([source, target]) => {
    hasOutgoing.add(source);
    hasIncoming.add(target);
  });

  // Add service nodes with dagre-calculated positions
  enrichedServices.forEach((service) => {
    const nodeData = dagreGraph.node(service.serviceId);

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
        hasIncomingEdge: hasIncoming.has(service.serviceId),
        hasOutgoingEdge: hasOutgoing.has(service.serviceId),
      },
      position: {
        x: nodeData.x - nodeWidth / 2,
        y: nodeData.y - nodeHeight / 2,
      },
      style: { zIndex: 10 },
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
      label: conn[2] || DEFAULT_EDGE_LABEL,
      animated: true,
      style: {
        stroke: isDatabaseReplication ? UI_COLORS.purple[400] : UI_COLORS.slate[400],
        strokeWidth: EDGE_STYLES.STROKE_WIDTH,
        strokeDasharray: EDGE_STYLES.DASH_ARRAY,
        zIndex: 0,
      },
      labelStyle: {
        fill: isDatabaseReplication ? UI_COLORS.purple[600] : UI_COLORS.slate[600],
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
