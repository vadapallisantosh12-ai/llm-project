import React from 'react';
import {
  FolderGit2,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { HealthData, Project, PageView } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';

interface DashboardPageProps {
  health: HealthData | null;
  projects: Project[];
  loading: boolean;
  onNavigate: (page: PageView) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  health,
  projects,
  onNavigate,
}) => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #161b22 0%, #1c2128 100%)',
          borderLeft: '4px solid #388bfd',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>
              Welcome to DevAgent AI
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '700px' }}>
              An intelligent, controlled software engineering assistant running natively on Windows without Docker.
              DevAgent AI analyzes your real codebase, retrieves context, proposes reviewable patches, and safely executes verified tests.
            </p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="btn btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <FolderGit2 size={16} />
            <span>Manage Projects</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Backend Metric */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Backend Status</span>
            <Server size={18} color="#58a6ff" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 600 }}>
              {health?.app_name || 'DevAgent'}
            </span>
            <StatusBadge status={health?.status || 'connecting'} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            v{health?.version || '0.1.0'} • Env: {health?.environment || 'development'}
          </div>
        </div>

        {/* Database Metric */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Database</span>
            <Database size={18} color="#3fb950" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 600 }}>SQLite</span>
            <StatusBadge status={health?.database || 'disconnected'} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Isolated in <code style={{ color: '#58a6ff' }}>./app_data/database</code>
          </div>
        </div>

        {/* LLM Provider */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>AI Provider</span>
            <Cpu size={18} color="#a371f7" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: 600, textTransform: 'capitalize' }}>
              {health?.active_llm_provider || 'Mock'}
            </span>
            <StatusBadge status="Ready" type="info" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Ollama / Hosted configurable via <code style={{ color: '#58a6ff' }}>.env</code>
          </div>
        </div>

        {/* Registered Projects */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Active Projects</span>
            <FolderGit2 size={18} color="#d29922" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600 }}>{projects.length}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>registered</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Canonical Windows paths enforced
          </div>
        </div>
      </div>

      {/* Grid: Diagnostics & Recent Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Environment Diagnostics */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#3fb950" />
            <span>Windows Development Environment</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Operating System:</span>
              <span>{health?.system_info.os || 'Windows'} ({health?.system_info.platform || 'win32'})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Python Runtime:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>Python {health?.system_info.python_version || '3.14.3'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Docker Dependency:</span>
              <span style={{ color: '#3fb950', fontWeight: 500 }}>Zero Docker Requirement (Native)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Filesystem Security:</span>
              <span style={{ color: '#58a6ff' }}>Canonical Resolve &amp; Traversal Guard</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Execution Sandbox:</span>
              <span>Controlled Allowlist Policy</span>
            </div>
          </div>
        </div>

        {/* Registered Projects List Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#58a6ff" />
              <span>Registered Projects</span>
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              View All
            </button>
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              <FolderGit2 size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>No projects registered yet.</p>
              <button
                onClick={() => onNavigate('projects')}
                className="btn btn-primary"
                style={{ marginTop: '12px' }}
              >
                Register Your First Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{p.name}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.root_path}
                    </div>
                  </div>
                  <StatusBadge status={p.indexing_status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
