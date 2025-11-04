interface TierLabelData {
  label: string;
}

interface TierLabelProps {
  data: TierLabelData;
}

/**
 * Tier Label Node Component
 */
export const TierLabel: React.FC<TierLabelProps> = ({ data }) => {
  return (
    <div
      style={{
        background: 'transparent',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        textAlign: 'center',
      }}
    >
      {data.label}
    </div>
  );
};
