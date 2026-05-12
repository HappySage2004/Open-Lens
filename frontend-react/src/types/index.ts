// ── Domain types — aligned 1-to-1 with backend Pydantic models ───────────────

export type HypothesisStatus = 'Active' | 'Supported' | 'Refuted' | 'Inconclusive';

// Backend: "pending" | "in_progress" | "completed" | "skipped"
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

// Backend: "pending" | "running" | "completed" | "failed"
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

// Backend ArtifactType enum string values (PascalCase, no spaces)
export type ArtifactType =
  | 'Chart'
  | 'Table'
  | 'SummaryStat'
  | 'ModelOutput'
  | 'KeyFinding'
  | 'CleaningLedger'
  | 'HypothesisRegister'
  | 'Narrative';

// UI-only
export type AppMode = 'analyst' | 'business';
export type PanelName = 'context' | 'notes' | 'settings' | null;

// ── Step sub-types (match backend Step model) ─────────────────────────────────

export interface ReasoningBlock {
  objective: string;
  approach: string;
  dependencies: string[];
  risks: string[];
}

export interface ToolCall {
  tool_name: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  error: string | null;
}

export interface StepOutput {
  stdout: string;
  stderr: string;
  display_data: Array<Record<string, unknown>>;
}

export interface UncertaintyFlag {
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Step {
  id: string;
  session_id: string;
  sequence_number: number;
  user_message: string;
  reasoning_block: ReasoningBlock;
  tool_calls: ToolCall[];
  output: StepOutput;
  artifact_ids: string[];
  uncertainty_flags: UncertaintyFlag[];
  status: StepStatus;
  created_at?: string;
  updated_at?: string;
}

// ── Session / Task graph ──────────────────────────────────────────────────────

export interface TaskNode {
  id: string;       // mapped from node_id
  title: string;    // mapped from label
  status: TaskStatus;
  depends_on: string[];
  depth: number;    // computed from depends_on for visual indentation
}

export interface SessionSettings {
  model_id: string;
  reasoning_effort: 'low' | 'medium' | 'high';
  auto_promote_artifacts: boolean;
  show_uncertainty_flags: boolean;
  suggest_next_steps: boolean;
  stream_reasoning: boolean;
}

export interface Session {
  id: string;
  project_id: string;
  title: string;
  problem_statement: string;
  task_graph: { nodes: TaskNode[] };
  settings: SessionSettings;
  data_snapshot_ref: string | null;
  step_ids: string[];
  artifact_ids: string[];
  created_at?: string;
  updated_at?: string;
}

// ── Artifact ──────────────────────────────────────────────────────────────────

export interface Artifact {
  id: string;
  session_id: string;
  step_id: string | null;
  type: ArtifactType;
  name: string;
  payload: Record<string, unknown>;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

// ── Hypothesis ────────────────────────────────────────────────────────────────

export interface Hypothesis {
  id: string;
  session_id: string;
  statement: string;
  status: HypothesisStatus;
  evidence_artifact_ids: string[];
  created_at?: string;
  updated_at?: string;
}

// ── Project ───────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

// ── Context Pad ───────────────────────────────────────────────────────────────

export interface ContextPadEntry {
  id: string;
  scope: 'session' | 'project';
  scope_id: string;
  content_type: 'text' | 'table' | 'image' | 'instruction';
  content: string;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

// ── WebSocket step-streaming events ──────────────────────────────────────────

export type StepEventType =
  | 'reasoning'
  | 'tool_call'
  | 'tool_result'
  | 'output'
  | 'artifact_created'
  | 'uncertainty'
  | 'done'
  | 'error';

export interface StepEvent {
  type: StepEventType;
  data: unknown;
  step_id: string;
}

// ── UI-only config types (no backend equivalent) ──────────────────────────────

export interface Theme {
  id: string;
  name: string;
  desc: string;
  swatch: string[];
  vars: Record<string, string>;
}

export interface Model {
  id: string;
  name: string;
  desc: string;
  tier: '$' | '$$' | '$$$';
  recommended?: boolean;
}

export interface ModelGroup {
  provider: string;
  models: Model[];
}

export interface Checkpoint {
  name: string;
  ts: string;
  steps: number;
}
