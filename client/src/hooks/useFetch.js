import { useCallback, useEffect, useRef, useState } from 'react';

// Carrega dados de forma assíncrona. `interval` (ms) ativa atualização periódica silenciosa.
export function useFetch(fn, deps = [], { interval = 0 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setData(await fnRef.current());
      setError(null);
    } catch (e) {
      if (!silent) setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (!interval) return undefined;
    const id = setInterval(() => !document.hidden && load(true), interval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, interval, ...deps]);

  return { data, setData, loading, error, reload: () => load(false), refresh: () => load(true) };
}
