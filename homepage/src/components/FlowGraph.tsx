import { useMemo } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@iconify/react';
import { CustomEdge } from './flowgraph/CustomEdge';
import { CustomNode } from './flowgraph/CustomNode';
import { TierLabel } from './flowgraph/TierLabel';
import { configToFlow } from '@/lib/flowGraphUtils';

const nodeTypes = {
  custom: CustomNode,
  tierLabel: TierLabel,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface FlowGraphProps {
  config?: any;
}

export default function ThreeTierInfrastructure({ config }: FlowGraphProps) {
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
      <style>{`
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -16;
          }
        }
        .react-flow__edge-path {
          animation: dashdraw 0.5s linear infinite;
        }
      `}</style>
      <div
        style={{
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
        }}
      >
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

        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid #e5e7eb',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
            Health Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon="mdi:check" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Healthy - Operating normally</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon="mdi:alert" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Warning - Degraded performance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon="mdi:close" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Unhealthy - Service down</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon="mdi:help" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Unknown - Status unavailable</span>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          Latency values for same-region deployment
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'smart',
          animated: true,
        }}
      >
        <Controls
          style={{
            button: {
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            },
          }}
        />
        <Background variant="dots" gap={16} size={1} color="#e5e7eb" />
      </ReactFlow>
    </div>
  );
}
