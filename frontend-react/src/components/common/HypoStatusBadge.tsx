import type { HypothesisStatus } from '../../types';

const STATUS_CONFIG: Record<HypothesisStatus, { color: string; bg: string }> = {
  Supported:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Active:       { color: '#d4954a', bg: 'rgba(212,149,74,0.12)' },
  Refuted:      { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  Inconclusive: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

export function HypoStatusBadge({ status }: { status: HypothesisStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Inconclusive;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
      color: cfg.color, background: cfg.bg,
      padding: '2px 8px', borderRadius: 99,
    }}>
      {status}
    </span>
  );
}