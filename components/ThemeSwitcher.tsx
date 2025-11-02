import React from 'react';
import { MoonIcon, SunIcon } from '../constants';
import { useAppContext } from '../state/AppContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useAppContext();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
    </button>
  );
};

export default ThemeSwitcher;
