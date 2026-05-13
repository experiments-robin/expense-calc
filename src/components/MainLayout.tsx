import React from 'react';
import { User } from 'firebase/auth';
import { Group } from '../types';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Wallet, List as Menu, Sun, Moon } from '@phosphor-icons/react';

interface MainLayoutProps {
  user: User;
  groups: Group[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function MainLayout({
  user,
  groups,
  theme,
  toggleTheme,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-[#FDFBF7] dark:bg-[#050505] font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden transition-colors duration-700">
      {/* Cinematic Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:128px_128px]" />

      <Sidebar 
        user={user} 
        groups={groups} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        {/* Mobile/Tablet Header */}
        <header className="lg:hidden flex-none sticky top-0 z-[40] bg-[#FDFBF7]/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-900 dark:bg-white rounded-[10px] flex items-center justify-center shadow-lg">
                <Wallet weight="duotone" className="w-5 h-5 text-zinc-50 dark:text-zinc-900" />
              </div>
              <span className="font-bold text-zinc-900 dark:text-white font-display tracking-tight">Budgeted</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-6 lg:pt-10 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
