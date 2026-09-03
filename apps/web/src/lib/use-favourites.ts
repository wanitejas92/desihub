'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Lightweight, unauthenticated "save for later" — a per-browser localStorage
 * set, not a real account feature. No login system exists yet (that's a
 * later phase), so this is scoped to what's honestly deliverable now: a
 * real, working toggle, not a decorative heart that does nothing.
 */
const STORAGE_KEY = 'desihub:favourites';
const EMPTY = new Set<string>();
const listeners = new Set<() => void>();
let cached: Set<string> | null = null;

function read(): Set<string> {
  if (cached) return cached;
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cached = new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    cached = new Set();
  }
  return cached;
}

function write(next: Set<string>) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // Private browsing / storage disabled — the toggle still works this
    // session, it just won't persist across reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFavourites() {
  const favourites = useSyncExternalStore(
    subscribe,
    () => read(),
    () => EMPTY,
  );

  const isFavourite = useCallback((id: string) => favourites.has(id), [favourites]);

  const toggle = useCallback((id: string) => {
    const next = new Set(read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write(next);
  }, []);

  return { isFavourite, toggle };
}
