import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  // Resolved color scheme actually used by the app
  colorScheme: 'light' | 'dark';
};

// Provide a harmless default so hooks can be called even before the provider is mounted
const ThemeContext = createContext<ThemeContextValue>({
  preference: 'system',
  setPreference: () => {},
  colorScheme: 'light',
});

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [preference, setPreference] = useState<ThemePreference>('system');

  // Load preference once
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('settings.theme');
        if (saved === 'light' || saved === 'dark' || saved === 'system') setPreference(saved);
      } catch {}
    })();
  }, []);

  // Persist preference
  useEffect(() => {
    AsyncStorage.setItem('settings.theme', preference).catch(() => {});
  }, [preference]);

  const colorScheme = useMemo<'light' | 'dark'>(() => {
    if (preference === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return preference;
  }, [preference, systemScheme]);

  const value = useMemo(
    () => ({ preference, setPreference, colorScheme }),
    [preference, colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
