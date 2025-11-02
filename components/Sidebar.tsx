// Fix: Provide full content for Sidebar.tsx
import React from 'react';
import { BellIcon, BoxIcon, CalendarIcon, HeartIcon, LogoutIcon, MoonIcon, NewspaperIcon, QuoteIcon, SparklesIcon, UsersIcon } from '../constants';
import { useAppContext } from '../state/AppContext';
import { View } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

interface SidebarProps {
  currentView: View;
  navigateTo: (view: View) => void;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, navigateTo, logout }) => {
  const { currentUser } = useAppContext();

  const navItems = [
    { view: View.DASHBOARD, label: 'Dashboard', icon: CalendarIcon },
    { view: View.BOOKINGS, label: 'Bookings', icon: UsersIcon },
    { view: View.ROOMS, label: 'Rooms', icon: MoonIcon },
    { view: View.SERVICES, label: 'Services', icon: BellIcon },
    { view: View.HR, label: 'HR', icon: UsersIcon },
    { view: View.SCHEDULE, label: 'Schedules', icon: CalendarIcon },
    { view: View.INVENTORY, label: 'Inventory', icon: BoxIcon },
    { view: View.SPAGYM, label: 'Spa & Gym', icon: HeartIcon },
    { view: View.TESTIMONIALS, label: 'Testimonials', icon: QuoteIcon },
    { view: View.NEWS_ADMIN, label: 'News & Events', icon: NewspaperIcon },
    { view: View.AI_ASSISTANT, label: 'AI Assistant', icon: SparklesIcon },
  ];
  
  const ADMIN_ONLY_VIEWS = [View.HR, View.INVENTORY];

  const accessibleNavItems = navItems.filter(item => {
    if(currentUser?.role === 'Admin') return true;
    return !ADMIN_ONLY_VIEWS.includes(item.view);
  });

  const baseClasses = "w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200";
  const activeClasses = "bg-blue-600 text-white font-bold shadow-lg";
  const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 flex flex-col">
      <div className="p-6 flex items-center justify-center border-b dark:border-gray-700">
        <MoonIcon className="h-10 w-10 text-blue-600" />
        <h1 className="text-2xl font-bold ml-3 text-gray-800 dark:text-gray-100">Elysian Portal</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {accessibleNavItems.map(item => (
          <button
            key={item.view}
            onClick={() => navigateTo(item.view)}
            className={`${baseClasses} ${currentView === item.view ? activeClasses : inactiveClasses}`}
          >
            <item.icon className="h-6 w-6 mr-3" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <ThemeSwitcher />
          <button
            onClick={logout}
            className={`${baseClasses} ${inactiveClasses} w-full text-red-600 dark:text-red-400 dark:hover:bg-red-900/50 hover:bg-red-100`}
          >
            <LogoutIcon className="h-6 w-6 mr-3" />
            <span>Logout</span>
          </button>
          <button
            onClick={() => navigateTo(View.LANDING)}
            className={`${baseClasses} ${inactiveClasses} w-full`}
          >
            <span>&larr; Back to Main Site</span>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;