import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

/**
 * Custom Edge Component with L-shaped routing
 */
export const CustomEdge: React.FC<EdgeProps> = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
  } = props;

  // Use smooth step path for L-shaped lines
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        strokeWidth: style?.strokeWidth || 2,
        stroke: style?.stroke || '#94a3b8',
        strokeDasharray: style?.strokeDasharray || '8,8',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...style,
      }}
    />
  );
};
