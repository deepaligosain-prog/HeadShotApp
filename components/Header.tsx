import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">ProHeadshot</h1>
            <p className="text-xs text-indigo-600 font-medium">POWERED BY GEMINI</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <span>Nano Banana Model Active</span>
          </div>
          <a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors">
            <Sparkles className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
};