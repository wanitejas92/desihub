'use client';

import { useSyncExternalStore } from 'react';

/**
 * Per-device collections for signed-out visitors. Saving an event or
 * following an organiser has never required an account here, and Phase 2
 * doesn't change that: these stores stay the anonymous backend, and
 * `AccountProvider` folds them into the account on sign-in.
 */

const SAVED_KEY = 'desihub:favourites';
const FOLLOWS_KEY = 'desihub:follows';
/** Pre-accounts builds keyed follows by organiser slug. Read once, then migrated. */
const LEGACY_FOLLOWS_KEY = 'desihub-follows';

const EMPTY: ReadonlySet<string> = new Set<string>();

interface LocalStore {
  read(): ReadonlySet<string>;
  toggle(id: string, on: boolean): void;
  clear(): void;
  subscribe(listener: () => void): () => void;
}

function createStore(storageKey: string): LocalStore {
  const listeners = new Set<() => void>();
  let cached: Set<string> | null = null;

  function read(): ReadonlySet<string> {
    if (cached) return cached;
    if (typeof window === 'undefined') return EMPTY;
    try {
      const raw = window.localStorage.getItem(storageKey);
      cached = new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      cached = new Set();
    }
    return cached;
  }

  function write(next: Set<string>) {
    cached = next;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch {
      // Private browsing / storage disabled — the toggle still works for this
      // session, it just won't survive a reload.
    }
    listeners.forEach((listener) => listener());
  }

  return {
    read,
    toggle(id, on) {
      const next = new Set(read());
      if (on) next.add(id);
      else next.delete(id);
      write(next);
    },
    clear() {
      cached = new Set();
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* storage blocked */
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const localSavedEvents = createStore(SAVED_KEY);
export const localFollows = createStore(FOLLOWS_KEY);

export function useLocalStore(store: LocalStore): ReadonlySet<string> {
  return useSyncExternalStore(
    store.subscribe,
    () => store.read(),
    () => EMPTY,
  );
}

/** Follows saved by slug before accounts existed; resolved server-side at merge time. */
export function readLegacyFollowSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_FOLLOWS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function clearLegacyFollowSlugs(): void {
  try {
    window.localStorage.removeItem(LEGACY_FOLLOWS_KEY);
  } catch {
    /* storage blocked */
  }
}
