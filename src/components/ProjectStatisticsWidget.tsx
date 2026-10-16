import React from 'react';
import { Bug, GitPullRequest, CheckCircle2, ArrowRight, BarChart3 } from 'lucide-react';
import { ProjectStatistics, PageView } from '../types/api';

interface ProjectStatisticsWidgetProps {
  stats: ProjectStatistics;
  onNavigate: (page: PageView) => void;
}

export const ProjectStatisticsWidget: React.FC<ProjectStatisticsWidgetProps> = ({
  stats,
  onNavigate,
}) => {
  return (
    <div
      className="card"
      data-testid="project-statistics-widget"
      style={{
        marginBottom: '24px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderTop: '3px solid #58a6ff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="#58a6ff" />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Project Statistics
          </h3>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Real-time repository telemetry
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Open Bugs Metric */}
        <div
          data-testid="stat-open-bugs"
          onClick={() => onNavigate('debugger')}
          style={{
            padding: '14px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#f85149';
            e.currentTarget.style.backgroundColor = 'rgba(248, 81, 73, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Open Bugs
            </span>
            <div
              style={{
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(248, 81, 73, 0.15)',
                color: '#f85149',
              }}
            >
              <Bug size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span
              data-testid="count-open-bugs"
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: stats.openBugs > 0 ? '#f85149' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {stats.openBugs}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              unresolved tracebacks
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#f85149',
              fontWeight: 500,
            }}
          >
            <span>Investigate in Debugger</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Pending Patches Metric */}
        <div
          data-testid="stat-pending-patches"
          onClick={() => onNavigate('patches')}
          style={{
            padding: '14px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d29922';
            e.currentTarget.style.backgroundColor = 'rgba(210, 153, 34, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pending Patches
            </span>
            <div
              style={{
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(210, 153, 34, 0.15)',
                color: '#d29922',
              }}
            >
              <GitPullRequest size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span
              data-testid="count-pending-patches"
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: stats.pendingPatches > 0 ? '#d29922' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {stats.pendingPatches}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              awaiting code diff review
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#d29922',
              fontWeight: 500,
            }}
          >
            <span>Review unified diffs</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Total Tests Metric */}
        <div
          data-testid="stat-total-tests"
          onClick={() => onNavigate('tests')}
          style={{
            padding: '14px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3fb950';
            e.currentTarget.style.backgroundColor = 'rgba(46, 160, 67, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Tests
            </span>
            <div
              style={{
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(46, 160, 67, 0.15)',
                color: '#3fb950',
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span
              data-testid="count-total-tests"
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#3fb950',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {stats.totalTests}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              suites &amp; security checks
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#3fb950',
              fontWeight: 500,
            }}
          >
            <span>Run in Test Center</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};
