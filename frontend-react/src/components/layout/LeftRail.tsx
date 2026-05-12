import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons';
import { HypoStatusBadge } from '../common/HypoStatusBadge';
import { SettingsPopover } from '../panels/SettingsPopover';
import { useSessionStore } from '../../store/useSessionStore';
import type { AppMode, PanelName } from '../../types';

interface Props {
  mode: AppMode;
  activePanel: PanelName;
  setActivePanel: (p: PanelName) => void;
}

export function LeftRail({ mode, activePanel, setActivePanel }: Props) {
  const { session, hypotheses } = useSessionStore();
  const [hypoOpen, setHypoOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const settingsOpen = activePanel === 'settings';
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  const tasks = session?.task_graph?.nodes ?? [];
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const taskStatusIcon = (status: string) => {
    if (status === 'completed') return <Icon name="check" size={13} color="#10b981" />;
    if (status === 'in_progress') return <Icon name="spinner" size={13} color="#d4954a" />;
    return <span style={{ width: 13, height: 13, border: '1.5px solid var(--border-light)', borderRadius: '50%', display: 'inline-block' }} />;
  };

  return (
    <aside style={{
      width: 'var(--rail-w)', flexShrink: 0,
      background: 'var(--surface-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Session info */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          background: 'var(--surface-2)', borderRadius: 10,
          border: '1px solid var(--border)', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', marginBottom: 6 }}>PROBLEM</div>
          <p style={{
            fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {session?.problem_statement ?? '—'}
          </p>
        </div>

        {/* Data source */}
        {session?.data_snapshot_ref && (
          <div style={{
            marginTop: 10, background: 'var(--surface-2)', borderRadius: 10,
            border: '1px solid var(--border)', padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="database" size={13} color="#0ea5e9" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{session.data_snapshot_ref}</span>
            </div>
          </div>
        )}
      </div>

      {/* Scroll area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>

        {/* Task graph / Progress */}
        {tasks.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                {mode === 'analyst' ? 'TASK GRAPH' : 'PROGRESS'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{completedCount}/{totalTasks}</span>
            </div>

            {mode === 'business' ? (
              <div>
                <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{progressPct}% complete</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tasks.map((task) => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    padding: `5px 8px 5px ${8 + task.depth * 16}px`,
                    borderRadius: 7,
                    background: task.status === 'in_progress' ? 'rgba(212,149,74,0.1)' : 'transparent',
                  }}>
                    <div style={{ marginTop: 1, flexShrink: 0 }}>{taskStatusIcon(task.status)}</div>
                    <span style={{
                      fontSize: 12, lineHeight: 1.4,
                      color: task.status === 'in_progress' ? 'var(--text-primary)' :
                             task.status === 'completed'   ? 'var(--text-muted)'   : 'var(--text-secondary)',
                      fontWeight: task.status === 'in_progress' ? 500 : 400,
                    }}>{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hypothesis Register */}
        <div style={{ borderTop: tasks.length > 0 ? '1px solid var(--border)' : 'none', paddingTop: tasks.length > 0 ? 12 : 0, marginBottom: 12 }}>
          <button
            onClick={() => setHypoOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '0 0 6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="hypothesis" size={13} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>HYPOTHESES</span>
              <span style={{ fontSize: 11, background: 'var(--surface-3)', borderRadius: 99, padding: '0 6px' }}>{hypotheses.length}</span>
            </div>
            <Icon name={hypoOpen ? 'chevronUp' : 'chevronDown'} size={13} />
          </button>
          {hypoOpen && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hypotheses.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No hypotheses yet.</div>
              )}
              {hypotheses.map((h) => (
                <div key={h.id} style={{
                  background: 'var(--surface-2)', borderRadius: 8,
                  border: '1px solid var(--border)', padding: '9px 11px',
                }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 6 }}>{h.statement}</p>
                  <HypoStatusBadge status={h.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session history */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '0 0 6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="history" size={13} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>SESSION HISTORY</span>
            </div>
            <Icon name={historyOpen ? 'chevronUp' : 'chevronDown'} size={13} />
          </button>
          {historyOpen && (
            <div className="fade-in" style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Session switching coming in a future release.
            </div>
          )}
        </div>
      </div>

      {/* Settings trigger */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 12px' }}>
          <button
            ref={settingsBtnRef}
            onClick={() => setActivePanel(settingsOpen ? null : 'settings')}
            title="Session Settings"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              width: '100%',
              background: settingsOpen ? 'var(--accent-dim)' : 'none',
              border: settingsOpen ? '1px solid rgba(212,149,74,0.3)' : '1px solid transparent',
              borderRadius: 7, cursor: 'pointer', padding: '6px 8px',
              transition: 'all 0.15s',
            }}
          >
            <Icon name="gear" size={14} color={settingsOpen ? '#d4954a' : 'var(--text-muted)'} />
            <span style={{ fontSize: 11.5, color: settingsOpen ? '#d4954a' : 'var(--text-muted)', fontWeight: 500 }}>Session Settings</span>
          </button>
        </div>
      </div>

      {settingsOpen && createPortal(
        <SettingsPopover mode={mode} onClose={() => setActivePanel(null)} anchorRef={settingsBtnRef} />,
        document.body,
      )}
    </aside>
  );
}
