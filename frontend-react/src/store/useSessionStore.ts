import { create } from 'zustand';
import type { Step, Session, Artifact, Hypothesis, AppMode, PanelName, StepEvent, SessionSettings } from '../types';
import * as api from '../api';
import { WS_BASE_URL } from '../api/client';

interface SessionStore {
  // ── Identity ───────────────────────────────────────────────────────────────
  currentProjectId: string | null;
  currentSessionId: string | null;

  // ── Session data ───────────────────────────────────────────────────────────
  session: Session | null;
  steps: Step[];
  artifacts: Artifact[];
  hypotheses: Hypothesis[];

  // ── Async state ────────────────────────────────────────────────────────────
  isLoading: boolean;
  error: string | null;

  // ── UI state ───────────────────────────────────────────────────────────────
  mode: AppMode;
  activePanel: PanelName;
  expandedArtifacts: Set<string>;
  activeArtifact: string | null;
  activeTheme: string;

  // ── WebSocket ──────────────────────────────────────────────────────────────
  wsConnected: boolean;

  // ── Actions: identity + data loading ─────────────────────────────────────
  createProject: (title: string) => Promise<string>;
  createSession: (projectId: string, title: string, problemStatement: string, mode: AppMode) => Promise<string>;
  loadSession: (projectId: string, sessionId: string) => Promise<void>;

  // ── Actions: agent interaction ────────────────────────────────────────────
  submitMessage: (userMessage: string) => void;

  // ── Actions: session settings ─────────────────────────────────────────────
  updateSessionSettings: (patch: Partial<SessionSettings>) => Promise<void>;

  // ── Actions: UI ───────────────────────────────────────────────────────────
  undoLastStep: () => void;
  setMode: (mode: AppMode) => void;
  setActivePanel: (panel: PanelName) => void;
  toggleArtifact: (id: string) => void;
  setAllArtifacts: (ids: string[], expand: boolean) => void;
  setActiveArtifact: (id: string | null) => void;
  setActiveTheme: (id: string) => void;

  // ── Actions: optimistic step updates (used by WS handler) ────────────────
  _addOrUpdateStep: (step: Step) => void;
  _appendArtifact: (artifact: Artifact) => void;
  _refreshHypotheses: () => Promise<void>;
}

// Temporary ID prefix for optimistic steps before backend confirms step_id
const TEMP_PREFIX = 'temp_';

