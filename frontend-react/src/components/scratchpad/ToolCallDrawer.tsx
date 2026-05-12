import { useState } from 'react';
import { Icon } from '../icons';
import type { ToolCall } from '../../types';

export function ToolCallDrawer({ toolCalls, showByDefault = false }: { toolCalls: ToolCall[]; showByDefault?: boolean }) {
  const [open, setOpen] = useState(showByDefault);
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
        <Icon name="tool" size={13} />
        <span>Tool calls</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-3)', borderRadius: 99, padding: '0 6px' }}>
          {toolCalls.length}
        </span>
      </button>
      {open && (
        <div className="fade-in" style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {toolCalls.map((tc, i) => (
            <div key={i} style={{
              background: 'var(--code-bg)', borderRadius: 7,
              border: '1px solid var(--border)', padding: '7px 12px',
              fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)',
            }}>
              <span style={{ color: '#f59e0b' }}>{tc.tool_name}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                ({Object.entries(tc.inputs).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')})
              </span>
              {tc.error && (
                <div style={{ marginTop: 4, color: '#ef4444', fontSize: 11 }}>
                  Error: {tc.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
