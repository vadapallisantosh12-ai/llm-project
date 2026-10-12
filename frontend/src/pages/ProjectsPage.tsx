import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  FolderOpen,
  Search,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Project, ProjectCreatePayload } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';

interface ProjectsPageProps {
  projects: Project[];
  loading: boolean;
  onRefresh: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProjectCreatePayload>({
    name: '',
    root_path: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.name.trim() || !formData.root_path.trim()) {
      setErrorMsg('Project name and directory path are required.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createProject({
        name: formData.name.trim(),
        root_path: formData.root_path.trim(),
        description: formData.description?.trim(),
      });
      setSuccessMsg(`Project "${formData.name}" registered successfully.`);
      setFormData({ name: '', root_path: '', description: '' });
      setShowModal(false);
      onRefresh();
    } catch (err: unknown) {
      const error = err as Error & { apiError?: { error?: { message?: string; details?: Record<string, unknown> } } };
      const message = error.apiError?.error?.message || error.message || 'Failed to register project';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to unregister "${name}" from DevAgent AI? (Your files on disk will NOT be deleted).`)) {
      return;
    }

    try {
      await apiClient.deleteProject(id);
      onRefresh();
    } catch (err) {
      alert(`Failed to remove project: ${(err as Error).message}`);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.root_path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Project Workspace Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Register existing software projects to enable indexing, codebase Q&amp;A, debugging, and patch review.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Register Project</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(46, 160, 67, 0.15)',
            border: '1px solid #3fb950',
            borderRadius: '6px',
            marginBottom: '16px',
            color: '#3fb950',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Stats Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '16px',
        }}
      >
        <div style={{ position: 'relative', width: '320px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search projects by name or path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '32px' }}
          />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing {filtered.length} of {projects.length} project(s)
        </span>
      </div>

      {/* Projects Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FolderOpen size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>
              {searchTerm ? 'No projects match your search.' : 'No projects registered yet.'}
            </p>
            <p style={{ fontSize: '13px', marginBottom: '16px' }}>
              Register a local repository to start analyzing and modifying code.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-secondary"
            >
              <Plus size={14} />
              <span>Register a Project</span>
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Root Path (Windows)</th>
                <th>Indexing</th>
                <th>Files</th>
                <th>Chunks</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proj) => (
                <tr key={proj.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{proj.name}</div>
                    {proj.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {proj.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <code
                      style={{
                        fontSize: '12px',
                        color: '#58a6ff',
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {proj.root_path}
                    </code>
                  </td>
                  <td>
                    <StatusBadge status={proj.indexing_status} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{proj.file_count}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{proj.chunk_count}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(proj.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(proj.id, proj.name)}
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      title="Unregister project"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            className="card"
            style={{
              width: '520px',
              maxWidth: '90vw',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Register Local Project</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(248, 81, 73, 0.15)',
                  border: '1px solid #f85149',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  color: '#f85149',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Project Name <span style={{ color: '#f85149' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. My Web App"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Project Directory Path (Windows) <span style={{ color: '#f85149' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. C:\projects\my-app or relative path"
                  value={formData.root_path}
                  onChange={(e) => setFormData({ ...formData, root_path: e.target.value })}
                  required
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Must be an existing local directory. Path will be canonically resolved.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Brief note about the project tech stack or purpose"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Validating...' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
