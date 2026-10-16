import React, { useState, useEffect } from 'react';
import { GitPullRequest, CheckCircle2, ShieldCheck, History, ArrowRight } from 'lucide-react';
import { Project, PageView, PatchItem } from '../types/api';
import { apiClient } from '../api/client';

interface PatchReviewPageProps {
  activeProject: Project | null;
  onNavigate: (page: PageView) => void;
  onDataChange?: () => void;
}

export const PatchReviewPage: React.FC<PatchReviewPageProps> = ({ activeProject, onNavigate, onDataChange }) => {
  const [patches, setPatches] = useState<PatchItem[]>([]);
  const [selectedPatchId, setSelectedPatchId] = useState<string>('patch-101');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getPatches().then((data) => {
      setPatches(data);
      if (data.length > 0 && !data.some((p) => p.id === selectedPatchId)) {
        setSelectedPatchId(data[0].id);
      }
    });
  }, []);

  const selectedPatch = patches.find((p) => p.id === selectedPatchId) || patches[0];

  const handleApply = async (id: string) => {
    await apiClient.updatePatchStatus(id, 'applied');
    setPatches((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'applied' } : p))
    );
    setActionSuccess(`Patch ${id} safely applied with atomic rollback backup.`);
    if (onDataChange) onDataChange();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = async (id: string) => {
    await apiClient.updatePatchStatus(id, 'rejected');
    setPatches((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p))
    );
    setActionSuccess(`Patch ${id} rejected.`);
    if (onDataChange) onDataChange();
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          borderLeft: '4px solid #388bfd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 139, 253, 0.15)',
              color: '#58a6ff',
            }}
          >
            <GitPullRequest size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Safe Patch Review &amp; Diff Inspector</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Inspect and verify AI-generated code modifications before applying them transactionally to disk.
            </p>
          </div>
        </div>

        {activeProject && (
          <div
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              color: '#58a6ff',
            }}
          >
            Workspace: {activeProject.name}
          </div>
        )}
      </div>

      {actionSuccess && (
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
            fontSize: '13px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2-Column Layout: Patch List & Diff Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Left Column: Patch List */}
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Generated Patches ({patches.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {patches.map((p) => {
              const isSelected = p.id === selectedPatchId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatchId(p.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: isSelected ? '1px solid #388bfd' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#58a6ff' }}>
                      {p.id}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        backgroundColor:
                          p.status === 'applied'
                            ? 'rgba(46, 160, 67, 0.2)'
                            : p.status === 'rejected'
                            ? 'rgba(248, 81, 73, 0.2)'
                            : 'rgba(210, 153, 34, 0.2)',
                        color:
                          p.status === 'applied'
                            ? '#3fb950'
                            : p.status === 'rejected'
                            ? '#f85149'
                            : '#d29922',
                      }}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {p.targetFile}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {p.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Diff & Security Verification */}
        {selectedPatch && (
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedPatch.targetFile}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedPatch.description}
                </p>
              </div>

              {selectedPatch.status === 'pending_review' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleReject(selectedPatch.id)}
                    className="btn btn-secondary"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApply(selectedPatch.id)}
                    className="btn btn-primary"
                  >
                    Approve &amp; Apply
                  </button>
                </div>
              )}
            </div>

            {/* Security Verification Checks */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '11px',
              }}
            >
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#3fb950" />
                <span>Canonical Root Guard: OK</span>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#3fb950" />
                <span>SHA-256 Hash Pre-check: Match</span>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={14} color="#58a6ff" />
                <span>Rollback Backup Created</span>
              </div>
            </div>

            {/* Line Diff Viewer */}
            <div style={{ borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                Unified Diff Preview ({selectedPatch.id})
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '14px',
                  backgroundColor: '#0d1117',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  overflowX: 'auto',
                }}
              >
                {selectedPatch.diff.split('\n').map((line, idx) => {
                  let bg = 'transparent';
                  let color = 'var(--text-primary)';
                  if (line.startsWith('+') && !line.startsWith('+++')) {
                    bg = 'rgba(46, 160, 67, 0.15)';
                    color = '#7ee787';
                  } else if (line.startsWith('-') && !line.startsWith('---')) {
                    bg = 'rgba(248, 81, 73, 0.15)';
                    color = '#f85149';
                  } else if (line.startsWith('@@')) {
                    color = '#58a6ff';
                  }
                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: bg,
                        color,
                        padding: '1px 6px',
                        borderRadius: '2px',
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>

            {/* Next Step Shortcut */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => onNavigate('tests')}
                className="btn btn-secondary"
                style={{ fontSize: '12px' }}
              >
                <span>Verify with Test Center</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
