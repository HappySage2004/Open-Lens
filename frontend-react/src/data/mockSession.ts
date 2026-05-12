// Static UI-only config — no backend equivalent for any of these objects.
// MOCK_SESSION has been removed; all session data now comes from the API.

import type { Theme, ModelGroup } from '../types';

export const SUGGESTED_PROMPTS = [
  'Show outliers in Enterprise deal sizes',
  'Compare Q3 to Q1 deal velocity',
  'Which reps have the highest churn-risk accounts?',
  'Generate narrative so far',
];

export const APP_THEMES: Theme[] = [
  {
    id: 'obsidian', name: 'Obsidian', desc: 'Warm dark',
    swatch: ['#111009', '#18160e', '#1f1d14', '#d4954a', '#ede8d8'],
    vars: {
      '--bg': '#111009', '--surface-1': '#18160e', '--surface-2': '#1f1d14',
      '--surface-3': '#26231a', '--border': '#2e2b20', '--border-light': '#3a3628',
      '--text-primary': '#ede8d8', '--text-secondary': '#a09880', '--text-muted': '#635d48',
      '--accent': '#d4954a', '--accent-dim': 'rgba(212,149,74,0.14)',
      '--code-bg': '#0e0c07', '--code-text': '#bdb090',
    },
  },
  {
    id: 'void', name: 'Void', desc: 'Cool dark',
    swatch: ['#0d0f14', '#13161e', '#191d28', '#6366f1', '#e8eaf2'],
    vars: {
      '--bg': '#0d0f14', '--surface-1': '#13161e', '--surface-2': '#191d28',
      '--surface-3': '#1e2330', '--border': '#242936', '--border-light': '#2d3344',
      '--text-primary': '#e8eaf2', '--text-secondary': '#9ba3ba', '--text-muted': '#5b6480',
      '--accent': '#6366f1', '--accent-dim': 'rgba(99,102,241,0.15)',
      '--code-bg': '#0f1117', '--code-text': '#a8b4d8',
    },
  },
  {
    id: 'slate', name: 'Slate', desc: 'Neutral',
    swatch: ['#0e0e0e', '#141414', '#1a1a1a', '#2dd4bf', '#e6e6e6'],
    vars: {
      '--bg': '#0e0e0e', '--surface-1': '#141414', '--surface-2': '#1a1a1a',
      '--surface-3': '#212121', '--border': '#2a2a2a', '--border-light': '#333333',
      '--text-primary': '#e6e6e6', '--text-secondary': '#999999', '--text-muted': '#575757',
      '--accent': '#2dd4bf', '--accent-dim': 'rgba(45,212,191,0.12)',
      '--code-bg': '#0a0a0a', '--code-text': '#a3a3a3',
    },
  },
  {
    id: 'forest', name: 'Forest', desc: 'Green dark',
    swatch: ['#0b100e', '#111812', '#161e17', '#6dbd8e', '#dde8de'],
    vars: {
      '--bg': '#0b100e', '--surface-1': '#111812', '--surface-2': '#161e17',
      '--surface-3': '#1c251d', '--border': '#222e24', '--border-light': '#2c3b2e',
      '--text-primary': '#dde8de', '--text-secondary': '#8ea990', '--text-muted': '#526254',
      '--accent': '#6dbd8e', '--accent-dim': 'rgba(109,189,142,0.13)',
      '--code-bg': '#090d0a', '--code-text': '#96b99a',
    },
  },
  {
    id: 'dusk', name: 'Dusk', desc: 'Soft light',
    swatch: ['#f4f1ec', '#eceae4', '#e3e0d8', '#6b52b8', '#1e1b16'],
    vars: {
      '--bg': '#f4f1ec', '--surface-1': '#eceae4', '--surface-2': '#e3e0d8',
      '--surface-3': '#d8d4cc', '--border': '#ccc8c0', '--border-light': '#bab6ae',
      '--text-primary': '#1e1b16', '--text-secondary': '#4a4540', '--text-muted': '#8a847c',
      '--accent': '#6b52b8', '--accent-dim': 'rgba(107,82,184,0.1)',
      '--code-bg': '#ede9e2', '--code-text': '#5a4e78',
    },
  },
];

export const MODEL_GROUPS: ModelGroup[] = [
  {
    provider: 'Anthropic', models: [
      { id: 'claude-opus-4-7',    name: 'Claude Opus 4',    desc: 'Highest capability, complex reasoning',  tier: '$$$', recommended: true },
      { id: 'claude-sonnet-4-6',  name: 'Claude Sonnet 4',  desc: 'Balanced speed and intelligence',        tier: '$$' },
    ],
  },
  {
    provider: 'OpenAI', models: [
      { id: 'gpt-4o',  name: 'GPT-4o', desc: 'Fast multimodal reasoning',   tier: '$$' },
      { id: 'o3',      name: 'o3',     desc: 'Advanced chain-of-thought',    tier: '$$$' },
    ],
  },
  {
    provider: 'Google', models: [
      { id: 'gemini-2-pro', name: 'Gemini 2 Pro', desc: 'Long context, deep analysis', tier: '$$' },
    ],
  },
  {
    provider: 'Mistral', models: [
      { id: 'mistral-large', name: 'Mistral Large', desc: 'Efficient open-weights reasoning', tier: '$' },
    ],
  },
];

export const COST_ROWS = [
  { model: 'Claude Opus 4',   tokIn: '42k',  tokOut: '18k', cost: '$0.31' },
  { model: 'Claude Sonnet 4', tokIn: '8k',   tokOut: '3k',  cost: '$0.09' },
  { model: 'GPT-4o',          tokIn: '2k',   tokOut: '0.5k',cost: '$0.02' },
];

// Keys match backend ArtifactType enum string values exactly.
export const ARTIFACT_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  Chart:               { icon: 'chart',      color: '#d4954a', bg: 'rgba(212,149,74,0.1)' },
  Table:               { icon: 'table',      color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  KeyFinding:          { icon: 'finding',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CleaningLedger:      { icon: 'ledger',     color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  HypothesisRegister:  { icon: 'hypothesis', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  Narrative:           { icon: 'narrative',  color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  ModelOutput:         { icon: 'model',      color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  SummaryStat:         { icon: 'stat',       color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
};

// Human-readable display names for UI filters.
export const ARTIFACT_DISPLAY_NAME: Record<string, string> = {
  Chart:              'Chart',
  Table:              'Table',
  KeyFinding:         'Key Finding',
  CleaningLedger:     'Cleaning Ledger',
  HypothesisRegister: 'Hypothesis Register',
  Narrative:          'Narrative',
  ModelOutput:        'Model Output',
  SummaryStat:        'Summary Stat',
};
