import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react';

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
    label,
    labelStyle,
    labelBgStyle,
    labelBgPadding,
    data,
  } = props;

  // Use smooth step path for L-shaped lines
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
      {label && label !== '-' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: labelStyle?.fontSize || 11,
              fontWeight: labelStyle?.fontWeight || 600,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                background: labelBgStyle?.fill || 'white',
                opacity: labelBgStyle?.fillOpacity || 0.9,
                padding: '4px 8px',
                borderRadius: '4px',
                color: labelStyle?.fill || '#475569',
              }}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
