import React, { useState, useEffect } from 'react';
import { Cpu, Shield, Database, CheckCircle2 } from 'lucide-react';
import { HealthData, AppSettings } from '../types/api';
import { apiClient } from '../api/client';

interface SettingsPageProps {
  health: HealthData | null;
  onRefreshHealth: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ health, onRefreshHealth }) => {
  const [settings, setSettings] = useState<AppSettings>({
    active_llm_provider: 'ollama',
    ollama_base_url: 'http://127.0.0.1:11434',
    ollama_default_model: 'qwen2.5-coder:7b',
    command_timeout_seconds: 30,
    max_file_size_mb: 1,
    db_status: 'connected',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    apiClient.getSettings().then((s) => {
      setSettings(s);
    });
  }, []);

  const handleProviderChange = async (provider: 'ollama' | 'hosted' | 'mock') => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await apiClient.updateSettings({ active_llm_provider: provider });
      setSettings(updated);
      setSaveSuccess(true);
      onRefreshHealth();
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleModelChange = async (model: string) => {
    setSaving(true);
    try {
      const updated = await apiClient.updateSettings({ ollama_default_model: model });
      setSettings(updated);
      setSaveSuccess(true);
      onRefreshHealth();
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>System Configuration &amp; Policies</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Inspect active environment settings, LLM provider integration, and execution security limits.
          </p>
        </div>
        {saveSuccess && (
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(46, 160, 67, 0.15)',
              border: '1px solid #3fb950',
              borderRadius: '6px',
              color: '#3fb950',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={14} />
            <span>Settings saved successfully</span>
          </div>
        )}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '13px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Active Provider Selection</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['ollama', 'hosted', 'mock'] as const).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => handleProviderChange(prov)}
                    disabled={saving}
                    className="btn"
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      backgroundColor: settings.active_llm_provider === prov ? '#1f6feb' : 'var(--bg-accent)',
                      color: '#fff',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>Ollama Local Host</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#58a6ff' }}>
                {settings.ollama_base_url}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Port 11434 on 127.0.0.1
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>Ollama Model</div>
              <select
                value={settings.ollama_default_model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="input-field"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <option value="qwen2.5-coder:7b">qwen2.5-coder:7b (Recommended)</option>
                <option value="deepseek-coder-v2:16b">deepseek-coder-v2:16b</option>
                <option value="llama3.1:8b">llama3.1:8b</option>
                <option value="mistral-nemo:12b">mistral-nemo:12b</option>
              </select>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Hosted Provider API Key</div>
              <div style={{ color: 'var(--text-muted)' }}>Masked / Never Exposed via API</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Zero credentials leaked to frontend
              </div>
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
              <span style={{ fontFamily: 'var(--font-mono)' }}>{settings.command_timeout_seconds} Seconds</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-muted)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Maximum File Read Size:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{settings.max_file_size_mb} MB (1,048,576 bytes)</span>
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>./app_data/database/devagent.db</span>
            <span style={{ color: health?.database === 'connected' ? '#3fb950' : '#f85149' }}>
              ● {health?.database === 'connected' ? 'Connected (SQLite 3.x)' : 'Disconnected'}
            </span>
          </div>
          {health?.system_info && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Host: {health.system_info.platform} • Python: {health.system_info.python_version}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
