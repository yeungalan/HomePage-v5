import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { FLOWGRAPH_DEFAULTS } from '@/constants/colors';
import { EDGE_STYLES } from '@/constants/spacing';

export const CustomEdge: React.FC<EdgeProps> = (props) => {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: EDGE_STYLES.BORDER_RADIUS,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        strokeWidth: style?.strokeWidth || EDGE_STYLES.STROKE_WIDTH,
        stroke: style?.stroke || FLOWGRAPH_DEFAULTS.edgeStroke,
        strokeDasharray: style?.strokeDasharray || EDGE_STYLES.DASH_ARRAY,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...style,
      }}
    />
  );
};