export const useSessionStore = create<SessionStore>((set, get) => {
  let wsRef: WebSocket | null = null;
  let sequenceCounter = 0;

  return {
    currentProjectId: null,
    currentSessionId: null,
    session: null,
    steps: [],
    artifacts: [],
    hypotheses: [],
    isLoading: false,
    error: null,
    mode: 'analyst',
    activePanel: null,
    expandedArtifacts: new Set<string>(),
    activeArtifact: null,
    activeTheme: localStorage.getItem('ol_theme') || 'obsidian',
    wsConnected: false,

    // ── Identity + data loading ──────────────────────────────────────────────

    createProject: async (title) => {
      const project = await api.createProject(title);
      set({ currentProjectId: project.id });
      return project.id;
    },

    createSession: async (projectId, title, problemStatement, mode) => {
      const modeSettings: Partial<SessionSettings> = { suggest_next_steps: mode === 'business' };
      const session = await api.createSession(projectId, title, problemStatement, modeSettings);
      sequenceCounter = 0;
      set({ currentProjectId: projectId, currentSessionId: session.id, session, steps: [], artifacts: [], hypotheses: [], mode });
      return session.id;
    },

    loadSession: async (projectId, sessionId) => {
      set({ isLoading: true, error: null });
      try {
        const [session, steps, artifacts, hypotheses] = await Promise.all([
          api.getSession(projectId, sessionId),
          api.listSteps(sessionId),
          api.listArtifacts(sessionId),
          api.listHypotheses(sessionId),
        ]);
        sequenceCounter = steps.length;
        set({ session, steps, artifacts, hypotheses, currentProjectId: projectId, currentSessionId: sessionId, isLoading: false });
      } catch (e) {
        set({ isLoading: false, error: (e as Error).message });
      }
    },

    // ── Agent WebSocket ──────────────────────────────────────────────────────

    submitMessage: (userMessage) => {
      const { currentSessionId } = get();
      if (!currentSessionId) return;

      // Close any existing connection
      if (wsRef) { wsRef.close(); wsRef = null; }

      sequenceCounter += 1;
      const seqNum = sequenceCounter;

      // Optimistic step with a temporary id
      const tempId = `${TEMP_PREFIX}${seqNum}`;
      const optimisticStep: Step = {
        id: tempId,
        session_id: currentSessionId,
        sequence_number: seqNum,
        user_message: userMessage,
        reasoning_block: { objective: '', approach: '', dependencies: [], risks: [] },
        tool_calls: [],
        output: { stdout: '', stderr: '', display_data: [] },
        artifact_ids: [],
        uncertainty_flags: [],
        status: 'running',
      };
      set((s) => ({ steps: [...s.steps, optimisticStep] }));

      const ws = new WebSocket(`${WS_BASE_URL}/ws/sessions/${currentSessionId}`);
      wsRef = ws;

      ws.onopen = () => {
        set({ wsConnected: true });
        ws.send(JSON.stringify({ user_message: userMessage, sequence_number: seqNum }));
      };

      ws.onmessage = (evt) => {
        const event: StepEvent = JSON.parse(evt.data as string);
        const backendStepId = event.step_id;

        // Replace temp id with real id on first event that carries a real step_id
        set((s) => {
          const steps = s.steps.map((st) =>
            st.id === tempId && backendStepId && !backendStepId.startsWith(TEMP_PREFIX)
              ? { ...st, id: backendStepId }
              : st,
          );
          return { steps };
        });

        const stepId = backendStepId || tempId;

        const patch = (fn: (st: Step) => Step) =>
          set((s) => ({ steps: s.steps.map((st) => (st.id === stepId ? fn(st) : st)) }));

        switch (event.type) {
          case 'reasoning': {
            const rb = event.data as Partial<Step['reasoning_block']>;
            patch((st) => ({ ...st, reasoning_block: { ...st.reasoning_block, ...rb } }));
            break;
          }
          case 'tool_call': {
            const tc = event.data as Step['tool_calls'][number];
            patch((st) => ({ ...st, tool_calls: [...st.tool_calls, tc] }));
            break;
          }
          case 'output': {
            const out = event.data as Partial<Step['output']>;
            patch((st) => ({ ...st, output: { ...st.output, ...out } }));
            break;
          }
          case 'artifact_created': {
            const art = event.data as Artifact;
            set((s) => ({ artifacts: [...s.artifacts, art] }));
            patch((st) => ({ ...st, artifact_ids: [...st.artifact_ids, art.id] }));
            break;
          }
          case 'uncertainty': {
            const flag = event.data as Step['uncertainty_flags'][number];
            patch((st) => ({ ...st, uncertainty_flags: [...st.uncertainty_flags, flag] }));
            break;
          }
          case 'done':
            patch((st) => ({ ...st, status: 'completed' }));
            ws.close();
            set({ wsConnected: false });
            wsRef = null;
            break;
          case 'error': {
            const msg = (event.data as { message?: string })?.message ?? 'Agent error';
            patch((st) => ({ ...st, status: 'failed' }));
            set({ error: msg, wsConnected: false });
            ws.close();
            wsRef = null;
            break;
          }
        }
      };

      ws.onerror = () => {
        set((s) => ({
          steps: s.steps.map((st) =>
            st.id === tempId || st.id === sequenceCounter.toString()
              ? { ...st, status: 'failed' }
              : st,
          ),
          wsConnected: false,
          error: 'WebSocket connection failed.',
        }));
        wsRef = null;
      };

      ws.onclose = () => set({ wsConnected: false });
    },

    // ── Session settings ──────────────────────────────────────────────────────

    updateSessionSettings: async (patch) => {
      const { currentProjectId, currentSessionId, session } = get();
      if (!currentProjectId || !currentSessionId || !session) return;
      const merged = { ...session.settings, ...patch };
      const updated = await api.updateSession(currentProjectId, currentSessionId, { settings: merged });
      set({ session: updated });
    },

    // ── UI actions ────────────────────────────────────────────────────────────

    // Removes the last step from local view only; the backend record is unchanged.
    undoLastStep: () => set((s) => ({ steps: s.steps.slice(0, -1) })),

    setMode: (mode) => set({ mode }),
    setActivePanel: (activePanel) => set({ activePanel }),

    toggleArtifact: (id) =>
      set((s) => {
        const next = new Set(s.expandedArtifacts);
        next.has(id) ? next.delete(id) : next.add(id);
        return { expandedArtifacts: next };
      }),

    setAllArtifacts: (ids, expand) =>
      set({ expandedArtifacts: expand ? new Set(ids) : new Set<string>() }),

    setActiveArtifact: (activeArtifact) => set({ activeArtifact }),

    setActiveTheme: (activeTheme) => {
      localStorage.setItem('ol_theme', activeTheme);
      set({ activeTheme });
    },

    // ── Internal helpers used by WS handler ───────────────────────────────────

    _addOrUpdateStep: (step) =>
      set((s) => {
        const exists = s.steps.findIndex((st) => st.id === step.id);
        if (exists >= 0) {
          const steps = [...s.steps];
          steps[exists] = step;
          return { steps };
        }
        return { steps: [...s.steps, step] };
      }),

    _appendArtifact: (artifact) =>
      set((s) => ({ artifacts: [...s.artifacts, artifact] })),

    _refreshHypotheses: async () => {
      const { currentSessionId } = get();
      if (!currentSessionId) return;
      const hypotheses = await api.listHypotheses(currentSessionId);
      set({ hypotheses });
    },
  };
});
