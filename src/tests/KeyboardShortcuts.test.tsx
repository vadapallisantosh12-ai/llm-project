import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../app/App';
import { apiClient } from '../api/client';

describe('App Keyboard Shortcuts & Real Statistics', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('switches between pages using Ctrl+P for Projects and Ctrl+D for Dashboard', async () => {
    render(<App />);

    // Wait for Dashboard to render initially
    await waitFor(() => {
      expect(screen.getByTestId('project-statistics-widget')).toBeDefined();
    });

    // Press Ctrl+P -> should navigate to Projects page
    fireEvent.keyDown(window, {
      key: 'p',
      code: 'KeyP',
      ctrlKey: true,
    });

    await waitFor(() => {
      expect(screen.getByText('Project Workspace Registry')).toBeDefined();
    });

    // Press Ctrl+D -> should navigate back to Dashboard page
    fireEvent.keyDown(window, {
      key: 'd',
      code: 'KeyD',
      ctrlKey: true,
    });

    await waitFor(() => {
      expect(screen.getByTestId('project-statistics-widget')).toBeDefined();
    });
  });

  it('does NOT switch page when Ctrl+D or Ctrl+P is pressed inside an input field', async () => {
    render(<App />);

    // Navigate to projects to access an input field
    fireEvent.keyDown(window, {
      key: 'p',
      code: 'KeyP',
      ctrlKey: true,
    });

    await waitFor(() => {
      expect(screen.getByText('Project Workspace Registry')).toBeDefined();
    });

    // Find search input
    const input = screen.getByPlaceholderText('Search projects by name or path...');
    input.focus();

    // Trigger Ctrl+D inside input -> should NOT navigate away from projects
    fireEvent.keyDown(input, {
      key: 'd',
      code: 'KeyD',
      ctrlKey: true,
    });

    // Still on Projects page
    expect(screen.getByText('Project Workspace Registry')).toBeDefined();
  });

  it('loads real statistics from apiClient data sources', async () => {
    const stats = await apiClient.getProjectStatistics();

    expect(typeof stats.openBugs).toBe('number');
    expect(typeof stats.pendingPatches).toBe('number');
    expect(typeof stats.totalTests).toBe('number');

    expect(stats.openBugs).toBeGreaterThanOrEqual(0);
    expect(stats.pendingPatches).toBeGreaterThanOrEqual(0);
    expect(stats.totalTests).toBeGreaterThanOrEqual(0);
  });
});
