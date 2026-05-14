import React from 'react';
import { Bell, Search, User, Moon, Sun } from 'lucide-react';
import useStore from '../store/useStore';

export default function Header() {
  const { theme, toggleTheme } = useStore();
  const isLight = theme === 'light';

  return (
    <header className={`h-14 shrink-0 flex items-center justify-between px-6 border-b ${
      isLight ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search..."
          className={`pl-9 pr-4 py-1.5 rounded-lg text-sm w-60 outline-none transition-colors ${
            isLight
              ? 'bg-gray-100 text-gray-800 focus:bg-gray-50 border border-gray-200'
              : 'bg-slate-800 text-white border border-slate-700 focus:border-slate-600'
          }`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title={isLight ? 'Switch to Dark' : 'Switch to Light'}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className={`p-2 rounded-lg relative transition-colors ${
          isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-slate-800 text-slate-400'
        }`}>
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white'
          }`}>
            <User size={16} />
          </div>
          <span className={`text-sm font-medium hidden sm:block ${
            isLight ? 'text-gray-800' : 'text-white'
          }`}>Punith M</span>
        </div>
      </div>
    </header>
  );
}
