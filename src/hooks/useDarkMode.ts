import { useState, useCallback, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(JSON.parse(savedMode));
    }
  }, []);

  const toggleDarkMode = useCallback((checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('darkMode', JSON.stringify(checked));
  }, []);

  return {
    isDarkMode,
    toggleDarkMode,
  };
};

