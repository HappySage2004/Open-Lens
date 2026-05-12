import { useEffect, useLayoutEffect, useState } from 'react';
import { Icon } from '../icons';
import { APP_THEMES, MODEL_GROUPS, COST_ROWS } from '../../data/mockSession';
import { applyTheme } from '../../store/useTheme';
import { useSessionStore } from '../../store/useSessionStore';
import type { AppMode } from '../../types';

function TierBadge({ tier }: { tier: string }) {
  const color = tier === '$$$' ? '#f59e0b' : tier === '$$' ? '#d4954a' : '#10b981';
  const bg    = tier === '$$$' ? 'rgba(245,158,11,0.1)' : tier === '$$' ? 'rgba(212,149,74,0.1)' : 'rgba(16,185,129,0.1)';
  return <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>{tier}</span>;
}

function SettingsToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
        <Icon name={value ? 'toggleOn' : 'toggleOff'} size={20} color={value ? '#d4954a' : 'var(--text-muted)'} />
      </button>
    </div>
  );
}

interface Props {
  mode: AppMode;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const EFFORT_TO_API: Record<string, 'low' | 'medium' | 'high'> = {
  Precise: 'low', Balanced: 'medium', Creative: 'high',
};
const API_TO_EFFORT: Record<string, string> = {
  low: 'Precise', medium: 'Balanced', high: 'Creative',
};

export function SettingsPopover({ mode, onClose, anchorRef }: Props) {
  const { session, activeTheme, setActiveTheme, updateSessionSettings } = useSessionStore();
  const s = session?.settings;

  const [selectedModel, setSelectedModel] = useState(s?.model_id ?? 'claude-sonnet-4-6');
  const [effort, setEffort] = useState(API_TO_EFFORT[s?.reasoning_effort ?? 'medium'] ?? 'Balanced');
  const [toggles, setToggles] = useState({
    uncertaintyFlagging:  s?.show_uncertainty_flags  ?? true,
    autoPromoteArtifacts: s?.auto_promote_artifacts  ?? true,
    suggestNextSteps:     s?.suggest_next_steps      ?? true,
    autoStepTitles:       true, // UI-only; no backend field
  });

  const saveModel = (id: string) => {
    setSelectedModel(id);
    updateSessionSettings({ model_id: id });
  };

  const saveEffort = (label: string) => {
    setEffort(label);
    updateSessionSettings({ reasoning_effort: EFFORT_TO_API[label] ?? 'medium' });
  };

  const saveToggle = (key: keyof typeof toggles, val: boolean) => {
    setToggles((t) => ({ ...t, [key]: val }));
    const apiPatch: Record<string, boolean> = {
      uncertaintyFlagging:  key === 'uncertaintyFlagging'  ? val : toggles.uncertaintyFlagging,
      autoPromoteArtifacts: key === 'autoPromoteArtifacts' ? val : toggles.autoPromoteArtifacts,
      suggestNextSteps:     key === 'suggestNextSteps'     ? val : toggles.suggestNextSteps,
    };
    updateSessionSettings({
      show_uncertainty_flags: apiPatch.uncertaintyFlagging,
      auto_promote_artifacts: apiPatch.autoPromoteArtifacts,
      suggest_next_steps:     apiPatch.suggestNextSteps,
    });
  };
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [pos, setPos] = useState({ left: 12, bottom: 12 });

  useLayoutEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ left: rect.left, bottom: window.innerHeight - rect.top + 8 });
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (anchorRef?.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sl = { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', marginBottom: 7 } as const;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed', left: pos.left, bottom: pos.bottom,
        width: 300, maxHeight: 'calc(100vh - 80px)',
        background: 'var(--surface-1)', border: '1px solid var(--border-light)',
        borderRadius: 12, boxShadow: '0 -4px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 200, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px 10px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>Session Settings</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}>
          <Icon name="close" size={14} />
        </button>
      </div>

      <div style={{ padding: '12px 14px 0', overflowY: 'auto', flex: 1 }}>
        {/* Model selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={sl}>MODEL</div>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {MODEL_GROUPS.map((group, gi) => (
              <div key={group.provider}>
                {gi > 0 && <div style={{ height: 1, background: 'var(--border)' }} />}
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '5px 10px 3px', background: 'var(--surface-3)' }}>
                  {group.provider.toUpperCase()}
                </div>
                {group.models.map((m, mi) => {
                  const active = selectedModel === m.id;
                  return (
                    <button key={m.id} onClick={() => saveModel(m.id)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px',
                      background: active ? 'rgba(212,149,74,0.1)' : 'transparent',
                      border: 'none', borderTop: mi > 0 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: active ? '#d4954a' : 'transparent', border: active ? 'none' : '1.5px solid var(--border-light)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                          {m.recommended && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#d4954a', background: 'rgba(212,149,74,0.12)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>Recommended</span>}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>{m.desc}</div>
                      </div>
                      <TierBadge tier={m.tier} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning effort (analyst only) */}
        {mode === 'analyst' && (
          <div style={{ marginBottom: 14 }}>
            <div style={sl}>REASONING EFFORT</div>
            <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: 3, gap: 2 }}>
              {['Precise', 'Balanced', 'Creative'].map((opt) => (
                <button key={opt} onClick={() => saveEffort(opt)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                  fontSize: 11.5, fontWeight: effort === opt ? 600 : 400,
                  background: effort === opt ? 'var(--surface-3)' : 'transparent',
                  color: effort === opt ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: effort === opt ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {/* Behaviour toggles */}
        <div style={{ marginBottom: 12 }}>
          <div style={sl}>SESSION BEHAVIOUR</div>
          <SettingsToggle label="Uncertainty flagging"      value={toggles.uncertaintyFlagging}   onChange={(v) => saveToggle('uncertaintyFlagging', v)} />
          <SettingsToggle label="Auto-promote artifacts"    value={toggles.autoPromoteArtifacts}  onChange={(v) => saveToggle('autoPromoteArtifacts', v)} />
          <SettingsToggle label="Suggest next steps"        value={toggles.suggestNextSteps}      onChange={(v) => saveToggle('suggestNextSteps', v)} />
          <SettingsToggle label="Auto-generate step titles" value={toggles.autoStepTitles}        onChange={(v) => saveToggle('autoStepTitles', v)} />
        </div>

        {/* Theme */}
        <div style={{ marginBottom: 12 }}>
          <div style={sl}>THEME</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {APP_THEMES.map((theme) => {
              const active = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => { applyTheme(theme.id); setActiveTheme(theme.id); }}
                  title={`${theme.name} — ${theme.desc}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    background: active ? 'var(--accent-dim)' : 'var(--surface-2)',
                    border: active ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 8, padding: '7px 8px', cursor: 'pointer', minWidth: 48,
                  }}
                >
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {theme.swatch.slice(0, 4).map((c, i) => (
                      <div key={i} style={{ width: i === 3 ? 10 : 8, height: i === 3 ? 10 : 8, borderRadius: '50%', background: c, flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>~$0.42 this session</span>
          <button onClick={() => setShowBreakdown((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--accent)', fontWeight: 600, padding: 0 }}>
            {showBreakdown ? 'Hide breakdown' : 'View breakdown'}
          </button>
        </div>
        {showBreakdown && (
          <div className="fade-in" style={{ marginTop: 10, marginBottom: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Model', 'Tok in', 'Tok out', 'Cost'].map((h) => (
                    <th key={h} style={{ padding: '3px 4px', fontWeight: 700, color: 'var(--text-muted)', textAlign: h === 'Model' ? 'left' : 'right', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COST_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '4px 4px', color: 'var(--text-secondary)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.model}</td>
                    <td style={{ padding: '4px 4px', color: 'var(--text-muted)', textAlign: 'right' }}>{r.tokIn}</td>
                    <td style={{ padding: '4px 4px', color: 'var(--text-muted)', textAlign: 'right' }}>{r.tokOut}</td>
                    <td style={{ padding: '4px 4px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 500 }}>{r.cost}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ padding: '4px 4px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total</td>
                  <td style={{ padding: '4px 4px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>$0.42</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{ height: 12 }} />
    </div>
  );
}