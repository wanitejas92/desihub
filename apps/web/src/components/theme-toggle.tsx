'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/** First-class light/dark toggle. Persists the choice; respects system default. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem('desihub-theme') as Theme | null;
      } catch {
        return null;
      }
    })();
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    } else {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('desihub-theme', next);
    } catch {
      /* storage may be blocked */
    }
    document.documentElement.setAttribute('data-theme', next);
  }

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-pill border-border text-fg hover:bg-surface-hover inline-flex h-11 w-11 items-center justify-center border transition-colors"
    >
      <span aria-hidden className="text-lg">
        {theme === null ? '◐' : isDark ? '☀' : '☾'}
      </span>
    </button>
  );
}
