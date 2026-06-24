import { Handle, Position } from '@xyflow/react';
import { Icon } from '@iconify/react';
import { HEALTH_STATUS_COLORS, FLOWGRAPH_DEFAULTS } from '@/constants/colors';
import { NODE_SIZES } from '@/constants/spacing';

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
  isSelected?: boolean;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

/**
 * Custom Node Component for FlowGraph
 */
export const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const health = HEALTH_STATUS_COLORS[data.health || 'healthy'];
  const isSelected = data.isSelected || false;

  return (
    <div
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-950 border-2 border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-200 dark:shadow-blue-900'
          : 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:shadow-lg'
      }`}
      style={{
        borderRadius: '12px',
        padding: '16px 20px',
        minWidth: '180px',
        boxShadow: isSelected ? undefined : '0 2px 8px rgba(0,0,0,0.08)', // subtle lift
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
            background: FLOWGRAPH_DEFAULTS.handleColor,
            width: `${NODE_SIZES.HANDLE_SIZE}px`,
            height: `${NODE_SIZES.HANDLE_SIZE}px`,
            border: `${NODE_SIZES.HANDLE_BORDER}px solid white`,
            left: '-5px',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {data.icon && (
          <div
            style={{
              background: data.iconBg || FLOWGRAPH_DEFAULTS.iconBg,
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
            }}
          >
            <Icon icon={data.icon} width={NODE_SIZES.ICON_DIMENSION} height={NODE_SIZES.ICON_DIMENSION} style={{ color: data.iconColor || FLOWGRAPH_DEFAULTS.iconColor }} />
          </div>
        )}

        <div style={{ flex: 1, paddingRight: '80px' }}>
          {data.label && (
            <div
              style={{
                fontSize: '11px',
                color: FLOWGRAPH_DEFAULTS.iconColor,
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
            background: FLOWGRAPH_DEFAULTS.handleColor,
            width: `${NODE_SIZES.HANDLE_SIZE}px`,
            height: `${NODE_SIZES.HANDLE_SIZE}px`,
            border: `${NODE_SIZES.HANDLE_BORDER}px solid white`,
            right: '-5px',
          }}
        />
      )}
    </div>
  );
};
