import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// CSS variables for themes
const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f3f4f6',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--accent-primary': '#059669',
    '--accent-secondary': '#047857',
    '--border-color': '#e5e7eb',
    '--error': '#ef4444',
    '--success': '#10b981',
    '--warning': '#f59e0b'
  },
  dark: {
    '--bg-primary': '#111827',
    '--bg-secondary': '#1f2937',
    '--text-primary': '#f9fafb',
    '--text-secondary': '#d1d5db',
    '--accent-primary': '#10b981',
    '--accent-secondary': '#059669',
    '--border-color': '#374151',
    '--error': '#f87171',
    '--success': '#34d399',
    '--warning': '#fbbf24'
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    console.log('Theme changed to:', theme);
    // Update localStorage when theme changes
    localStorage.setItem('theme', theme);
    
    // Update document classes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
      console.log('Added dark class to document');
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
      console.log('Removed dark class from document');
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggle theme called, current theme:', theme);
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('Setting theme to:', newTheme);
      return newTheme;
    });
  };

  const setLightTheme = () => {
    setTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
