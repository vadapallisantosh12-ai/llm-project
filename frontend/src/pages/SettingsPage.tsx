import React from 'react';
import { Cpu, Shield, Database } from 'lucide-react';
import { HealthData } from '../types/api';

interface SettingsPageProps {
  health: HealthData | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ health }) => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>System Configuration &amp; Policies</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Inspect active environment settings, LLM provider integration, and execution security limits.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* LLM Provider Card */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="#a371f7" />
            <span>AI Model &amp; Provider Settings</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            DevAgent AI uses a provider-agnostic engine supporting local models (Ollama) and optional hosted models.
            Configured in <code style={{ color: '#58a6ff' }}>.env</code>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Active Provider</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {health?.active_llm_provider || 'Mock Provider'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Ollama Local Host</div>
              <div style={{ fontFamily: 'var(--font-mono)' }}>http://127.0.0.1:11434</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Recommended Local Model</div>
              <div style={{ fontFamily: 'var(--font-mono)' }}>qwen2.5-coder:7b</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Hosted Provider API Key</div>
              <div style={{ color: 'var(--text-muted)' }}>Masked / Never Exposed via API</div>
            </div>
          </div>
        </div>

        {/* Security & Sandbox Policy */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="#3fb950" />
            <span>Filesystem &amp; Execution Security Guard</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Path Traversal Protection:</span>
              <span style={{ color: '#3fb950', fontWeight: 500 }}>Active (Canonical Resolve Enforced)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Execution Timeout Limit:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>30 Seconds</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Maximum File Read Size:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>1 MB (1,048,576 bytes)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Docker Requirement:</span>
              <span style={{ color: '#3fb950' }}>None (Direct Windows Subprocess with Policy Controls)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Default Excluded Folders:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>.git, .venv, node_modules, build, dist</span>
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="#58a6ff" />
            <span>Storage &amp; Application Data Isolation</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            All DevAgent AI databases, audit logs, and temporary caches are stored in an isolated data directory:
          </p>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#58a6ff',
            }}
          >
            ./app_data/database/devagent.db
          </div>
        </div>
      </div>
    </div>
  );
};
