import { useMemo, useState, useEffect } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState, BackgroundVariant } from '@xyflow/react';
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
  onNodeClick?: (nodeId: string, nodeData: any) => void;
}

export default function ThreeTierInfrastructure({ config, onNodeClick }: FlowGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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

  const handleNodeClick = (_event: React.MouseEvent, node: any) => {
    if (node.type === 'custom') {
      setSelectedNodeId(node.id);
      if (onNodeClick) {
        // Find the original service data from the config
        const serviceData = activeConfig.services.find((s: any) => s.serviceId === node.id);
        onNodeClick(node.id, serviceData);
      }
    }
  };

  // Update nodes when selectedNodeId changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === selectedNodeId,
        },
      }))
    );
  }, [selectedNodeId, setNodes]);

  return (
    <div className="relative bg-gray-50 dark:bg-neutral-950" style={{ width: '100%', height: '65vh', minHeight: '500px', maxHeight: '700px' }}>
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
        className="absolute top-5 right-5 z-[4] bg-white dark:bg-neutral-800 p-5 rounded-xl shadow-lg max-w-[320px] border border-gray-200 dark:border-neutral-700"
      >
        <div className="mb-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Health Status
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                <Icon icon="mdi:check" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Healthy - Operating normally</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                <Icon icon="mdi:alert" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Warning - Degraded performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <Icon icon="mdi:close" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Unhealthy - Service down</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
                <Icon icon="mdi:help" width="12" height="12" style={{ color: 'white' }} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Unknown - Status unavailable</span>
            </div>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1.3 }}
        //minZoom={0.5}
        //maxZoom={2.5}
        attributionPosition="bottom-left"
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={true}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          className="bg-gray-50 dark:bg-neutral-950"
        />
      </ReactFlow>
    </div>
  );
}
