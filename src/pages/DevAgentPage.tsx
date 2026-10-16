import React, { useState } from 'react';
import { TerminalSquare, Play, ArrowRight, Clock } from 'lucide-react';
import { Project } from '../types/api';

interface WorkflowStep {
  number: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'awaiting_approval' | 'completed';
}

interface DevAgentPageProps {
  activeProject: Project | null;
}

export const DevAgentPage: React.FC<DevAgentPageProps> = ({ activeProject }) => {
  const [taskInput, setTaskInput] = useState(
    'Implement automatic secret pattern redaction for AWS and OpenAI keys in application logger'
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      number: 1,
      title: 'Repository Structure & Symbol Analysis',
      description: 'Scans AST symbols in backend/app/core/logging.py to locate log record filters.',
      status: 'pending',
    },
    {
      number: 2,
      title: 'Draft Redaction Regex Patterns',
      description: 'Creates compiled regex filters matching sk-*, AKIA*, and Bearer tokens.',
      status: 'pending',
    },
    {
      number: 3,
      title: 'Human-in-the-Loop Safety Checkpoint',
      description: 'Halts execution and awaits explicit developer confirmation before applying file changes.',
      status: 'pending',
    },
    {
      number: 4,
      title: 'Automated Regression Test Execution',
      description: 'Runs test_secret_redaction.py with 30-second execution sandbox.',
      status: 'pending',
    },
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([]);

  const handleStartWorkflow = () => {
    setIsExecuting(true);
    setCurrentStepIndex(0);
    setLogs([`[00:01] Initializing autonomous planner for task: "${taskInput}"`]);

    // Step 1
    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, idx) => (idx === 0 ? { ...s, status: 'completed' } : idx === 1 ? { ...s, status: 'in_progress' } : s))
      );
      setLogs((prev) => [
        ...prev,
        `[00:02] Step 1 Complete: Found backend/app/core/logging.py and audit logs.`,
        `[00:03] Step 2 In Progress: Drafting regex redaction pattern rules...`,
      ]);
      setCurrentStepIndex(1);

      // Step 2 -> Step 3 (Approval gate)
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, idx) => (idx <= 1 ? { ...s, status: 'completed' } : idx === 2 ? { ...s, status: 'awaiting_approval' } : s))
        );
        setLogs((prev) => [
          ...prev,
          `[00:04] Step 2 Complete: Formulated patch for backend/app/core/logging.py.`,
          `[00:05] CHECKPOINT: Human approval required before writing modifications.`,
        ]);
        setCurrentStepIndex(2);
        setIsExecuting(false);
      }, 1000);
    }, 1000);
  };

  const handleApprove = () => {
    setIsExecuting(true);
    setSteps((prev) =>
      prev.map((s, idx) => (idx === 2 ? { ...s, status: 'completed' } : idx === 3 ? { ...s, status: 'in_progress' } : s))
    );
    setLogs((prev) => [
      ...prev,
      `[00:06] Developer approved changes. Creating atomic rollback snapshot.`,
      `[00:07] Running test verification against pytest suite...`,
    ]);
    setCurrentStepIndex(3);

    // Step 4 Complete
    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => ({ ...s, status: 'completed' }))
      );
      setLogs((prev) => [
        ...prev,
        `[00:08] All 4 tests passed in 0.14s.`,
        `[00:09] Task completed successfully. Audit log registered.`,
      ]);
      setIsExecuting(false);
    }, 1200);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          borderLeft: '4px solid #a371f7',
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
              backgroundColor: 'rgba(163, 113, 247, 0.15)',
              color: '#a371f7',
            }}
          >
            <TerminalSquare size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Controlled Autonomous Development Agent</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Execute multi-step tasks with enforced human approval gates before consequential modifications.
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

      {/* Task Input Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
          Assign Engineering Task to DevAgent
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-field"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={isExecuting}
            placeholder="Describe what you want DevAgent to implement, refactor, or test..."
            style={{ flex: 1 }}
          />
          <button
            onClick={handleStartWorkflow}
            disabled={isExecuting || !taskInput.trim() || currentStepIndex === 2}
            className="btn btn-primary"
            style={{ padding: '0 18px' }}
          >
            <Play size={14} className={isExecuting ? 'animate-spin' : ''} />
            <span>{isExecuting ? 'Executing...' : 'Plan & Run'}</span>
          </button>
        </div>
      </div>

      {/* Multi-step Plan & Live Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Steps List */}
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>
            Multi-Step Execution Pipeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((step) => {
              const isDone = step.status === 'completed';
              const isGate = step.status === 'awaiting_approval';
              const isInProgress = step.status === 'in_progress';
              return (
                <div
                  key={step.number}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: isGate
                      ? 'rgba(210, 153, 34, 0.12)'
                      : isDone
                      ? 'rgba(46, 160, 67, 0.08)'
                      : isInProgress
                      ? 'rgba(56, 139, 253, 0.12)'
                      : 'var(--bg-tertiary)',
                    border: isGate
                      ? '1px solid #d29922'
                      : isDone
                      ? '1px solid rgba(46, 160, 67, 0.3)'
                      : isInProgress
                      ? '1px solid #58a6ff'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: isDone ? '#3fb950' : isGate ? '#d29922' : 'var(--bg-accent)',
                          color: '#fff',
                        }}
                      >
                        {isDone ? '✓' : step.number}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {step.title}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        backgroundColor: isDone
                          ? 'rgba(46, 160, 67, 0.2)'
                          : isGate
                          ? 'rgba(210, 153, 34, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isDone ? '#3fb950' : isGate ? '#d29922' : 'var(--text-muted)',
                      }}
                    >
                      {step.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '28px', marginTop: '2px' }}>
                    {step.description}
                  </p>

                  {/* Checkpoint approval button */}
                  {isGate && (
                    <div style={{ marginTop: '10px', marginLeft: '28px' }}>
                      <button
                        onClick={handleApprove}
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '5px 12px', backgroundColor: '#d29922' }}
                      >
                        <span>Authorize Changes &amp; Proceed</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Logs Terminal */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={14} color="#58a6ff" />
            <span>Workflow Execution Output</span>
          </div>

          <div
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: '#0d1117',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#58a6ff',
              overflowY: 'auto',
              minHeight: '260px',
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>
                Press "Plan &amp; Run" to generate workflow plan and start execution...
              </span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
