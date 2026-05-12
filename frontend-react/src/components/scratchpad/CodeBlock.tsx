import { useState } from 'react';
import { Icon } from '../icons';

export function CodeBlock({ code, running, showByDefault = true }: { code: string; running?: boolean; showByDefault?: boolean }) {
  const [visible, setVisible] = useState(showByDefault);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, padding: 0,
        }}
      >
        <Icon name={visible ? 'chevronDown' : 'chevronRight'} size={13} />
        <Icon name="code" size={13} />
        <span>Code</span>
        {running && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d4954a', marginLeft: 4 }}>
            <Icon name="spinner" size={12} color="#d4954a" />running
          </span>
        )}
      </button>
      {visible && (
        <div style={{ marginTop: 6, position: 'relative' }}>
          <pre style={{
            background: 'var(--code-bg)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '14px 16px',
            fontSize: 12, lineHeight: 1.7, color: 'var(--code-text)',
            overflowX: 'auto', fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
            margin: 0,
          }}>
            <code>{code}</code>
          </pre>
          <div style={{ position: 'absolute', top: 8, right: 10, display: 'flex', gap: 6 }}>
            <button
              onClick={handleCopy}
              style={{
                background: 'var(--surface-3)', border: '1px solid var(--border)',
                borderRadius: 5, padding: '3px 8px', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Icon name="copy" size={11} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button style={{
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              borderRadius: 5, padding: '3px 8px', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon name="fork" size={11} />
              Fork
            </button>
          </div>
        </div>
      )}
    </div>
  );
}