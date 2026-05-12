import { Icon } from '../icons';
import { ARTIFACT_CONFIG } from '../../data/mockSession';
import type { Artifact } from '../../types';
import { useSessionStore } from '../../store/useSessionStore';

export function InlineArtifactBadge({ artId, artifacts, mode }: { artId: string; artifacts: Artifact[]; mode: string }) {
  const art = artifacts.find((a) => a.id === artId);
  const { expandedArtifacts, toggleArtifact, setActiveArtifact, activeArtifact } = useSessionStore();
  if (!art) return null;

  const cfg = ARTIFACT_CONFIG[art.type] ?? ARTIFACT_CONFIG.Chart;
  const isActive = activeArtifact === artId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expandedArtifacts.has(artId)) toggleArtifact(artId);
    setActiveArtifact(artId);
    setTimeout(() => setActiveArtifact(null), 1800);
  };

  return (
    <button
      onClick={handleClick}
      title={`View "${art.name}" in artifact panel`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: mode === 'analyst' ? 5 : 0,
        background: isActive ? cfg.bg : 'transparent',
        border: isActive ? `1px solid ${cfg.color}40` : '1px solid transparent',
        borderRadius: 6, padding: '3px 8px 3px 6px',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.18s',
        color: isActive ? cfg.color : 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = cfg.bg;
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${cfg.color}40`;
        (e.currentTarget as HTMLButtonElement).style.color = cfg.color;
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
        }
      }}
    >
      {mode === 'analyst' && (
        <span style={{ opacity: 0.7 }}>
          <Icon name={cfg.icon} size={11} color="currentColor" />
        </span>
      )}
      <span style={{ fontSize: 11.5, fontWeight: 500 }}>{art.name}</span>
      <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 3 }}>↗</span>
    </button>
  );
}

export function StepArtifactRow({ artifactIds, artifacts, mode }: { artifactIds: string[]; artifacts: Artifact[]; mode: string }) {
  if (!artifactIds || artifactIds.length === 0) return null;
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 4,
      padding: '5px 15px',
      borderTop: '1px solid var(--border)',
    }}>
      {artifactIds.map((aid) => (
        <InlineArtifactBadge key={aid} artId={aid} artifacts={artifacts} mode={mode} />
      ))}
    </div>
  );
}
