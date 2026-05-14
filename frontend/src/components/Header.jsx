import React from 'react';
import { Sun, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex justify-end items-center py-4 px-8 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-4">
        <button className="p-2 text-textMuted hover:bg-gray-100 rounded-full transition-colors border border-border">
          <Sun size={20} />
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-primary font-bold flex items-center justify-center">
            AR
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-textMain">Aarav Sharma</p>
            <p className="text-xs text-textMuted">Patient</p>
          </div>
          <ChevronDown size={16} className="text-textMuted ml-1" />
        </div>
      </div>
    </div>
  );
}
