import { Icon } from '../icons';

export function ComingSoon({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'var(--bg)', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'fixed', top: 16, left: 20,
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
          fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to session
      </button>

      {/* Centered content */}
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 28px',
          background: 'var(--accent-dim)', border: '1px solid rgba(212,149,74,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="dashboard" size={28} color="var(--accent)" />
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 12, letterSpacing: '-0.02em',
        }}>
          Dashboard Builder
        </h1>
        <p style={{
          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32,
        }}>
          Compose live dashboards from your session artifacts — charts, tables, key findings, and narratives — without leaving OpenLens.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 99, padding: '8px 20px',
          fontSize: 13, color: 'var(--text-muted)', fontWeight: 500,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
          Coming in v2
        </div>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {[
            { icon: 'chart',    label: 'Drag-and-drop artifact canvas' },
            { icon: 'table',    label: 'Live data tables from session artifacts' },
            { icon: 'finding',  label: 'Key findings & narrative blocks' },
            { icon: 'session',  label: 'Share dashboards across sessions' },
          ].map((f) => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: 'var(--surface-1)',
              border: '1px solid var(--border)', borderRadius: 10,
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={15} color="var(--text-muted)" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
