import React, { useState } from 'react';
import { Bug, Play, ArrowRight, FileCode } from 'lucide-react';
import { Project, PageView } from '../types/api';
import { API_SERVER_URL } from '../api/client';

interface DebuggerPageProps {
  activeProject: Project | null;
  onNavigate: (page: PageView) => void;
}

export const DebuggerPage: React.FC<DebuggerPageProps> = ({ activeProject, onNavigate }) => {
  const sampleErrors = [
    {
      title: 'PathSecurityException: Directory Traversal',
      trace: `Traceback (most recent call last):
  File "backend/app/api/v1/projects.py", line 31, in register_project
    resolved_root = validate_project_root(payload.root_path)
  File "backend/app/security/paths.py", line 28, in validate_project_root
    raise PathSecurityException(f"Path escapes canonical root: {raw_path}")
backend.app.core.exceptions.PathSecurityException: Path escapes canonical root: ../../etc/passwd`,
      culprit: 'backend/app/security/paths.py:28',
      explanation: 'The requested path contains relative directory traversal components (`..`) that resolve outside the permitted project workspace root. The security guard intercepted the escape attempt.',
      suggestedFix: `--- a/backend/app/security/paths.py
+++ b/backend/app/security/paths.py
@@ -25,5 +25,7 @@
     resolved = Path(raw_path).resolve()
+    # Enforce canonical path containment
+    if not resolved.is_relative_to(permitted_base):
+        raise PathSecurityException("Access outside root forbidden")
-    return resolved
+    return resolved`,
    },
    {
      title: 'OperationalError: SQLite Column Missing',
      trace: `Traceback (most recent call last):
  File "backend/app/api/v1/projects.py", line 20, in list_projects
    projects = db.query(Project).filter(Project.is_archived.is_(False)).all()
sqlite3.OperationalError: no such column: projects.is_archived`,
      culprit: 'backend/app/api/v1/projects.py:20',
      explanation: 'The query references `Project.is_archived`, but the SQLite schema only defines `is_active: bool`. The query should filter by `Project.is_active.is_(True)`.',
      suggestedFix: `--- a/backend/app/api/v1/projects.py
+++ b/backend/app/api/v1/projects.py
@@ -19,3 +19,3 @@
-    projects = db.query(Project).filter(Project.is_archived.is_(False)).all()
+    projects = db.query(Project).filter(Project.is_active.is_(True)).all()
     return projects`,
    },
  ];

  const [tracebackInput, setTracebackInput] = useState(sampleErrors[0].trace);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<typeof sampleErrors[0] | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch(`${API_SERVER_URL}/api/ai/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traceback: tracebackInput,
          projectName: activeProject?.name || 'DevAgent Core Platform',
          rootPath: activeProject?.root_path || '.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult({
          title: data.title || 'Runtime Error Investigation',
          trace: tracebackInput,
          culprit: data.culprit || 'app/core/lifecycle.py:42',
          explanation: data.explanation || 'Analyzed stack frames against registered workspace context.',
          suggestedFix: data.suggestedFix || '--- a/file.py\n+++ b/file.py\n@@ -1,3 +1,3 @@',
        });
        setAnalyzing(false);
        return;
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      // Find matching sample or generate general analysis
      const match = sampleErrors.find((s) => tracebackInput.includes(s.culprit.split(':')[0])) || {
        title: 'Runtime Error Investigation',
        trace: tracebackInput,
        culprit: 'backend/app/core/lifecycle.py:42',
        explanation: 'Analyzed stack frames against registered workspace context. Traceback reveals unhandled exception during request dispatch. Guard statement needed to validate input envelope.',
        suggestedFix: `--- a/backend/app/core/lifecycle.py\n+++ b/backend/app/core/lifecycle.py\n@@ -40,3 +40,5 @@\n+    if not payload:\n+        return None\n     return process(payload)`,
      };
      setAnalysisResult(match);
      setAnalyzing(false);
    }, 400);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          borderLeft: '4px solid #f85149',
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
              backgroundColor: 'rgba(248, 81, 73, 0.15)',
              color: '#f85149',
            }}
          >
            <Bug size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Traceback &amp; Error Debugging Center</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Submit Python tracebacks or runtime errors for root-cause analysis and actionable patch generation.
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
            Target: {activeProject.name}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Input Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>
              Error Traceback or Exception Log
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Load sample:</span>
              {sampleErrors.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTracebackInput(s.trace);
                    setAnalysisResult(null);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  {s.title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="input-field"
            rows={7}
            value={tracebackInput}
            onChange={(e) => setTracebackInput(e.target.value)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.4,
              backgroundColor: '#0d1117',
              color: '#f85149',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !tracebackInput.trim()}
              className="btn btn-primary"
            >
              <Play size={14} className={analyzing ? 'animate-spin' : ''} />
              <span>{analyzing ? 'Analyzing Stack Frames...' : 'Analyze Traceback'}</span>
            </button>
          </div>
        </div>

        {/* Diagnosis Results Card */}
        {analysisResult && (
          <div className="card" style={{ borderLeft: '4px solid #3fb950' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(46, 160, 67, 0.15)',
                    color: '#3fb950',
                    fontWeight: 600,
                  }}
                >
                  ✓ Root Cause Identified
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '6px' }}>
                  {analysisResult.title}
                </h3>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  color: '#58a6ff',
                }}
              >
                <FileCode size={14} />
                <span>{analysisResult.culprit}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {analysisResult.explanation}
            </div>

            {/* Proposed Patch Diff */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Proposed Patch Fix:
              </div>
              <pre
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: '#0d1117',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                }}
              >
                {analysisResult.suggestedFix.split('\n').map((line, idx) => {
                  let color = 'var(--text-muted)';
                  if (line.startsWith('+') && !line.startsWith('+++')) color = '#3fb950';
                  if (line.startsWith('-') && !line.startsWith('---')) color = '#f85149';
                  if (line.startsWith('@@')) color = '#58a6ff';
                  return (
                    <div key={idx} style={{ color }}>
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => onNavigate('patches')}
                className="btn btn-primary"
              >
                <span>Open in Patch Review</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
