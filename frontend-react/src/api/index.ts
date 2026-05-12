import { apiFetch } from './client';
import type {
  Project, Session, SessionSettings, Step, Artifact, Hypothesis, ContextPadEntry, TaskNode,
} from '../types';

// ── Adapters: map backend response fields to frontend types ───────────────────

function adaptTaskNode(n: Record<string, unknown>, allNodes: Record<string, unknown>[]): TaskNode {
  const nodeId = n.node_id as string;
  const depends = (n.depends_on as string[]) ?? [];
  // Compute depth: max depth of dependencies + 1, or 0 if no deps
  const depth = depends.length === 0 ? 0 : Math.max(
    ...depends.map((depId) => {
      const dep = allNodes.find((x) => (x.node_id as string) === depId);
      return dep ? adaptTaskNode(dep, allNodes).depth + 1 : 1;
    }),
  );
  return {
    id: nodeId,
    title: n.label as string,
    status: n.status as TaskNode['status'],
    depends_on: depends,
    depth,
  };
}

function adaptSession(raw: Record<string, unknown>): Session {
  const nodes = (raw.task_graph as { nodes: Record<string, unknown>[] })?.nodes ?? [];
  return {
    id: (raw._id ?? raw.id) as string,
    project_id: raw.project_id as string,
    title: raw.title as string,
    problem_statement: (raw.problem_statement as string) ?? '',
    task_graph: { nodes: nodes.map((n) => adaptTaskNode(n, nodes)) },
    settings: (raw.settings as Session['settings']) ?? {
      model_id: 'claude-sonnet-4-6',
      reasoning_effort: 'medium',
      auto_promote_artifacts: true,
      show_uncertainty_flags: true,
      suggest_next_steps: true,
      stream_reasoning: true,
    },
    data_snapshot_ref: (raw.data_snapshot_ref as string | null) ?? null,
    step_ids: ((raw.step_ids as string[]) ?? []).map(String),
    artifact_ids: ((raw.artifact_ids as string[]) ?? []).map(String),
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

function adaptStep(raw: Record<string, unknown>): Step {
  return {
    id: (raw._id ?? raw.id) as string,
    session_id: raw.session_id as string,
    sequence_number: raw.sequence_number as number,
    user_message: (raw.user_message as string) ?? '',
    reasoning_block: (raw.reasoning_block as Step['reasoning_block']) ?? { objective: '', approach: '', dependencies: [], risks: [] },
    tool_calls: (raw.tool_calls as Step['tool_calls']) ?? [],
    output: (raw.output as Step['output']) ?? { stdout: '', stderr: '', display_data: [] },
    artifact_ids: ((raw.artifact_ids as string[]) ?? []).map(String),
    uncertainty_flags: (raw.uncertainty_flags as Step['uncertainty_flags']) ?? [],
    status: raw.status as Step['status'],
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

function adaptArtifact(raw: Record<string, unknown>): Artifact {
  return {
    id: (raw._id ?? raw.id) as string,
    session_id: raw.session_id as string,
    step_id: (raw.step_id as string | null) ?? null,
    type: raw.type as Artifact['type'],
    name: raw.name as string,
    payload: (raw.payload as Record<string, unknown>) ?? {},
    tags: (raw.tags as string[]) ?? [],
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

function adaptHypothesis(raw: Record<string, unknown>): Hypothesis {
  return {
    id: (raw._id ?? raw.id) as string,
    session_id: raw.session_id as string,
    statement: raw.statement as string,
    status: raw.status as Hypothesis['status'],
    evidence_artifact_ids: ((raw.evidence_artifact_ids as string[]) ?? []).map(String),
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

function adaptContextEntry(raw: Record<string, unknown>): ContextPadEntry {
  return {
    id: (raw._id ?? raw.id) as string,
    scope: raw.scope as ContextPadEntry['scope'],
    scope_id: raw.scope_id as string,
    content_type: raw.content_type as ContextPadEntry['content_type'],
    content: raw.content as string,
    priority: (raw.priority as number) ?? 0,
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

function adaptProject(raw: Record<string, unknown>): Project {
  return {
    id: (raw._id ?? raw.id) as string,
    title: raw.title as string,
    description: (raw.description as string) ?? '',
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

// ── Project endpoints ─────────────────────────────────────────────────────────

export async function createProject(title: string, description = ''): Promise<Project> {
  const raw = await apiFetch<Record<string, unknown>>('/projects', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
  return adaptProject(raw);
}

export async function listProjects(): Promise<Project[]> {
  const raw = await apiFetch<Record<string, unknown>[]>('/projects');
  return raw.map(adaptProject);
}

export async function getProject(projectId: string): Promise<Project> {
  const raw = await apiFetch<Record<string, unknown>>(`/projects/${projectId}`);
  return adaptProject(raw);
}

// ── Session endpoints ─────────────────────────────────────────────────────────

export async function createSession(
  projectId: string,
  title: string,
  problemStatement: string,
  settings?: Partial<SessionSettings>,
): Promise<Session> {
  const raw = await apiFetch<Record<string, unknown>>(`/projects/${projectId}/sessions`, {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      title,
      problem_statement: problemStatement,
      settings: settings ?? {},
    }),
  });
  return adaptSession(raw);
}

export async function getSession(projectId: string, sessionId: string): Promise<Session> {
  const raw = await apiFetch<Record<string, unknown>>(`/projects/${projectId}/sessions/${sessionId}`);
  return adaptSession(raw);
}

export async function listSessions(projectId: string): Promise<Session[]> {
  const raw = await apiFetch<Record<string, unknown>[]>(`/projects/${projectId}/sessions`);
  return raw.map(adaptSession);
}

export async function updateSession(
  projectId: string,
  sessionId: string,
  patch: { title?: string; problem_statement?: string; settings?: Partial<SessionSettings> },
): Promise<Session> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/projects/${projectId}/sessions/${sessionId}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  );
  return adaptSession(raw);
}

// ── Step endpoints ────────────────────────────────────────────────────────────

export async function listSteps(sessionId: string): Promise<Step[]> {
  const raw = await apiFetch<Record<string, unknown>[]>(`/sessions/${sessionId}/steps`);
  return raw.map(adaptStep);
}

// ── Artifact endpoints ────────────────────────────────────────────────────────

export async function listArtifacts(sessionId: string, type?: string): Promise<Artifact[]> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  const raw = await apiFetch<Record<string, unknown>[]>(`/sessions/${sessionId}/artifacts${qs}`);
  return raw.map(adaptArtifact);
}

export async function updateArtifact(
  sessionId: string,
  artifactId: string,
  patch: { name?: string; tags?: string[] },
): Promise<Artifact> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/sessions/${sessionId}/artifacts/${artifactId}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  );
  return adaptArtifact(raw);
}

// ── Hypothesis endpoints ──────────────────────────────────────────────────────

export async function listHypotheses(sessionId: string): Promise<Hypothesis[]> {
  const raw = await apiFetch<Record<string, unknown>[]>(`/sessions/${sessionId}/hypotheses`);
  return raw.map(adaptHypothesis);
}

export async function updateHypothesis(
  sessionId: string,
  hypothesisId: string,
  patch: { statement?: string; status?: string; evidence_artifact_ids?: string[] },
): Promise<Hypothesis> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/sessions/${sessionId}/hypotheses/${hypothesisId}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  );
  return adaptHypothesis(raw);
}

// ── Context Pad endpoints ─────────────────────────────────────────────────────

export async function listSessionContextEntries(sessionId: string): Promise<ContextPadEntry[]> {
  const raw = await apiFetch<Record<string, unknown>[]>(`/sessions/${sessionId}/context-pad`);
  return raw.map(adaptContextEntry);
}

export async function listProjectContextEntries(projectId: string): Promise<ContextPadEntry[]> {
  const raw = await apiFetch<Record<string, unknown>[]>(`/projects/${projectId}/context-pad`);
  return raw.map(adaptContextEntry);
}

export async function createSessionContextEntry(
  sessionId: string,
  contentType: ContextPadEntry['content_type'],
  content: string,
  priority = 0,
): Promise<ContextPadEntry> {
  const raw = await apiFetch<Record<string, unknown>>(`/sessions/${sessionId}/context-pad`, {
    method: 'POST',
    body: JSON.stringify({ scope: 'session', scope_id: sessionId, content_type: contentType, content, priority }),
  });
  return adaptContextEntry(raw);
}

export async function updateContextEntry(
  entryId: string,
  patch: { content?: string; content_type?: string; priority?: number },
): Promise<ContextPadEntry> {
  const raw = await apiFetch<Record<string, unknown>>(`/context-pad/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return adaptContextEntry(raw);
}

export async function deleteContextEntry(entryId: string): Promise<void> {
  await apiFetch<void>(`/context-pad/${entryId}`, { method: 'DELETE' });
}
