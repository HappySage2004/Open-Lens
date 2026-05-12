import { useRef, useState } from 'react';
import { Icon } from '../icons';

export function PersonalNotesPanel({ onClose }: { onClose: () => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    updateFormats();
  };

  const updateFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
    });
  };

  const toolBtn = (label: string, icon: string, cmd: string, value?: string) => {
    const active = activeFormats[cmd];
    return (
      <button
        key={cmd + label}
        onMouseDown={(e) => { e.preventDefault(); exec(cmd, value); }}
        title={label}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 6, border: 'none',
          background: active ? 'var(--accent-dim)' : 'transparent',
          cursor: 'pointer', color: active ? '#d4954a' : 'var(--text-muted)',
        }}
      >
        <Icon name={icon} size={13} color="currentColor" />
      </button>
    );
  };

  return (
    <div className="panel-slide-in side-panel-overlay" style={{ width: '100%', height: '100%', background: 'var(--surface-1)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.3)' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Personal Notes</div>
            <div style={{ fontSize: 11.5, fontStyle: 'italic', color: '#d97706' }}>Private — not shared with agent</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}>
            <Icon name="close" size={15} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface-2)' }}>
        {toolBtn('Bold', 'bold', 'bold')}
        {toolBtn('Italic', 'italic', 'italic')}
        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
        <button onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<h3>'); updateFormats(); }}
          title="Heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Icon name="heading" size={13} color="currentColor" />
        </button>
        {toolBtn('Bullet list', 'listBullet', 'insertUnorderedList')}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyUp={updateFormats}
          onMouseUp={updateFormats}
          data-placeholder="Start typing your private notes here…"
          className="rich-editor"
          style={{ minHeight: '100%', fontSize: 13.5, lineHeight: 1.75, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  );
}