import { getSmoothStepPath, Position } from '@xyflow/react';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: {
    strokeWidth?: number;
    stroke?: string;
    strokeDasharray?: string;
  };
  label?: string;
  labelStyle?: {
    fontSize?: number;
    fontWeight?: number;
    fill?: string;
  };
}

/**
 * Custom Edge Component with smoothstep routing
 */
export const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  label,
  labelStyle,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={style?.strokeWidth || 2}
        stroke={style?.stroke || '#94a3b8'}
        strokeDasharray={style?.strokeDasharray || '8,8'}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {label && label !== '-' && (
        <g>
          <rect
            x={labelX - 20}
            y={labelY - 10}
            width={40}
            height={20}
            fill="white"
            fillOpacity={0.9}
            rx={4}
          />
          <text
            x={labelX}
            y={labelY + 4}
            style={{
              fontSize: labelStyle?.fontSize || 11,
              fontWeight: labelStyle?.fontWeight || 600,
              fill: labelStyle?.fill || '#475569',
            }}
            textAnchor="middle"
          >
            {label}
          </text>
        </g>
      )}
    </>
  );
};
