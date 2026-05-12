import { useEffect, useRef, useState, useCallback } from 'react';
import { Icon } from '../icons';
import { useSessionStore } from '../../store/useSessionStore';
import * as api from '../../api';
import type { ContextPadEntry } from '../../types';

export function ContextPadPanel({ onClose }: { onClose: () => void }) {
  const { currentSessionId, currentProjectId } = useSessionStore();

  // Free-form text (session-scoped "text" entry)
  const [text, setText] = useState('');
  const [textEntryId, setTextEntryId] = useState<string | null>(null);

  // Key-value table (session-scoped "table" entry stored as JSON)
  const [tableRows, setTableRows] = useState<{ key: string; value: string }[]>([]);
  const [tableEntryId, setTableEntryId] = useState<string | null>(null);

  // Project-scoped instruction entries shown as toggles
  const [instructions, setInstructions] = useState<ContextPadEntry[]>([]);

  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing entries on open
  useEffect(() => {
    if (!currentSessionId || !currentProjectId) return;
    (async () => {
      const [sessionEntries, projectEntries] = await Promise.all([
        api.listSessionContextEntries(currentSessionId),
        api.listProjectContextEntries(currentProjectId),
      ]);
      const textEntry = sessionEntries.find((e) => e.content_type === 'text');
      if (textEntry) { setText(textEntry.content); setTextEntryId(textEntry.id); }

      const tableEntry = sessionEntries.find((e) => e.content_type === 'table');
      if (tableEntry) {
        try { setTableRows(JSON.parse(tableEntry.content)); } catch { /* ignore */ }
        setTableEntryId(tableEntry.id);
      } else {
        setTableRows([{ key: '', value: '' }]);
      }

      setInstructions(projectEntries.filter((e) => e.content_type === 'instruction'));
    })();
  }, [currentSessionId, currentProjectId]);

  const saveText = useCallback(async (value: string) => {
    if (!currentSessionId) return;
    setSaving(true);
    try {
      if (textEntryId) {
        await api.updateContextEntry(textEntryId, { content: value });
      } else {
        const entry = await api.createSessionContextEntry(currentSessionId, 'text', value);
        setTextEntryId(entry.id);
      }
    } finally {
      setSaving(false);
    }
  }, [currentSessionId, textEntryId]);

  const saveTable = useCallback(async (rows: { key: string; value: string }[]) => {
    if (!currentSessionId) return;
    const content = JSON.stringify(rows);
    if (tableEntryId) {
      await api.updateContextEntry(tableEntryId, { content });
    } else {
      const entry = await api.createSessionContextEntry(currentSessionId, 'table', content);
      setTableEntryId(entry.id);
    }
  }, [currentSessionId, tableEntryId]);

  const toggleInstruction = async (entry: ContextPadEntry) => {
    const newPriority = entry.priority >= 0 ? -1 : 0;
    await api.updateContextEntry(entry.id, { priority: newPriority });
    setInstructions((prev) => prev.map((e) => e.id === entry.id ? { ...e, priority: newPriority } : e));
  };

  const sl = { fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', marginBottom: 7, textTransform: 'uppercase' } as const;
  const inputBase = { width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 12.5, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' } as const;

  return (
    <div className="panel-slide-in side-panel-overlay" style={{ width: '100%', height: '100%', background: 'var(--surface-1)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.3)' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Context Pad</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Shared with agent.{saving && <span style={{ marginLeft: 6, color: 'var(--accent)' }}>Saving…</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}>
            <Icon name="close" size={15} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* Free-form instructions */}
        <div style={{ marginBottom: 18 }}>
          <div style={sl}>Instructions &amp; Assumptions</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => saveText(e.target.value)}
            rows={4}
            placeholder="Add free-form context, constraints, or instructions for the agent…"
            style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6, minHeight: 88 }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(212,149,74,0.5)')}
          />
        </div>

        {/* Key-value table */}
        <div style={{ marginBottom: 18 }}>
          <div style={sl}>Key–Value Context</div>
          <div style={{ background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {tableRows.map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', borderBottom: i < tableRows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <input
                  value={row.key}
                  onChange={(e) => setTableRows((r) => r.map((x, ri) => ri === i ? { ...x, key: e.target.value } : x))}
                  onBlur={() => saveTable(tableRows)}
                  placeholder="Key"
                  style={{ flex: '0 0 44%', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', padding: '7px 10px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'inherit', outline: 'none', fontWeight: 500 }}
                />
                <input
                  value={row.value}
                  onChange={(e) => setTableRows((r) => r.map((x, ri) => ri === i ? { ...x, value: e.target.value } : x))}
                  onBlur={() => saveTable(tableRows)}
                  placeholder="Value"
                  style={{ flex: 1, background: 'transparent', border: 'none', padding: '7px 10px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => { const next = [...tableRows, { key: '', value: '' }]; setTableRows(next); }}
            style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-muted)', padding: '3px 0' }}
          >
            <Icon name="plus" size={12} /> Add row
          </button>
        </div>

        {/* Image upload (local only — file storage not yet wired) */}
        <div style={{ marginBottom: 18 }}>
          <div style={sl}>Images / Charts</div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
            style={{
              border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border-light)'}`,
              borderRadius: 8, padding: '14px 12px',
              background: dragOver ? 'var(--accent-dim)' : 'var(--surface-2)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
            }}
          >
            <Icon name="upload" size={18} color={dragOver ? '#d4954a' : 'var(--text-muted)'} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Drop images or <span style={{ color: 'var(--accent)', fontWeight: 600 }}>browse</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>File storage coming soon</div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} />
          </div>
        </div>

        {/* Project-scoped instruction entries as toggleable assumptions */}
        {instructions.length > 0 && (
          <div>
            <div style={sl}>Project Assumptions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {instructions.map((entry) => {
                const active = entry.priority >= 0;
                return (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8,
                    opacity: active ? 1 : 0.55, transition: 'opacity 0.2s',
                  }}>
                    <button
                      onClick={() => toggleInstruction(entry)}
                      style={{ background: 'none', border: 'none', padding: 0, flexShrink: 0, display: 'flex', cursor: 'pointer' }}
                    >
                      <Icon name={active ? 'toggleOn' : 'toggleOff'} size={20} color={active ? '#d4954a' : 'var(--text-muted)'} />
                    </button>
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{entry.content}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 99, padding: '2px 7px', background: 'rgba(14,165,233,0.1)', color: '#7dd3fc', flexShrink: 0 }}>Project</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
