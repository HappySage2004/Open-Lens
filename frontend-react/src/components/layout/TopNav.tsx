import { Icon } from '../icons';
import type { AppMode, PanelName } from '../../types';
import { useSessionStore } from '../../store/useSessionStore';

interface Props {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  onCheckpoint: () => void;
  onDashboard: () => void;
  activePanel: PanelName;
  setActivePanel: (p: PanelName) => void;
}

export function TopNav({ mode, setMode, onCheckpoint, onDashboard, activePanel, setActivePanel }: Props) {
  const { currentSessionId, isLoading } = useSessionStore();
  const togglePanel = (name: NonNullable<PanelName>) =>
    setActivePanel(activePanel === name ? null : name);

  return (
    <header style={{
      height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
      padding: '0 20px', borderBottom: '1px solid var(--border)',
      background: 'var(--surface-1)',
      flexShrink: 0, gap: 16, position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'linear-gradient(135deg, #d4954a, #c47a32)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="lens" size={15} color="#fff" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>OpenLens</span>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* Breadcrumb */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>Revenue Intelligence</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Q1–Q3 Revenue Analysis · Enterprise Churn
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{currentSessionId ?? '—'} · {isLoading ? 'Loading…' : 'Kernel active'}</div>
      </div>

      {/* Notepad triggers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Context Pad */}
        <div className="nav-icon-wrap" style={{ position: 'relative' }}>
          <button
            onClick={() => togglePanel('context')}
            title="Context Pad"
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid',
              cursor: 'pointer',
              background: activePanel === 'context' ? 'var(--accent-dim)' : 'var(--surface-2)',
              borderColor: activePanel === 'context' ? 'rgba(212,149,74,0.4)' : 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', position: 'relative',
            }}
          >
            <Icon name="contextPad" size={15} color={activePanel === 'context' ? '#d4954a' : 'var(--text-muted)'} />
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 6, height: 6, borderRadius: '50%',
              background: '#d4954a', border: '1.5px solid var(--surface-1)',
            }} />
          </button>
          <span className="nav-tooltip" style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--surface-3)', border: '1px solid var(--border-light)',
            borderRadius: 5, padding: '3px 8px', fontSize: 11, color: 'var(--text-secondary)',
            whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0,
            transition: 'opacity 0.15s', zIndex: 50,
          }}>Context Pad</span>
        </div>

        {/* Personal Notes */}
        <div className="nav-icon-wrap" style={{ position: 'relative' }}>
          <button
            onClick={() => togglePanel('notes')}
            title="Personal Notes"
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid',
              cursor: 'pointer',
              background: activePanel === 'notes' ? 'var(--accent-dim)' : 'var(--surface-2)',
              borderColor: activePanel === 'notes' ? 'rgba(212,149,74,0.4)' : 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <Icon name="notepad" size={15} color={activePanel === 'notes' ? '#d4954a' : 'var(--text-muted)'} />
          </button>
          <span className="nav-tooltip" style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--surface-3)', border: '1px solid var(--border-light)',
            borderRadius: 5, padding: '3px 8px', fontSize: 11, color: 'var(--text-secondary)',
            whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0,
            transition: 'opacity 0.15s', zIndex: 50,
          }}>Personal Notes</span>
        </div>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* Mode toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 9, padding: 3, gap: 2,
      }}>
        {(['analyst', 'business'] as AppMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '5px 14px', borderRadius: 7, border: 'none',
            cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
            background: mode === m ? 'var(--accent)' : 'transparent',
            color: mode === m ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.18s', textTransform: 'capitalize',
          }}>
            {m === 'analyst' ? 'Analyst' : 'Business'}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onCheckpoint}
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Icon name="history" size={13} />
          Checkpoint
        </button>
        <button
          onClick={onDashboard}
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Icon name="dashboard" size={13} />
          Dashboard
        </button>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4954a 0%, #c47a32 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
        }}>AK</div>
      </div>
    </header>
  );
}