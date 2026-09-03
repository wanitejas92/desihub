import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}

/** Minimal async loader for screen data (the mock repo resolves instantly). */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: false });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: false });
    fn()
      .then((data) => active && setState({ data, loading: false, error: false }))
      .catch(() => active && setState({ data: null, loading: false, error: true }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
