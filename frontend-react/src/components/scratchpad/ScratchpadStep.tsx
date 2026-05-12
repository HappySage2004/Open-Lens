import { useState } from 'react';
import { Icon } from '../icons';
import { StepStatusDot } from '../common/StepStatusDot';
import { ReasoningDrawer } from './ReasoningDrawer';
import { ToolCallDrawer } from './ToolCallDrawer';
import { StepArtifactRow } from './ArtifactBadge';
import type { Step, Artifact, AppMode } from '../../types';

interface Props {
  step: Step;
  artifacts: Artifact[];
  mode: AppMode;
  index: number;
}

export function ScratchpadStep({ step, artifacts, mode, index }: Props) {
  const analyst = mode === 'analyst';
  const [expanded, setExpanded] = useState(step.status === 'running' || index >= 2);

  const hasOutput = step.output.stdout || step.output.stderr || step.output.display_data.length > 0;

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--surface-1)',
        border: step.status === 'running' ? '1px solid rgba(212,149,74,0.35)' : '1px solid var(--border)',
        borderRadius: 10, overflow: 'hidden',
        boxShadow: step.status === 'running' ? '0 0 0 3px rgba(212,149,74,0.07)' : 'none',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 11,
          padding: '11px 15px', cursor: 'pointer',
          background: step.status === 'running' ? 'rgba(212,149,74,0.03)' : 'transparent',
          userSelect: 'none',
        }}
      >
        <StepStatusDot status={step.status} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              STEP {String(index + 1).padStart(2, '0')}
            </span>
            {step.status === 'running' && (
              <span style={{ fontSize: 10.5, color: '#d4954a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon name="spinner" size={10} color="#d4954a" /> Running
              </span>
            )}
            {step.status === 'failed' && (
              <span style={{ fontSize: 10.5, color: '#ef4444', fontWeight: 600 }}>Failed</span>
            )}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {step.user_message || `Step ${index + 1}`}
          </p>
        </div>
        <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={14} color="var(--text-muted)" />
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 15px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ height: 10 }} />

          {analyst && <ReasoningDrawer reasoning={step.reasoning_block} showByDefault />}
          {analyst && step.tool_calls.length > 0 && <ToolCallDrawer toolCalls={step.tool_calls} showByDefault={false} />}
          {!analyst && (
            <button
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, padding: 0, marginBottom: 4 }}
            >
              <Icon name="brain" size={12} /> <span>Show reasoning</span>
            </button>
          )}

          {/* Output */}
          {hasOutput && (
            <div style={{ marginTop: 10 }}>
              {step.output.stdout && (
                <div style={{
                  background: 'var(--code-bg)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 13px',
                  fontFamily: 'monospace', fontSize: 12,
                  color: 'var(--code-text)', lineHeight: 1.65, whiteSpace: 'pre-wrap',
                }}>
                  {step.output.stdout}
                </div>
              )}
              {step.output.stderr && (
                <div style={{
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8, padding: '10px 13px', marginTop: 6,
                  fontFamily: 'monospace', fontSize: 12,
                  color: '#ef4444', lineHeight: 1.65, whiteSpace: 'pre-wrap',
                }}>
                  {step.output.stderr}
                </div>
              )}
            </div>
          )}

          {/* Uncertainty flags */}
          {step.uncertainty_flags.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)',
              borderRadius: 8, padding: '8px 12px', marginTop: 8,
            }}>
              <Icon name="warning" size={13} color="#f59e0b" />
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {f.severity} confidence
                </span>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Artifact badge row — always visible */}
      <StepArtifactRow artifactIds={step.artifact_ids} artifacts={artifacts} mode={mode} />
    </div>
  );
}
