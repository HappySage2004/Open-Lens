import { useState } from 'react';
import { Icon } from '../icons';
import type { ReasoningBlock } from '../../types';

export function ReasoningDrawer({ reasoning, showByDefault = false }: { reasoning: ReasoningBlock; showByDefault?: boolean }) {
  const [open, setOpen] = useState(showByDefault);
  const hasContent = reasoning.objective || reasoning.approach || reasoning.dependencies.length > 0 || reasoning.risks.length > 0;

  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, padding: 0,
        }}
      >
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={13} />
        <Icon name="brain" size={13} />
        <span>Reasoning</span>
      </button>
      {open && (
        <div className="fade-in" style={{
          marginTop: 6, padding: '10px 14px',
          background: 'rgba(212,149,74,0.06)',
          border: '1px solid rgba(212,149,74,0.18)',
          borderRadius: 8, fontSize: 12.5, lineHeight: 1.65,
          color: 'var(--text-secondary)',
        }}>
          {!hasContent && <em style={{ color: 'var(--text-muted)' }}>No reasoning recorded for this step.</em>}
          {reasoning.objective && (
            <p style={{ marginBottom: reasoning.approach ? 6 : 0 }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Objective&nbsp;</strong>
              {reasoning.objective}
            </p>
          )}
          {reasoning.approach && (
            <p style={{ marginBottom: reasoning.dependencies.length > 0 ? 6 : 0 }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Approach&nbsp;</strong>
              {reasoning.approach}
            </p>
          )}
          {reasoning.dependencies.length > 0 && (
            <p style={{ marginBottom: reasoning.risks.length > 0 ? 6 : 0 }}>
              <strong style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Depends on&nbsp;</strong>
              {reasoning.dependencies.join(', ')}
            </p>
          )}
          {reasoning.risks.length > 0 && (
            <p>
              <strong style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Risks&nbsp;</strong>
              {reasoning.risks.join('; ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
