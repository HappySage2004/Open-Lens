import { useEffect, useRef, useState } from 'react';
import { TopNav } from './components/layout/TopNav';
import { LeftRail } from './components/layout/LeftRail';
import { ArtifactPanel } from './components/layout/ArtifactPanel';
import { ScratchpadStep } from './components/scratchpad/ScratchpadStep';
import { InputBar } from './components/scratchpad/InputBar';
import { ContextPadPanel } from './components/panels/ContextPadPanel';
import { PersonalNotesPanel } from './components/panels/PersonalNotesPanel';
import { OnboardingFlow } from './components/modals/OnboardingFlow';
import { CheckpointModal } from './components/modals/CheckpointModal';
import { ComingSoon } from './components/modals/ComingSoon';
import { Icon } from './components/icons';
import { useSessionStore } from './store/useSessionStore';
import { applyTheme, getStoredTheme } from './store/useTheme';
import type { AppMode } from './types';

export default function App() {
  const {
    session, steps, artifacts, mode, setMode,
    activePanel, setActivePanel,
    currentSessionId, isLoading, error,
    undoLastStep,
  } = useSessionStore();

  const [view, setView] = useState<'workspace' | 'dashboard'>('workspace');
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [undoConfirmVisible, setUndoConfirmVisible] = useState(false);
  const scratchpadRef = useRef<HTMLDivElement>(null);

  useEffect(() => { applyTheme(getStoredTheme()); }, []);

  // Show onboarding when there is no active session
  const noSession = !currentSessionId;

  const isKernelRunning = steps.some((s) => s.status === 'running');
  const undoEnabled = steps.length > 0 && !isKernelRunning;

  const handleUndoLastStep = () => {
    if (!undoEnabled) return;
    undoLastStep();
    setUndoConfirmVisible(true);
    setTimeout(() => setUndoConfirmVisible(false), 3200);
  };

  if (view === 'dashboard') return <ComingSoon onBack={() => setView('workspace')} />;

  if (noSession) {
    return (
      <OnboardingFlow
        onComplete={(m: AppMode) => { setMode(m); }}
      />
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 12 }}>
        <Icon name="spinner" size={28} color="var(--accent)" />
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading session…</span>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 12 }}>
        <Icon name="warning" size={28} color="#ef4444" />
        <span style={{ fontSize: 14, color: '#ef4444' }}>{error}</span>
        <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: '8px 18px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>Reload</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <TopNav
        mode={mode}
        setMode={setMode}
        onCheckpoint={() => setShowCheckpoint(true)}
        onDashboard={() => setView('dashboard')}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <LeftRail mode={mode} activePanel={activePanel} setActivePanel={setActivePanel} />

        {/* Center workspace */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg)' }}>
          <div ref={scratchpadRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
            {/* Header */}
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Scratchpad</h1>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {steps.length} steps · {isKernelRunning ? 'Kernel running' : 'Kernel idle'} · {artifacts.length} artifacts
                </p>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <button
                  onClick={handleUndoLastStep}
                  title={!steps.length ? 'No steps to undo' : isKernelRunning ? 'Cannot undo while kernel is running' : 'Undo last step'}
                  style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '5px 11px',
                    cursor: undoEnabled ? 'pointer' : 'not-allowed',
                    fontSize: 12, color: undoEnabled ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5,
                    opacity: undoEnabled ? 1 : 0.38,
                  }}
                >
                  <Icon name="undo" size={12} /> Undo last step
                </button>
                <button
                  onClick={() => { useSessionStore.setState({ currentSessionId: null, currentProjectId: null, session: null, steps: [], artifacts: [], hypotheses: [] }); }}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Icon name="newSession" size={12} /> New Session
                </button>
              </div>
            </div>

            {/* Session context banner */}
            {session && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <Icon name="session" size={14} color="var(--accent)" />
                <div style={{ flex: 1, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Session context:</strong>{' '}{session.problem_statement}
                </div>
              </div>
            )}

            {undoConfirmVisible && (
              <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 13px', marginBottom: 12, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: 8, fontSize: 12.5, color: '#10b981' }}>
                <Icon name="check" size={13} color="#10b981" /> Last step removed from view.
              </div>
            )}

            {/* Error banner (non-fatal) */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 13px', marginBottom: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 8, fontSize: 12.5, color: '#ef4444' }}>
                <Icon name="warning" size={13} color="#ef4444" /> {error}
              </div>
            )}

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {steps.map((step, i) => (
                <ScratchpadStep key={step.id} step={step} artifacts={artifacts} mode={mode} index={i} />
              ))}
            </div>

            {steps.length === 0 && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12.5 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #d4954a, #c47a32)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="lens" size={12} color="#fff" />
                </div>
                Session ready — send your first instruction to begin.
              </div>
            )}

            {steps.length > 0 && steps.every((s) => s.status !== 'running') && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12.5 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #d4954a, #c47a32)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="lens" size={12} color="#fff" />
                </div>
                Agent is waiting for your next instruction…
              </div>
            )}
          </div>

          <InputBar mode={mode} />
        </main>

        <ArtifactPanel />

        {/* Side panels */}
        {activePanel === 'context' && (
          <div className="side-panel-push" style={{ width: 340, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ContextPadPanel onClose={() => setActivePanel(null)} />
          </div>
        )}
        {activePanel === 'notes' && (
          <div className="side-panel-push" style={{ width: 340, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PersonalNotesPanel onClose={() => setActivePanel(null)} />
          </div>
        )}
      </div>

      {showCheckpoint && <CheckpointModal onClose={() => setShowCheckpoint(false)} />}
    </div>
  );
}
