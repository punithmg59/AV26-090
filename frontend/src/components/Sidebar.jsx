import React from 'react';
import { LayoutDashboard, HeartPulse, History, FileText, Lightbulb, Settings, LogOut, Activity } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, active: false },
    { name: 'Risk Assessment', icon: <HeartPulse size={18} />, active: true },
    { name: 'History', icon: <History size={18} />, active: false },
    { name: 'Reports', icon: <FileText size={18} />, active: false },
    { name: 'Health Tips', icon: <Lightbulb size={18} />, active: false },
    { name: 'Settings', icon: <Settings size={18} />, active: false },
  ];

  return (
    <div className="w-56 bg-surface h-screen border-r border-border p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-8 mt-2">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-textMain leading-tight">CardioAI</h1>
            <p className="text-[10px] text-textMuted">Heart Risk Prediction</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                item.active 
                  ? 'bg-indigo-50 text-primary font-medium shadow-sm' 
                  : 'text-textMuted hover:bg-gray-50 hover:text-textMain'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100">
          <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm mb-2 text-primary">
            <Activity size={16} />
          </div>
          <h3 className="font-semibold text-textMain text-xs mb-1">AI Prediction</h3>
          <p className="text-[10px] text-textMuted leading-relaxed">
            Our AI analyzes your health data to assess risk.
          </p>
        </div>

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-textMuted hover:bg-red-50 hover:text-red-600 transition-all text-sm">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
