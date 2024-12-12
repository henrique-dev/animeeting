'use client';

import { createContext, useEffect, useState } from 'react';

export type ThemeContextType = {
  mode: 'light' | 'dark' | (string & {});
  toggleMode: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleMode: () => undefined,
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark' | (string & {})>('light');

  const toggleMode = () => {
    const theme = mode == 'dark' ? 'light' : 'dark';
    setMode(theme);
    localStorage.setItem('theme', theme);
  };

  useEffect(() => {
    const theme = localStorage.getItem('theme');

    setMode(theme ?? 'light');
  }, [setMode]);

  return <ThemeContext.Provider value={{ mode: mode, toggleMode: toggleMode }}>{children}</ThemeContext.Provider>;
}
