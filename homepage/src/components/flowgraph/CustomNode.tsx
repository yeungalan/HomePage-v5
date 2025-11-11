import { Handle, Position } from '@xyflow/react';
import { Icon } from '@iconify/react';
import { HEALTH_STATUS_COLORS } from '@/constants/colors';

interface CustomNodeData {
  label?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  health?: 'healthy' | 'unhealthy' | 'warning' | 'unknown';
  hasIncomingEdge?: boolean;
  hasOutgoingEdge?: boolean;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

/**
 * Custom Node Component for FlowGraph
 */
export const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const health = HEALTH_STATUS_COLORS[data.health || 'healthy'];

  return (
    <div
      className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 cursor-pointer hover:shadow-lg transition-shadow"
      style={{
        borderRadius: '12px',
        padding: '16px 20px',
        minWidth: '180px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Health Status Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: health.bg,
          padding: '4px 8px',
          borderRadius: '12px',
        }}
      >
        <Icon icon={health.icon} width="14" height="14" style={{ color: health.color }} />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: health.color,
            textTransform: 'capitalize',
          }}
        >
          {data.health || 'healthy'}
        </span>
      </div>

      {data.hasIncomingEdge && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#6b7280',
            width: '8px',
            height: '8px',
            border: '2px solid white',
            left: '-5px',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {data.icon && (
          <div
            style={{
              background: data.iconBg || '#f3f4f6',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
            }}
          >
            <Icon icon={data.icon} width="24" height="24" style={{ color: data.iconColor || '#6b7280' }} />
          </div>
        )}

        <div style={{ flex: 1, paddingRight: '80px' }}>
          {data.label && (
            <div
              style={{
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '4px',
                fontWeight: 500,
              }}
            >
              {data.label}
            </div>
          )}
          <div
            className="text-gray-900 dark:text-gray-100"
            style={{
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {data.title}
          </div>
          {data.subtitle && (
            <div
              className="text-gray-400 dark:text-gray-500"
              style={{
                fontSize: '12px',
                marginTop: '2px',
              }}
            >
              {data.subtitle}
            </div>
          )}
        </div>
      </div>

      {data.hasOutgoingEdge && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: '#6b7280',
            width: '8px',
            height: '8px',
            border: '2px solid white',
            right: '-5px',
          }}
        />
      )}
    </div>
  );
};
