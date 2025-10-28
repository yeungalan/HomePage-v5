import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@iconify/react';

// Custom Node Component
function CustomNode({ data }) {
  const healthColors = {
    healthy: { bg: '#dcfce7', color: '#16a34a', icon: 'mdi:check-circle' },
    unhealthy: { bg: '#fee2e2', color: '#dc2626', icon: 'mdi:alert-circle' },
    warning: { bg: '#fef3c7', color: '#f59e0b', icon: 'mdi:alert' },
    unknown: { bg: '#f3f4f6', color: '#6b7280', icon: 'mdi:help-circle' },
  };
  
  const health = healthColors[data.health || 'healthy'];
  
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px 20px',
      minWidth: '180px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      position: 'relative',
    }}>
      {/* Health Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: health.bg,
        padding: '4px 8px',
        borderRadius: '12px',
      }}>
        <Icon icon={health.icon} width="14" height="14" style={{ color: health.color }} />
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: health.color,
          textTransform: 'capitalize',
        }}>
          {data.health || 'healthy'}
        </span>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left}
        style={{ 
          background: '#6b7280',
          width: '8px',
          height: '8px',
          border: '2px solid white',
          left: '-5px'
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {data.icon && (
          <div style={{
            background: data.iconBg || '#f3f4f6',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            minHeight: '40px',
          }}>
            <Icon icon={data.icon} width="24" height="24" style={{ color: data.iconColor || '#6b7280' }} />
          </div>
        )}
        
        <div style={{ flex: 1, paddingRight: '80px' }}>
          {data.label && (
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              marginBottom: '4px',
              fontWeight: 500,
            }}>
              {data.label}
            </div>
          )}
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1f2937',
          }}>
            {data.title}
          </div>
          {data.subtitle && (
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '2px',
            }}>
              {data.subtitle}
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right}
        style={{ 
          background: '#6b7280',
          width: '8px',
          height: '8px',
          border: '2px solid white',
          right: '-5px'
        }}
      />
    </div>
  );
}

// Tier Label Node Component
function TierLabel({ data }) {
  return (
    <div style={{
      background: 'transparent',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      textAlign: 'center',
    }}>
      {data.label}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
  tierLabel: TierLabel,
};

// Default service type configurations
const serviceTypeDefaults = {
  web: { icon: 'mdi:web', iconBg: '#dbeafe', iconColor: '#2563eb', tier: 'presentation' },
  mobile: { icon: 'mdi:cellphone', iconBg: '#dbeafe', iconColor: '#2563eb', tier: 'presentation' },
  loadbalancer: { icon: 'mdi:scale-balance', iconBg: '#fed7aa', iconColor: '#ea580c', tier: 'application' },
  server: { icon: 'mdi:server', iconBg: '#fed7aa', iconColor: '#ea580c', tier: 'application' },
  database: { icon: 'mdi:database', iconBg: '#e9d5ff', iconColor: '#9333ea', tier: 'data' },
  cache: { icon: 'mdi:database-clock', iconBg: '#e9d5ff', iconColor: '#9333ea', tier: 'data' },
};

// Helper function to convert config to ReactFlow nodes and edges
function configToFlow(config) {
  const { services = [], connections = [], tiers = null } = config;
  
  // Use custom tiers if provided, otherwise use defaults
  const defaultTiers = ['presentation', 'application', 'data'];
  const tierList = tiers || defaultTiers;
  
  // Group services by tier
  const tierGroups = {};
  tierList.forEach(tier => {
    tierGroups[tier] = [];
  });
  
  services.forEach(service => {
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
  const nodes = [];
  const tierCount = tierList.length;
  const startX = 100;
  const tierSpacing = 400;
  
  const tierXPositions = {};
  const tierLabels = {};
  
  tierList.forEach((tier, index) => {
    tierXPositions[tier] = startX + (index * tierSpacing);
    tierLabels[tier] = startX + (index * tierSpacing) - 80;
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
      const yPos = yStart + (index * ySpacing);
      
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
      });
    });
  });
  
  // Create edges from connections
  const edges = connections.map((conn, index) => {
    const [source, target] = conn;
    const sourceNode = services.find(s => s.serviceId === source);
    const targetNode = services.find(s => s.serviceId === target);
    
    // Determine if this is a special connection (like replication)
    const isDatabaseReplication = sourceNode?.serviceType === 'database' && targetNode?.serviceType === 'database';
    
    return {
      id: `e${index}-${source}-${target}`,
      source,
      target,
      label: conn[2] || '1-5ms', // Optional latency label
      type: 'default', // Use default for smooth curves
      animated: true, // Always animate
      style: {
        stroke: isDatabaseReplication ? '#a78bfa' : '#94a3b8',
        strokeWidth: 2.5,
        strokeDasharray: '8,8', // All lines are dashed
      },
      labelStyle: {
        fill: isDatabaseReplication ? '#7c3aed' : '#475569',
        fontWeight: 600,
        fontSize: 11,
      },
      labelBgPadding: [8, 4],
      labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
    };
  });
  
  return { nodes, edges };
}

export default function ThreeTierInfrastructure({ config }) {
  // Default configuration if none provided
  const defaultConfig = {
    services: [
      {
        serviceId: 'web',
        serviceName: 'Web Browser',
        serviceDescription: 'Client Interface',
        serviceType: 'web',
        status: 'healthy',
      },
      {
        serviceId: 'mobile',
        serviceName: 'Mobile App',
        serviceDescription: 'iOS / Android',
        serviceType: 'mobile',
        status: 'healthy',
      },
      {
        serviceId: 'lb',
        serviceName: 'Load Balancer',
        serviceDescription: 'Traffic Distribution',
        serviceType: 'loadbalancer',
        serviceLabel: 'LB',
        status: 'healthy',
      },
      {
        serviceId: 'AS1',
        serviceName: 'App Server 1',
        serviceDescription: 'Business Logic',
        serviceType: 'server',
        status: 'healthy',
      },
      {
        serviceId: 'AS2',
        serviceName: 'App Server 2',
        serviceDescription: 'Business Logic',
        serviceType: 'server',
        status: 'warning',
      },
      {
        serviceId: 'db-primary',
        serviceName: 'Primary DB',
        serviceDescription: 'Read/Write',
        serviceType: 'database',
        serviceLabel: 'PRIMARY',
        status: 'healthy',
      },
      {
        serviceId: 'db-replica',
        serviceName: 'Replica DB',
        serviceDescription: 'Read Only',
        serviceType: 'database',
        serviceLabel: 'REPLICA',
        status: 'unhealthy',
      },
    ],
    connections: [
      ['web', 'lb', '50-100ms'],
      ['mobile', 'lb', '50-100ms'],
      ['lb', 'AS1', '1-5ms'],
      ['lb', 'AS2', '1-5ms'],
      ['AS1', 'db-primary', '1-3ms'],
      ['AS1', 'db-replica', '1-3ms'],
      ['AS2', 'db-primary', '1-3ms'],
      ['AS2', 'db-replica', '1-3ms'],
      ['db-primary', 'db-replica', '<10ms'],
    ],
  };
  
  const activeConfig = config || defaultConfig;
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => configToFlow(activeConfig),
    [activeConfig]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f9fafb' }}>
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 4, 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        maxWidth: '320px',
        border: '1px solid #e5e7eb',
      }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
          3-Tier Infrastructure
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#2563eb' }}></div>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Presentation: Client interfaces</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#ea580c' }}></div>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Application: Business logic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#9333ea' }}></div>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Data: Storage layer</span>
          </div>
        </div>
        
        <div style={{ 
          paddingTop: '12px', 
          borderTop: '1px solid #e5e7eb',
          marginBottom: '12px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
            Health Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon icon="mdi:check" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Healthy - Operating normally</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon icon="mdi:alert" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Warning - Degraded performance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon icon="mdi:close" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Unhealthy - Service down</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                background: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon icon="mdi:help" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Unknown - Status unavailable</span>
            </div>
          </div>
        </div>
        
        <div style={{ 
          paddingTop: '12px', 
          borderTop: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#9ca3af',
        }}>
          Latency values for same-region deployment
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
        }}
      >
        <Controls 
          style={{
            button: {
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }
          }}
        />
        <Background 
          variant="dots" 
          gap={16} 
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>
    </div>
  );
}