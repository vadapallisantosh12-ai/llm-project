import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  FolderOpen,
  Search,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Bot,
  Bug,
  GitPullRequest,
  TerminalSquare,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { Project, ProjectCreatePayload, PageView } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { apiClient } from '../api/client';

interface ProjectsPageProps {
  projects: Project[];
  loading: boolean;
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNavigate: (page: PageView) => void;
  onRefresh: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNavigate,
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

  // Modal deletion confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [indexingId, setIndexingId] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

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
      const created = await apiClient.createProject({
        name: formData.name.trim(),
        root_path: formData.root_path.trim(),
        description: formData.description?.trim(),
      });
      setSuccessMsg(`Project "${formData.name}" registered successfully. You can now index its files and use engineering tools!`);
      setFormData({ name: '', root_path: '', description: '' });
      setShowModal(false);
      onSelectProject(created.id);
      onRefresh();
    } catch (err: unknown) {
      const error = err as Error & { apiError?: { error?: { message?: string; details?: Record<string, unknown> } } };
      const message = error.apiError?.error?.message || error.message || 'Failed to register project';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.deleteProject(deleteTarget.id);
      setSuccessMsg(`Project "${deleteTarget.name}" removed from registry.`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      setErrorMsg(`Failed to remove project: ${(err as Error).message}`);
      setDeleteTarget(null);
    }
  };

  const handleIndexProject = async (id: string, name: string) => {
    try {
      setIndexingId(id);
      await apiClient.triggerIndexing(id);
      setSuccessMsg(`Indexing completed for "${name}". Search chunks and AST symbols are now available for AI tools.`);
      onRefresh();
    } catch (err) {
      setErrorMsg(`Indexing failed: ${(err as Error).message}`);
    } finally {
      setIndexingId(null);
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
            Register existing software repositories to index symbols, ask questions, debug errors, and review safe patches.
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
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'none', border: 'none', color: '#3fb950', cursor: 'pointer', fontSize: '14px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Explainer: What happens when you register a project? */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(31, 111, 235, 0.1) 0%, rgba(22, 27, 34, 1) 100%)',
          borderLeft: '4px solid #1f6feb',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ color: '#58a6ff', marginTop: '2px' }}>
            <Info size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              How DevAgent Works With Registered Projects
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
              Registering a project defines a **secure workspace boundary** on your local machine. DevAgent AI uses this to parse code symbols, guarantee that proposed file edits never escape your project root, and run tests in isolated sandboxes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7ee787' }}>
                <Check size={14} />
                <span>1. Click <b>Index</b> to chunk functions &amp; symbols</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#58a6ff' }}>
                <Check size={14} />
                <span>2. Ask questions in <b>AI Assistant</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a371f7' }}>
                <Check size={14} />
                <span>3. Debug tracebacks &amp; review <b>Patches</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Stats Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '16px',
          flexWrap: 'wrap',
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
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
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
                <th>Active</th>
                <th>Project Name</th>
                <th>Root Path (Windows)</th>
                <th>Indexing Status</th>
                <th>Files</th>
                <th>Chunks</th>
                <th style={{ textAlign: 'right' }}>Actions &amp; Tools</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proj) => {
                const isSelected = activeProject?.id === proj.id;
                return (
                  <tr
                    key={proj.id}
                    style={{
                      backgroundColor: isSelected ? 'rgba(56, 139, 253, 0.06)' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectProject(proj.id)}
                  >
                    <td style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="radio"
                        name="active_project"
                        checked={isSelected}
                        onChange={() => onSelectProject(proj.id)}
                        title="Set as active workspace"
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{proj.name}</span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: '#1f6feb',
                              color: '#fff',
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StatusBadge status={proj.indexing_status} />
                        {proj.indexing_status !== 'indexed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIndexProject(proj.id, proj.name);
                            }}
                            disabled={indexingId === proj.id}
                            className="btn btn-secondary"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            title="Index code symbols for AI retrieval"
                          >
                            <RefreshCw size={10} className={indexingId === proj.id ? 'animate-spin' : ''} />
                            <span>{indexingId === proj.id ? 'Indexing...' : 'Index'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{proj.file_count}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{proj.chunk_count}</td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            onSelectProject(proj.id);
                            onNavigate('assistant');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Open AI Assistant with this project context"
                        >
                          <Bot size={13} color="#a371f7" />
                          <span>Chat</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectProject(proj.id);
                            onNavigate('debugger');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Investigate errors with this project context"
                        >
                          <Bug size={13} color="#f85149" />
                          <span>Debug</span>
                        </button>

                        <button
                          onClick={() => setDeleteTarget(proj)}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          title="Unregister project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Center for Selected Active Project */}
      {activeProject && (
        <div className="card" style={{ borderTop: '3px solid #58a6ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Selected Active Workspace
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeProject.name}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {activeProject.root_path} • {activeProject.file_count} files • {activeProject.chunk_count} chunks
              </p>
            </div>

            {activeProject.indexing_status !== 'indexed' ? (
              <button
                onClick={() => handleIndexProject(activeProject.id, activeProject.name)}
                disabled={indexingId === activeProject.id}
                className="btn btn-primary"
              >
                <RefreshCw size={14} className={indexingId === activeProject.id ? 'animate-spin' : ''} />
                <span>{indexingId === activeProject.id ? 'Indexing in progress...' : 'Index Codebase Now'}</span>
              </button>
            ) : (
              <span
                style={{
                  fontSize: '12px',
                  color: '#3fb950',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={16} />
                <span>Codebase Indexed &amp; Ready</span>
              </span>
            )}
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
            What would you like to do next with this project?
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {/* Action 1: Ask Assistant */}
            <div
              onClick={() => onNavigate('assistant')}
              style={{
                padding: '14px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#a371f7')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Bot size={18} color="#a371f7" />
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Ask AI Assistant
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                Ask questions about your codebase, search symbols, and understand architecture.
              </p>
              <span style={{ fontSize: '11px', color: '#a371f7', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                Open Assistant <ArrowRight size={12} />
              </span>
            </div>

            {/* Action 2: Debug Errors */}
            <div
              onClick={() => onNavigate('debugger')}
              style={{
                padding: '14px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f85149')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Bug size={18} color="#f85149" />
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Debug Traceback
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                Paste exceptions or error logs to locate the line and receive root-cause fixes.
              </p>
              <span style={{ fontSize: '11px', color: '#f85149', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                Open Debugger <ArrowRight size={12} />
              </span>
            </div>

            {/* Action 3: Review Patches */}
            <div
              onClick={() => onNavigate('patches')}
              style={{
                padding: '14px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#388bfd')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <GitPullRequest size={18} color="#58a6ff" />
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Review Patches
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                Inspect proposed unified line diffs with hash checks before applying to disk.
              </p>
              <span style={{ fontSize: '11px', color: '#58a6ff', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                Inspect Diffs <ArrowRight size={12} />
              </span>
            </div>

            {/* Action 4: Run Tests */}
            <div
              onClick={() => onNavigate('tests')}
              style={{
                padding: '14px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3fb950')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={18} color="#3fb950" />
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Test Center
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                Run unit and security traversal tests with 30-second timeout sandboxing.
              </p>
              <span style={{ fontSize: '11px', color: '#3fb950', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                Run Tests <ArrowRight size={12} />
              </span>
            </div>

            {/* Action 5: Autonomous Dev Agent */}
            <div
              onClick={() => onNavigate('agent')}
              style={{
                padding: '14px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d29922')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <TerminalSquare size={18} color="#d29922" />
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                  Autonomous Agent
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                Assign complex multi-step workflows with human approval gates.
              </p>
              <span style={{ fontSize: '11px', color: '#d29922', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                Launch Agent <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      )}

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

      {/* Confirm Unregister Dialog */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Unregister Project"
        message={`Are you sure you want to unregister "${deleteTarget?.name}" from DevAgent AI? Your source files on disk will NOT be deleted.`}
        confirmLabel="Unregister"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
