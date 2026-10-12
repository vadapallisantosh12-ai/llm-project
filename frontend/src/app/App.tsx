import React, { useEffect, useState, useCallback } from 'react';
import {
  Bot,
  Bug,
  GitPullRequest,
  CheckCircle2,
  Code2,
  TerminalSquare,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { FeatureStagePage } from '../pages/FeatureStagePage';
import { HealthData, Project, PageView } from '../types/api';
import { apiClient } from '../api/client';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, projectsRes] = await Promise.all([
        apiClient.getHealth().catch((e) => {
          console.warn('Backend health check error:', e);
          return null;
        }),
        apiClient.getProjects().catch((e) => {
          console.warn('Projects fetch error:', e);
          return [] as Project[];
        }),
      ]);

      if (healthRes) {
        setHealth(healthRes.data);
      } else {
        setHealth(null);
      }
      setProjects(projectsRes);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to connect to DevAgent AI backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh for live status
    return () => clearInterval(interval);
  }, [fetchData]);

  const getPageTitle = (page: PageView): { title: string; subtitle: string } => {
    switch (page) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'System operational status and overview' };
      case 'projects':
        return { title: 'Project Workspace', subtitle: 'Registered projects and filesystem boundaries' };
      case 'assistant':
        return { title: 'AI Assistant', subtitle: 'Project-aware codebase conversational assistant' };
      case 'debugger':
        return { title: 'Debugging Center', subtitle: 'Traceback analysis and root cause investigation' };
      case 'patches':
        return { title: 'Patch Review', subtitle: 'Reviewable diffs and transactional file changes' };
      case 'tests':
        return { title: 'Test Center', subtitle: 'Pytest test generation and controlled execution' };
      case 'reviews':
        return { title: 'Code Review', subtitle: 'Git change inspection and static analysis findings' };
      case 'agent':
        return { title: 'Development Agent', subtitle: 'Multi-step autonomous workflows with human approval' };
      case 'settings':
        return { title: 'Settings', subtitle: 'LLM providers, timeouts, and execution policies' };
      default:
        return { title: 'DevAgent AI', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle(currentPage);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          title={title}
          subtitle={subtitle}
          health={health}
          loading={loading}
          onRefresh={fetchData}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                margin: '24px 24px 0',
                padding: '12px 16px',
                backgroundColor: 'rgba(248, 81, 73, 0.15)',
                border: '1px solid #f85149',
                borderRadius: '6px',
                color: '#f85149',
                fontSize: '13px',
              }}
            >
              ⚠️ {error} — Ensure the FastAPI backend is running on <code>http://127.0.0.1:8000</code>.
            </div>
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              health={health}
              projects={projects}
              loading={loading}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsPage
              projects={projects}
              loading={loading}
              onRefresh={fetchData}
            />
          )}

          {currentPage === 'assistant' && (
            <FeatureStagePage
              title="Context-Aware AI Assistant"
              phaseNumber={4}
              phaseName="LLM Integration & Retrieval"
              icon={Bot}
              description="Ask questions about your real repository with retrieved context from indexed code chunks."
              deliverables={[
                'Multi-provider LLM abstraction (Ollama local + hosted APIs)',
                'Codebase context assembly with token limit guards',
                'Chat history persisted in SQLite',
                'Streaming responses with symbol citations',
              ]}
              currentFoundation={[
                'FastAPI /api/v1/assistant/chat router defined',
                'Pydantic response models ready',
                'Database models for conversations and LLM usage metadata',
              ]}
            />
          )}

          {currentPage === 'debugger' && (
            <FeatureStagePage
              title="Traceback & Error Debugging Assistant"
              phaseNumber={5}
              phaseName="Debugging Assistant"
              icon={Bug}
              description="Submit real Python tracebacks, JavaScript errors, or test failures for root-cause analysis."
              deliverables={[
                'Traceback parsing and source file/line locator',
                'Evidence-grounded hypothesis generation',
                'Actionable fix recommendations with regression test suggestions',
                'Verification of fixes against project test suite',
              ]}
              currentFoundation={[
                'Debugging API router registered under /api/v1/debug',
                'Structured error envelope and logging filter in place',
              ]}
            />
          )}

          {currentPage === 'patches' && (
            <FeatureStagePage
              title="Safe Patch Generation & Diff Viewer"
              phaseNumber={6}
              phaseName="Safe Patch Generation and Review"
              icon={GitPullRequest}
              description="Review proposed code changes line-by-line before applying them to your workspace."
              deliverables={[
                'Monaco Editor and side-by-side Diff Viewer',
                'Strict canonical path check ensuring changes stay inside registered root',
                'Pre-application hash check to detect stale files',
                'Atomic application with automatic backup and rollback',
              ]}
              currentFoundation={[
                'PathSecurityException traversal guard in backend/app/security/paths.py',
                'Audit log model in SQLite database',
              ]}
            />
          )}

          {currentPage === 'tests' && (
            <FeatureStagePage
              title="Test Generation & Controlled Execution"
              phaseNumber={7}
              phaseName="Test Generation and Execution"
              icon={CheckCircle2}
              description="Generate pytest/Jest tests and execute them with timeout limits and real output capture."
              deliverables={[
                'Automatic inspection of existing project test suites',
                'Generation of edge-case and regression tests',
                'Controlled execution service with process group termination',
                'Real-time output stream and exit code capture',
              ]}
              currentFoundation={[
                'Subprocess execution policies configured in settings',
                'No-Docker Windows-native process execution architecture',
              ]}
            />
          )}

          {currentPage === 'reviews' && (
            <FeatureStagePage
              title="Code Review Engine"
              phaseNumber={8}
              phaseName="Code Review"
              icon={Code2}
              description="Analyze Git diffs and changed files for bugs, security risks, and convention mismatches."
              deliverables={[
                'GitPython integration for uncommitted and staged changes',
                'Categorized findings (Correctness, Security, Performance, Maintainability)',
                'Severity scoring and actionable remediation snippets',
              ]}
              currentFoundation={[
                'Git version 2.54.0 detected on Windows host',
                'Audit logging model initialized in SQLite database',
              ]}
            />
          )}

          {currentPage === 'agent' && (
            <FeatureStagePage
              title="Multi-Step Autonomous Development Agent"
              phaseNumber={9}
              phaseName="Controlled Multi-Step Development Agent"
              icon={TerminalSquare}
              description="Coordinate complex multi-step developer workflows with human approval checkpoints."
              deliverables={[
                'Ordered multi-step execution plans (Understand -> Plan -> Retrieve -> Propose -> Verify)',
                'Strict approval gates before modifying files or running commands',
                'Task cancellation, progress telemetry, and bounded loop safeguards',
              ]}
              currentFoundation={[
                'Background task models and audit tracking schemas',
                'Strict human-in-the-loop approval architecture',
              ]}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage health={health} />
          )}
        </main>
      </div>
    </div>
  );
};
