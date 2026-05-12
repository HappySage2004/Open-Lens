import type { StepStatus } from '../../types';

export function StepStatusDot({ status }: { status: StepStatus }) {
  if (status === 'running') {
    return (
      <span style={{
        width: 10, height: 10, borderRadius: '50%',
        background: '#d4954a', flexShrink: 0, marginTop: 3,
        boxShadow: '0 0 0 3px rgba(212,149,74,0.25)',
        animation: 'pulse 2s infinite',
        display: 'inline-block',
      }} />
    );
  }
  const color =
    status === 'completed' ? '#10b981' :
    status === 'failed'    ? '#ef4444' : '#475569';
  return (
    <span style={{
      width: 10, height: 10, borderRadius: '50%',
      background: status === 'completed' ? color : 'transparent',
      border: `2px solid ${color}`,
      flexShrink: 0, marginTop: 3,
      display: 'inline-block',
    }} />
  );
}
