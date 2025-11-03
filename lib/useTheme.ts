'use client';

import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeName = 'vercel' | 'tangerine' | 'claymorphism' | 'midnight-bloom' | 'fastpitch';

export function useTheme(initialMode?: string, initialName?: string) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    return (initialMode as ThemeMode) || (localStorage.getItem('theme-mode') as ThemeMode) || 'system';
  });

  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'vercel';
    return (initialName as ThemeName) || (localStorage.getItem('theme-name') as ThemeName) || 'vercel';
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (newMode: ThemeMode, newThemeName: ThemeName) => {
      // Remove all existing theme classes
      root.className = root.className.replace(/\s*(theme-\w+|dark)\s*/g, ' ').trim();

      // Add theme name class
      root.classList.add(`theme-${newThemeName}`);

      // Determine light/dark mode
      let isDark = false;
      if (newMode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDark = prefersDark;
        setResolvedMode(prefersDark ? 'dark' : 'light');
      } else {
        isDark = newMode === 'dark';
        setResolvedMode(newMode);
      }

      // Add dark class if needed
      if (isDark) {
        root.classList.add('dark');
      }

      // Debug logging
      console.log('[useTheme] Applied classes:', root.className);
      console.log('[useTheme] Mode:', newMode, '| Theme:', newThemeName, '| isDark:', isDark);
      const bgColor = getComputedStyle(root).getPropertyValue('--background');
      console.log('[useTheme] CSS Variable --background:', bgColor);
    };

    applyTheme(mode, themeName);

    // Listen for system preference changes
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        setResolvedMode(resolved);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode, themeName]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const setThemeName = (newThemeName: ThemeName) => {
    setThemeNameState(newThemeName);
    localStorage.setItem('theme-name', newThemeName);
  };

  return { mode, setMode, themeName, setThemeName, resolvedMode };
}
