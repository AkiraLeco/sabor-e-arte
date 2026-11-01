import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setSettings(await api.configuracoes());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return <SettingsContext.Provider value={{ settings, error, reload, setSettings }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
