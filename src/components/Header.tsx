import React from 'react';
import { RefreshCw, Server, Database, Cpu, FolderGit2 } from 'lucide-react';
import { HealthData, Project } from '../types/api';
import { StatusBadge } from './StatusBadge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  health: HealthData | null;
  loading: boolean;
  projects?: Project[];
  activeProjectId?: string | null;
  onSelectProject?: (id: string) => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  health,
  loading,
  projects = [],
  activeProjectId,
  onSelectProject,
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
        gap: '16px',
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
        {/* Active Project Selector */}
        {projects.length > 0 && onSelectProject && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <FolderGit2 size={14} color="#58a6ff" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Workspace:</span>
            <select
              value={activeProjectId || ''}
              onChange={(e) => onSelectProject(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '160px',
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} style={{ backgroundColor: '#161b22', color: '#fff' }}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
                  textTransform: 'capitalize',
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
