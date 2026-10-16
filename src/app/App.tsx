import React, { useEffect, useState, useCallback } from 'react';
import { Code2 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AssistantPage } from '../pages/AssistantPage';
import { DebuggerPage } from '../pages/DebuggerPage';
import { PatchReviewPage } from '../pages/PatchReviewPage';
import { TestCenterPage } from '../pages/TestCenterPage';
import { DevAgentPage } from '../pages/DevAgentPage';
import { FeatureStagePage } from '../pages/FeatureStagePage';
import { HealthData, Project, PageView, ProjectStatistics } from '../types/api';
import { apiClient } from '../api/client';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStatistics>({
    openBugs: 0,
    pendingPatches: 0,
    totalTests: 0,
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, projectsRes, statsRes] = await Promise.all([
        apiClient.getHealth().catch((e) => {
          console.warn('Backend health check error:', e);
          return null;
        }),
        apiClient.getProjects().catch((e) => {
          console.warn('Projects fetch error:', e);
          return [] as Project[];
        }),
        apiClient.getProjectStatistics().catch((e) => {
          console.warn('Statistics fetch error:', e);
          return { openBugs: 0, pendingPatches: 0, totalTests: 0 };
        }),
      ]);

      if (healthRes) {
        setHealth(healthRes.data);
      } else {
        setHealth(null);
      }

      const projs = Array.isArray(projectsRes) ? projectsRes : [];
      setProjects(projs);
      setStats(statsRes);

      // Auto-select first project if none selected
      setActiveProjectId((prev) => {
        if (prev && projs.some((p) => p.id === prev)) return prev;
        return projs.length > 0 ? projs[0].id : null;
      });
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

  // Global Keyboard Shortcuts (Ctrl+D for Dashboard, Ctrl+P for Projects)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ensure shortcuts do not trigger when typing in inputs or textareas
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.tagName === 'SELECT');

      if (isInput) {
        return;
      }

      // Check Ctrl or Cmd key combinations
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          setCurrentPage('dashboard');
        } else if (key === 'p') {
          e.preventDefault();
          setCurrentPage('projects');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || (projects.length > 0 ? projects[0] : null);

  const handleIndexProject = async (id: string) => {
    await apiClient.triggerIndexing(id);
    await fetchData();
  };

  const getPageTitle = (page: PageView): { title: string; subtitle: string } => {
    switch (page) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'System operational status, real telemetry, and overview' };
      case 'projects':
        return { title: 'Project Workspace', subtitle: 'Registered projects, filesystem boundaries, and next steps' };
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

      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          title={title}
          subtitle={subtitle}
          health={health}
          loading={loading}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
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
              ⚠️ {error} — Operating in high-reliability local mode.
            </div>
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              health={health}
              projects={projects}
              stats={stats}
              loading={loading}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsPage
              projects={projects}
              loading={loading}
              activeProjectId={activeProjectId}
              onSelectProject={setActiveProjectId}
              onNavigate={setCurrentPage}
              onRefresh={fetchData}
            />
          )}

          {currentPage === 'assistant' && (
            <AssistantPage
              activeProject={activeProject}
              onIndexProject={handleIndexProject}
              onNavigateToProjects={() => setCurrentPage('projects')}
            />
          )}

          {currentPage === 'debugger' && (
            <DebuggerPage
              activeProject={activeProject}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'patches' && (
            <PatchReviewPage
              activeProject={activeProject}
              onNavigate={setCurrentPage}
              onDataChange={fetchData}
            />
          )}

          {currentPage === 'tests' && (
            <TestCenterPage
              activeProject={activeProject}
              onDataChange={fetchData}
            />
          )}

          {currentPage === 'reviews' && (
            <FeatureStagePage
              title="Code Review & Static Inspection"
              phaseNumber={8}
              phaseName="Automated Code Review"
              icon={Code2}
              description="Inspect Git working tree changes, identify vulnerabilities, and verify code style compliance."
              deliverables={[
                'Git diff parsing and changed hunk highlighting',
                'Ruff linter and static security check integration',
                'Contextual PR review comment generator',
                'Pre-commit check recommendation pipeline',
              ]}
              currentFoundation={[
                'Ruff linter integration configured',
                'Git root path detection',
              ]}
            />
          )}

          {currentPage === 'agent' && (
            <DevAgentPage
              activeProject={activeProject}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              health={health}
              onRefreshHealth={fetchData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
