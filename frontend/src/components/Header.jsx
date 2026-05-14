import React, { useState } from 'react';
import { Bell, Search, User, Moon, Sun, LogOut, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { theme, toggleTheme } = useStore();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const isLight = theme === 'light';
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className={`h-14 shrink-0 flex items-center justify-between px-6 border-b z-40 relative ${
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

        {/* User Profile Dropdown */}
        <div className="relative ml-2">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 group outline-none"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-transform group-active:scale-95 ${
              isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white'
            }`}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className={`text-sm font-semibold truncate max-w-[120px] ${
                isLight ? 'text-gray-800' : 'text-white'
              }`}>{displayName}</span>
            </div>
            <ChevronDown size={14} className={isLight ? 'text-gray-400' : 'text-slate-500'} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-xl z-10 ${
                    isLight ? 'bg-white border-gray-100 shadow-gray-200/50' : 'bg-slate-800 border-slate-700 shadow-black/20'
                  }`}
                >
                  <div className="px-3 py-2 border-b mb-1 border-inherit">
                    <p className={`text-xs font-semibold ${isLight ? 'text-gray-400' : 'text-slate-500'} uppercase tracking-wider`}>Signed in as</p>
                    <p className={`text-sm font-medium truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>{user?.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <User size={16} />
                    My Profile
                  </button>

                  <button 
                    onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <SettingsIcon size={16} />
                    Settings
                  </button>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

