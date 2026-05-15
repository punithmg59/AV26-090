import React from 'react';
import { Moon, Sun, Globe, Trash2, Bell, User, LogOut } from 'lucide-react';
import useStore from '../store/useStore';
import { clearHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ar', label: 'Arabic' },
];

export default function SettingsPage() {
  const { theme, toggleTheme, language, setLanguage, notifications, setNotifications } = useStore();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, translating } = useTranslation();
  const isLight = theme === 'light';

  const card = isLight ? 'bg-white border border-gray-200 shadow-sm' : 'bg-slate-900 border border-slate-800';
  const muted = isLight ? 'text-gray-500' : 'text-slate-400';
  const inputBg = isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-800 border-slate-700';

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure? This will delete all prediction history permanently.')) return;
    try {
      await clearHistory();
      alert('History cleared successfully');
    } catch {
      alert('Failed to clear history');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t('settings')}</h1>
        <p className={`text-sm mt-1 ${muted}`}>Manage your app preferences</p>
      </div>

      {/* Profile */}
      <div className={`${card} rounded-xl p-6`}>
        <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
          <User size={16} /> Profile Information
        </h2>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ${
            isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white'
          }`}>
            {profile?.full_name?.[0] || 'U'}
          </div>
          <div>
            <p className={`font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>{profile?.full_name || 'Healthcare User'}</p>
            <p className={`text-sm ${muted}`}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className={`${card} rounded-xl p-6`}>
        <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
          {isLight ? <Sun size={16} /> : <Moon size={16} />} Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Dark Mode</p>
            <p className={`text-xs ${muted}`}>Switch between light and dark themes</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              !isLight ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              !isLight ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className={`${card} rounded-xl p-6`}>
        <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
          <Globe size={16} /> Language
          {translating && <span className="text-xs text-indigo-400 animate-pulse ml-2">Translating...</span>}
        </h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border outline-none ${inputBg} ${isLight ? 'text-gray-800' : 'text-white'}`}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <p className={`text-xs mt-2 ${muted}`}>
          Reports, navigation, and UI labels will translate to the selected language.
        </p>
      </div>

      {/* Notifications */}
      <div className={`${card} rounded-xl p-6`}>
        <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
          <Bell size={16} /> Notifications
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Push Notifications</p>
            <p className={`text-xs ${muted}`}>Get notified about report results</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              notifications ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={`${card} rounded-xl p-6 border-red-500/30`}>
        <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 text-red-500`}>
          <Trash2 size={16} /> Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Clear All History</p>
              <p className={`text-xs ${muted}`}>Permanently delete all prediction records</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 text-xs font-semibold text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Clear Data
            </button>
          </div>

          <div className="pt-4 border-t border-inherit flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>{t('sign_out')}</p>
              <p className={`text-xs ${muted}`}>End your current session</p>
            </div>
            <button
              onClick={() => { signOut(); navigate('/login'); }}
              className="px-4 py-2 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <LogOut size={14} />
              {t('sign_out')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
