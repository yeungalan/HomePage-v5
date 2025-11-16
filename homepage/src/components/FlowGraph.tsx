import { useMemo, useState, useEffect } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState, BackgroundVariant, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Icon } from '@iconify/react';
import { CustomEdge } from './flowgraph/CustomEdge';
import { CustomNode } from './flowgraph/CustomNode';
import { TierLabel } from './flowgraph/TierLabel';
import { configToFlow, type FlowGraphConfig, type Service } from '@/lib/flowGraphUtils';

interface FlowGraphProps {
  config?: FlowGraphConfig;
  onNodeClick?: (nodeId: string, nodeData: Service) => void;
}

const nodeTypes = {
  custom: CustomNode,
  tierLabel: TierLabel,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function ThreeTierInfrastructure({ config, onNodeClick }: FlowGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Default configuration if none provided
  const defaultConfig: FlowGraphConfig = {
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

  const handleNodeClick = (_event: React.MouseEvent, node: Node): void => {
    if (node.type === 'custom') {
      setSelectedNodeId(node.id);
      if (onNodeClick) {
        // Find the original service data from the config
        const serviceData = activeConfig.services.find((s) => s.serviceId === node.id);
        if (serviceData) {
          onNodeClick(node.id, serviceData);
        }
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
    <div className="relative bg-gray-50 dark:bg-neutral-950" style={{ width: '100%', height: '75vh', minHeight: '500px', maxHeight: '900px' }}>
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultViewport={{ x: -10, y: -5, zoom: 1.2 }}
        minZoom={0.5}
        maxZoom={2.5}
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
