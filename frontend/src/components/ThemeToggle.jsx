import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('system'); // 'light' | 'dark' | 'system'

  useEffect(() => {
    const saved = localStorage.getItem('docuforge-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    } else {
      setTheme('system');
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const applyTheme = (isDark) => {
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      localStorage.removeItem('docuforge-theme');
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);

      const handler = (e) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      localStorage.setItem('docuforge-theme', theme);
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const cycle = () => {
    setTheme((prev) => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  const icons = {
    system: <Monitor size={18} className="text-gray-500 dark:text-gray-400" />,
    light: <Sun size={18} className="text-amber-500" />,
    dark: <Moon size={18} className="text-indigo-400" />,
  };

  const labels = {
    system: 'Auto',
    light: 'Light',
    dark: 'Dark',
  };

  return (
    <button
      id="theme-toggle"
      onClick={cycle}
      className="flex items-center gap-2 px-3 py-2 rounded-xl
                 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                 transition-all duration-200"
      aria-label={`Theme: ${labels[theme]}. Click to change.`}
      title={`Theme: ${labels[theme]}`}
    >
      <span className="transition-transform duration-300 hover:rotate-12">
        {icons[theme]}
      </span>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 hidden sm:inline">
        {labels[theme]}
      </span>
    </button>
  );
}
