import { useEffect, useState } from 'react';
import { THEMES, THEME_STORAGE_KEY } from '../data/siteConfig.js';

const DEFAULT_THEME = THEMES[0].id;

function getInitialTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.some((theme) => theme.id === savedTheme) ? savedTheme : DEFAULT_THEME;
}

export function useTheme() {
  const [themeId, setThemeId] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  return { themeId, setThemeId, themes: THEMES };
}
