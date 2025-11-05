import { getSmoothStepPath, Position, type EdgeProps } from '@xyflow/react';
import type { CSSProperties } from 'react';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: CSSProperties;
  label?: string;
  labelStyle?: CSSProperties;
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

  const strokeWidth = typeof style?.strokeWidth === 'number' ? style.strokeWidth : 2;
  const stroke = typeof style?.stroke === 'string' ? style.stroke : '#94a3b8';
  const strokeDasharray = typeof style?.strokeDasharray === 'string' ? style.strokeDasharray : '8,8';

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
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
              fontSize: 11,
              fontWeight: 600,
              fill: '#475569',
              ...labelStyle,
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
