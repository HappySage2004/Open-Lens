import { APP_THEMES } from '../data/mockSession';

export function applyTheme(themeId: string) {
  const theme = APP_THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('ol_theme', themeId);
}

export function getStoredTheme(): string {
  return localStorage.getItem('ol_theme') || 'obsidian';
}