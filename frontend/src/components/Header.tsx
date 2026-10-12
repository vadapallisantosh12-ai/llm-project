import React from 'react';
import { RefreshCw, Server, Database, Cpu } from 'lucide-react';
import { HealthData } from '../types/api';
import { StatusBadge } from './StatusBadge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  health: HealthData | null;
  loading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  health,
  loading,
  onRefresh,
}) => {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {health ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} color="#8b949e" />
              <span>Backend:</span>
              <StatusBadge status={health.status} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} color="#8b949e" />
              <span>SQLite:</span>
              <StatusBadge status={health.database} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} color="#8b949e" />
              <span>LLM:</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '2px 6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  color: '#a371f7',
                }}
              >
                {health.active_llm_provider}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={14} color="#f85149" />
            <StatusBadge status="Disconnected" type="danger" />
          </div>
        )}

        <button
          onClick={onRefresh}
          className="btn btn-secondary"
          title="Refresh Backend Health & State"
          disabled={loading}
          style={{ padding: '6px 10px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
};
