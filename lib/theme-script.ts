// This script runs before React hydration to prevent flash of wrong theme
export const themeScript = `
(function() {
  try {
    const mode = localStorage.getItem('theme-mode') || 'system';
    const themeName = localStorage.getItem('theme-name') || 'vercel';
    const root = document.documentElement;

    // Remove all existing theme classes
    root.className = root.className.replace(/\\s*(theme-\\w+|dark)\\s*/g, ' ').trim();

    // Add theme name class
    root.classList.add('theme-' + themeName);

    // Determine light/dark mode
    let isDark = false;
    if (mode === 'light') {
      isDark = false;
    } else if (mode === 'dark') {
      isDark = true;
    } else {
      // system mode
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Add dark class if needed
    if (isDark) {
      root.classList.add('dark');
    }

    // Debug logging
    console.log('[Theme Script] Applied classes:', root.className);
    console.log('[Theme Script] Mode:', mode, '| Theme:', themeName, '| isDark:', isDark);
    const bgColor = getComputedStyle(root).getPropertyValue('--background');
    console.log('[Theme Script] CSS Variable --background:', bgColor);
  } catch (e) {
    console.error('Theme script error:', e);
  }
})();
`;
