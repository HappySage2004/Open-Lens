import { Icon } from '../icons';

interface MockChartProps {
  chartId?: string;
  running?: boolean;
  height?: number;
}

export function MockChart({ chartId, running, height = 200 }: MockChartProps) {
  if (running || (chartId && chartId.includes('deal_dist'))) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, color: 'var(--text-muted)', fontSize: 13,
        background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)',
      }}>
        <Icon name="spinner" size={16} color="#d4954a" />
        <span>Rendering chart…</span>
      </div>
    );
  }

  const bars = chartId === 'chart_revenue_region'
    ? [
        { label: 'NA',    values: [78, 62] },
        { label: 'EMEA',  values: [55, 48] },
        { label: 'APAC',  values: [42, 34] },
        { label: 'LATAM', values: [22, 24] },
      ]
    : [
        { label: 'Q1', values: [60, 52] },
        { label: 'Q2', values: [65, 53] },
        { label: 'Q3', values: [58, 47] },
      ];

  const maxVal = 90;
  const chartH = height - 48;

  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '16px 20px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#d4954a', display: 'inline-block' }} />
          2025
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(212,149,74,0.3)', display: 'inline-block' }} />
          2024
        </span>
      </div>
      <svg width="100%" height={chartH} viewBox={`0 0 ${bars.length * 80} ${chartH}`} preserveAspectRatio="none">
        {bars.map((bar, i) => {
          const x = i * 80 + 10;
          const bw = 20;
          return (
            <g key={i}>
              <rect x={x} y={chartH - (bar.values[0] / maxVal) * chartH} width={bw} height={(bar.values[0] / maxVal) * chartH} fill="#d4954a" rx="2" opacity="0.9" />
              <rect x={x + bw + 3} y={chartH - (bar.values[1] / maxVal) * chartH} width={bw} height={(bar.values[1] / maxVal) * chartH} fill="rgba(212,149,74,0.3)" rx="2" />
              <text x={x + bw + 1} y={chartH + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{bar.label}</text>
            </g>
          );
        })}
        <line x1="0" y1={chartH} x2={bars.length * 80} y2={chartH} stroke="var(--border)" strokeWidth="1" />
      </svg>
    </div>
  );
}