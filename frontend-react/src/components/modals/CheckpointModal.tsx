import { useState } from 'react';
import { Icon } from '../icons';

const EXISTING_CHECKPOINTS = [
  { name: 'After data load', ts: '08:14', steps: 1 },
  { name: 'Post-cleaning',   ts: '08:16', steps: 2 },
];

export function CheckpointModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    setSaved(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={onClose}
    >
      <div className="slide-up" onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface-1)', border: '1px solid var(--border-light)',
        borderRadius: 14, width: 460, maxWidth: '95vw',
        boxShadow: '0 20px 56px rgba(0,0,0,0.6)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(212,149,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="checkpoint" size={14} color="#d4954a" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Checkpoints</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Snapshot kernel state &amp; session context</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div style={{ padding: '16px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 8 }}>SAVED CHECKPOINTS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
            {EXISTING_CHECKPOINTS.map((cp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <Icon name="checkpoint" size={13} color="var(--text-muted)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{cp.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cp.steps} steps · {cp.ts} UTC</div>
                </div>
                <button style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Restore
                </button>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 8 }}>CREATE NEW</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Checkpoint name…"
              autoFocus
              style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }}
            />
            <button onClick={handleSave} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: saved ? '#10b981' : name.trim() ? 'var(--accent)' : 'var(--surface-3)',
              color: name.trim() || saved ? '#fff' : 'var(--text-muted)',
              fontWeight: 600, fontSize: 13, cursor: name.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s',
            }}>
              {saved ? <><Icon name="check" size={13} color="#fff" /> Saved!</> : 'Save'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            Captures full kernel state, session summary, task graph, and artifact inventory. Restoring resumes without re-execution.
          </div>
        </div>
      </div>
    </div>
  );
}