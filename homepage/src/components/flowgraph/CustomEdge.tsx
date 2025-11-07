import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, Node } from '@xyflow/react';
import { getSmartEdge } from '@tisoap/react-flow-smart-edge';

/**
 * Custom Edge Component with smart routing that avoids nodes
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

  // Try to get smart edge path that avoids nodes
  const smartEdgeResult = getSmartEdge({
    sourcePosition,
    targetPosition,
    sourceX,
    sourceY,
    targetX,
    targetY,
    nodes: (data?.nodes as Node[]) || [],
  });

  // Fallback to bezier path if smart edge fails
  let edgePath, labelX, labelY;

  if (smartEdgeResult && 'svgPathString' in smartEdgeResult) {
    edgePath = smartEdgeResult.svgPathString;
    labelX = (sourceX + targetX) / 2;
    labelY = (sourceY + targetY) / 2;
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

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
