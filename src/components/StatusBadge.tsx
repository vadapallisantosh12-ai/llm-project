import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  let color = '#8b949e';
  let bg = '#21262d';
  let border = '#30363d';

  const s = status.toLowerCase();
  const resolvedType =
    type ||
    (s === 'healthy' || s === 'connected' || s === 'indexed' || s === 'active'
      ? 'success'
      : s === 'indexing' || s === 'degraded'
      ? 'warning'
      : s === 'unhealthy' || s === 'disconnected' || s === 'failed'
      ? 'danger'
      : 'neutral');

  if (resolvedType === 'success') {
    color = '#3fb950';
    bg = 'rgba(46, 160, 67, 0.15)';
    border = 'rgba(46, 160, 67, 0.4)';
  } else if (resolvedType === 'warning') {
    color = '#d29922';
    bg = 'rgba(210, 153, 34, 0.15)';
    border = 'rgba(210, 153, 34, 0.4)';
  } else if (resolvedType === 'danger') {
    color = '#f85149';
    bg = 'rgba(248, 81, 73, 0.15)';
    border = 'rgba(248, 81, 73, 0.4)';
  } else if (resolvedType === 'info') {
    color = '#58a6ff';
    bg = 'rgba(56, 139, 253, 0.15)';
    border = 'rgba(56, 139, 253, 0.4)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        textTransform: 'capitalize',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      {status}
    </span>
  );
};
