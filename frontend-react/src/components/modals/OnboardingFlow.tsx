import { useState } from 'react';
import { Icon } from '../icons';
import type { AppMode } from '../../types';
import { useSessionStore } from '../../store/useSessionStore';

const SOURCES = [
  { id: 'snowflake',  label: 'Snowflake',  icon: 'database', color: '#29b5e8' },
  { id: 'bigquery',   label: 'BigQuery',   icon: 'database', color: '#4285f4' },
  { id: 'postgres',   label: 'PostgreSQL', icon: 'database', color: '#336791' },
  { id: 'csv',        label: 'CSV / Excel',icon: 'table',    color: '#10b981' },
  { id: 'databricks', label: 'Databricks', icon: 'model',    color: '#ff3621' },
];

export function OnboardingFlow({ onComplete }: { onComplete: (mode: AppMode) => void }) {
  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState('');
  const [source, setSource] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createProject, createSession, loadSession } = useSessionStore();

  const stepLabels = ['Problem Statement', 'Connect Data', 'Choose Mode'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="slide-up" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-light)', borderRadius: 16, width: 540, maxWidth: '95vw', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '20px 28px 0' }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < 2 ? undefined : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? '#10b981' : i === step ? 'var(--accent)' : 'var(--surface-3)',
                  border: i === step ? 'none' : `1.5px solid ${i < step ? '#10b981' : 'var(--border-light)'}`,
                  fontSize: 11, fontWeight: 700, color: i <= step ? '#fff' : 'var(--text-muted)',
                }}>
                  {i < step ? <Icon name="check" size={13} color="#fff" /> : i + 1}
                </div>
                <span style={{ fontSize: 12, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: i < step ? '#10b981' : 'var(--border)', minWidth: 20 }} />}
            </div>
          ))}
        </div>

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Step 0: Problem */}
          {step === 0 && (
            <div className="fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>What are you trying to figure out?</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
                Describe your analytical objective. The agent will structure this into a task graph.
              </p>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
                placeholder="e.g. Analyze Q1–Q3 revenue performance across product lines and regions…"
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.6 }}
              />
              <button disabled={!problem.trim()} onClick={() => setStep(1)} style={{ marginTop: 14, padding: '10px 24px', borderRadius: 9, background: problem.trim() ? 'var(--accent)' : 'var(--surface-3)', border: 'none', color: problem.trim() ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: problem.trim() ? 'pointer' : 'default', width: '100%' }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 1: Data source */}
          {step === 1 && (
            <div className="fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>Connect your data</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
                Select a source. OpenLens will ingest a snapshot and surface the schema fingerprint.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {SOURCES.map((s) => (
                  <button key={s.id} onClick={() => setSource(s.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: source === s.id ? 'var(--accent-dim)' : 'var(--surface-2)',
                    border: source === s.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 10, padding: '11px 14px', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={s.icon} size={14} color={s.color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{s.label}</span>
                    {source === s.id && <Icon name="check" size={14} color="var(--accent)" style={{ marginLeft: 'auto' }} />}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(0)} style={{ padding: '10px 20px', borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>← Back</button>
                <button disabled={!source} onClick={() => setStep(2)} style={{ flex: 1, padding: '10px 24px', borderRadius: 9, background: source ? 'var(--accent)' : 'var(--surface-3)', border: 'none', color: source ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: source ? 'pointer' : 'default' }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2: Mode */}
          {step === 2 && (
            <div className="fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>How do you want to work?</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
                Choose a lens. You can switch at any time from the top navigation.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {([
                  { id: 'analyst' as AppMode, label: 'Analyst Mode', desc: 'See code, reasoning traces, and full tool call logs. Edit and fork any step. Designed for technical users who want full transparency.', color: '#d4954a' },
                  { id: 'business' as AppMode, label: 'Business Mode', desc: 'Narrative-first outputs, suggested next steps, and plain-English summaries. Code is hidden by default. Designed for non-technical stakeholders.', color: '#10b981' },
                ]).map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)} style={{
                    display: 'flex', gap: 14, textAlign: 'left',
                    background: mode === m.id ? `${m.color}12` : 'var(--surface-2)',
                    border: mode === m.id ? `1.5px solid ${m.color}60` : '1px solid var(--border)',
                    borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, marginTop: 1, background: `${m.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={m.id === 'analyst' ? 'code' : 'narrative'} size={17} color={m.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.desc}</div>
                    </div>
                    {mode === m.id && <div style={{ marginLeft: 'auto', alignSelf: 'center', flexShrink: 0 }}><Icon name="check" size={16} color={m.color} /></div>}
                  </button>
                ))}
              </div>
              {submitError && (
                <div style={{ marginBottom: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: 12.5, color: '#ef4444' }}>
                  {submitError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(1)} style={{ padding: '10px 20px', borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>← Back</button>
                <button
                  disabled={!mode || submitting}
                  onClick={async () => {
                    if (!mode) return;
                    setSubmitting(true);
                    setSubmitError(null);
                    try {
                      const projectId = await createProject(problem.slice(0, 60));
                      const sessionId = await createSession(projectId, problem.slice(0, 60), problem, mode);
                      await loadSession(projectId, sessionId);
                      onComplete(mode);
                    } catch (e) {
                      setSubmitError((e as Error).message);
                      setSubmitting(false);
                    }
                  }}
                  style={{ flex: 1, padding: '10px 24px', borderRadius: 9, background: mode && !submitting ? 'var(--accent)' : 'var(--surface-3)', border: 'none', color: mode && !submitting ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: mode && !submitting ? 'pointer' : 'default' }}
                >
                  {submitting ? 'Creating session…' : 'Launch Session →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}