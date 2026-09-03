import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { maybeAskForPushPermission } from './notifications';

const KEY = 'desihub-saved-events';

async function read(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

async function write(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Saved-events store backed by AsyncStorage. The very first save triggers the
 * push-permission prompt — never on launch.
 */
export function useSavedEvents() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    read().then((v) => {
      if (active) {
        setIds(v);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    async (id: string) => {
      const wasEmpty = ids.length === 0;
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      setIds(next);
      await write(next);
      // First-ever save → ask for push permission.
      if (wasEmpty && next.length === 1) {
        await maybeAskForPushPermission();
      }
    },
    [ids],
  );

  return { ids, isSaved, toggle, ready };
}
