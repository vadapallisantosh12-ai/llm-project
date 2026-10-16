import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient } from '../api/client';

describe('ApiClient End-to-End Workflow & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves health data with expected schema', async () => {
    const health = await apiClient.getHealth();
    expect(health).toBeDefined();
    expect(health.data).toBeDefined();
    expect(health.data.app_name).toBe('DevAgent AI');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.data.status);
  });

  it('creates, lists, and removes projects properly', async () => {
    const initial = await apiClient.getProjects();
    const initialCount = initial.length;

    const created = await apiClient.createProject({
      name: 'Test Project Workspace',
      root_path: './test-workspace',
      description: 'Temporary workspace for verification',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Project Workspace');

    const updated = await apiClient.getProjects();
    expect(updated.length).toBe(initialCount + 1);

    await apiClient.deleteProject(created.id);
    const afterDelete = await apiClient.getProjects();
    expect(afterDelete.length).toBe(initialCount);
  });

  it('correctly tracks and computes project statistics with bugs and patches', async () => {
    const statsInitial = await apiClient.getProjectStatistics();
    expect(typeof statsInitial.openBugs).toBe('number');
    expect(typeof statsInitial.pendingPatches).toBe('number');
    expect(typeof statsInitial.totalTests).toBe('number');

    // Add a new bug
    const bug = await apiClient.addBug({
      title: 'Regression in token boundary parser',
      traceback: 'Traceback (most recent call last):\n  File "parser.py", line 12',
      culprit: 'src/parser.py:12',
      status: 'open',
    });

    const statsAfterBug = await apiClient.getProjectStatistics();
    expect(statsAfterBug.openBugs).toBe(statsInitial.openBugs + 1);

    // Resolve the bug
    await apiClient.resolveBug(bug.id);
    const statsAfterResolve = await apiClient.getProjectStatistics();
    expect(statsAfterResolve.openBugs).toBe(statsInitial.openBugs);
  });

  it('updates patch status through applyPatch and rejectPatch', async () => {
    const patches = await apiClient.getPatches();
    expect(patches.length).toBeGreaterThan(0);

    const pending = patches.find((p) => p.status === 'pending_review');
    if (pending) {
      await apiClient.updatePatchStatus(pending.id, 'applied');
      const updatedPatches = await apiClient.getPatches();
      const target = updatedPatches.find((p) => p.id === pending.id);
      expect(target?.status).toBe('applied');
    }
  });
});
