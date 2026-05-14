import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Heart, Brain, FileText,
  BarChart3, Lightbulb, Settings, ChevronLeft,
  ChevronRight, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Heart, label: 'Heart Disease', path: '/heart' },
  { icon: Brain, label: 'Brain Tumor', path: '/brain-tumor' },
  { icon: FileText, label: 'Reports History', path: '/history' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Lightbulb, label: 'Health Tips', path: '/health-tips' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, theme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isLight = theme === 'light';
  const bg = isLight ? 'bg-white border-r border-gray-200' : 'bg-slate-900 border-r border-slate-800';
  const textMain = isLight ? 'text-gray-800' : 'text-white';
  const textMuted = isLight ? 'text-gray-500' : 'text-slate-400';
  const hoverBg = isLight ? 'hover:bg-gray-100' : 'hover:bg-white/5';
  const activeBg = isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/15 text-indigo-400';
  const activeBorder = isLight ? 'border-indigo-500' : 'border-indigo-400';

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 250 : 72 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={`h-screen ${bg} flex flex-col z-50 shrink-0 overflow-hidden`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Stethoscope className="text-white" size={20} />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className={`font-bold text-base whitespace-nowrap overflow-hidden ${textMain}`}
            >
              AuraHealth AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${
                isActive
                  ? `${activeBg} ${activeBorder}`
                  : `border-transparent ${textMuted} ${hoverBg}`
              }`}
              title={item.label}
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-inherit shrink-0">
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${textMuted} ${hoverBg} transition-all`}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
