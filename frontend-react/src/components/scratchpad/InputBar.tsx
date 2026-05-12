import { useState } from 'react';
import { Icon } from '../icons';
import type { AppMode } from '../../types';
import { SUGGESTED_PROMPTS } from '../../data/mockSession';
import { useSessionStore } from '../../store/useSessionStore';

export function InputBar({ mode }: { mode: AppMode }) {
  const [value, setValue] = useState('');
  const { submitMessage, wsConnected } = useSessionStore();
  const disabled = wsConnected; // block while a step is streaming

  const handleSend = () => {
    const msg = value.trim();
    if (!msg || disabled) return;
    submitMessage(msg);
    setValue('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ padding: '12px 20px 16px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
      {mode === 'business' && (
        <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => setValue(p)}
              disabled={disabled}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 99, padding: '5px 12px', cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 12, color: 'var(--text-secondary)', opacity: disabled ? 0.5 : 1,
              }}
            >{p}</button>
          ))}
        </div>
      )}
      <div
        style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: 'var(--surface-2)', border: `1px solid ${disabled ? 'var(--border)' : 'var(--border-light)'}`,
          borderRadius: 12, padding: '10px 14px',
          boxShadow: '0 0 0 0 transparent', transition: 'box-shadow 0.2s',
          opacity: disabled ? 0.7 : 1,
        }}
        onFocus={(e) => { if (!disabled) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 2px rgba(212,149,74,0.3)'; }}
        onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 0 transparent'; }}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          rows={1}
          placeholder={
            disabled ? 'Agent is running…' :
            mode === 'analyst' ? 'Instruct the agent, edit code, or run a query…' :
            'Ask a question about your data…'
          }
          style={{
            flex: 1, background: 'none', border: 'none', resize: 'none',
            color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
            outline: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: value.trim() && !disabled ? 'var(--accent)' : 'var(--surface-3)',
            border: 'none', cursor: value.trim() && !disabled ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          {disabled
            ? <Icon name="spinner" size={15} color="var(--text-muted)" />
            : <Icon name="send" size={15} color={value.trim() ? '#fff' : 'var(--text-muted)'} />
          }
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 7, display: 'flex', gap: 14 }}>
        <span>↵ Send · ⇧↵ Newline</span>
        <span>Try: <em style={{ color: 'var(--text-secondary)' }}>"Generate narrative"</em> · <em style={{ color: 'var(--text-secondary)' }}>"Create checkpoint"</em></span>
      </div>
    </div>
  );
}
