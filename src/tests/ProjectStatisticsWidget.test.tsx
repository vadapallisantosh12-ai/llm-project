import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectStatisticsWidget } from '../components/ProjectStatisticsWidget';
import { ProjectStatistics } from '../types/api';

describe('ProjectStatisticsWidget', () => {
  const sampleStats: ProjectStatistics = {
    openBugs: 3,
    pendingPatches: 2,
    totalTests: 12,
  };

  it('renders the real counts of open bugs, pending patches, and total tests', () => {
    const onNavigate = vi.fn();
    render(<ProjectStatisticsWidget stats={sampleStats} onNavigate={onNavigate} />);

    // Verify title
    expect(screen.getByText('Project Statistics')).toBeDefined();

    // Verify Open Bugs count
    const bugsCount = screen.getByTestId('count-open-bugs');
    expect(bugsCount.textContent).toBe('3');

    // Verify Pending Patches count
    const patchesCount = screen.getByTestId('count-pending-patches');
    expect(patchesCount.textContent).toBe('2');

    // Verify Total Tests count
    const testsCount = screen.getByTestId('count-total-tests');
    expect(testsCount.textContent).toBe('12');
  });

  it('navigates to debugger when open bugs card is clicked', () => {
    const onNavigate = vi.fn();
    render(<ProjectStatisticsWidget stats={sampleStats} onNavigate={onNavigate} />);

    const bugsCard = screen.getByTestId('stat-open-bugs');
    fireEvent.click(bugsCard);

    expect(onNavigate).toHaveBeenCalledWith('debugger');
  });

  it('navigates to patches when pending patches card is clicked', () => {
    const onNavigate = vi.fn();
    render(<ProjectStatisticsWidget stats={sampleStats} onNavigate={onNavigate} />);

    const patchesCard = screen.getByTestId('stat-pending-patches');
    fireEvent.click(patchesCard);

    expect(onNavigate).toHaveBeenCalledWith('patches');
  });

  it('navigates to tests when total tests card is clicked', () => {
    const onNavigate = vi.fn();
    render(<ProjectStatisticsWidget stats={sampleStats} onNavigate={onNavigate} />);

    const testsCard = screen.getByTestId('stat-total-tests');
    fireEvent.click(testsCard);

    expect(onNavigate).toHaveBeenCalledWith('tests');
  });
});
