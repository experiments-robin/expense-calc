import React from 'react';
import { User } from 'firebase/auth';
import { Group } from '../types';
import { 
  Plus, 
  SignOut as LogOut, 
  SquaresFour as LayoutDashboard, 
  Gear as Settings, 
  CaretRight as ChevronRight,
  Wallet,
  X,
  Sun,
  Moon,
  List as Menu,
  Repeat,
  Target
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  user: User;
  groups: Group[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  groups,
  theme,
  toggleTheme,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (id: string) => location.pathname === `/app/groups/${id}`;

  const sidebarVariants = {
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`
          fixed lg:static inset-y-0 left-0 w-[22rem] lg:w-80 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-r border-zinc-200 dark:border-white/5 flex flex-col z-[70] lg:z-10 transition-all duration-300 ease-fluid overflow-hidden
          ${isSidebarOpen || 'lg:translate-x-0'}
        `}
      >
        {/* Vibrant background glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="p-10 relative z-10 shrink-0">
          <div className="flex items-center justify-between mb-12 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-700 ease-fluid">
                <Wallet weight="duotone" className="w-7 h-7 text-white dark:text-zinc-900 group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Budgeted</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
              { icon: Repeat, label: "Subscriptions", path: "/app/subscriptions" },
              { icon: Target, label: "Savings Goals", path: "/app/savings" },
              { icon: Settings, label: "Settings", path: "/app/settings" }
            ].map((link, idx) => (
              <motion.div key={link.path} variants={itemVariants}>
                <SidebarLink 
                  icon={link.icon} 
                  label={link.label} 
                  active={isActive(link.path) || (link.path === '/app/dashboard' && isActive('/app'))} 
                  onClick={() => {
                    navigate(link.path);
                    setIsSidebarOpen(false);
                  }} 
                />
              </motion.div>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 relative z-10 custom-scrollbar min-h-[200px]">
          <motion.div variants={itemVariants} className="flex items-center justify-between px-4 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Your Groups</span>
            <button 
              onClick={() => {
                (window as any).openCreateGroupModal?.();
                setIsSidebarOpen(false);
              }}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </motion.div>

          <div className="space-y-1">
            {groups.map((group, idx) => (
              <motion.div key={group.id} variants={itemVariants}>
                <button
                  onClick={() => {
                    navigate(`/app/groups/${group.id}`);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-[1.25rem] transition-all duration-700 ease-fluid active:scale-[0.98] group ${isGroupActive(group.id) ?'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' :'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-700 ease-fluid group-hover:scale-150 ${group.type ==='personal' ?'bg-blue-400' : group.type ==='household' ?'bg-emerald-400' :'bg-orange-400'}`} />
                    <span className="truncate text-sm font-bold tracking-tight">{group.name}</span>
                  </div>
                  {isGroupActive(group.id) ? (
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </motion.div>
            ))}
            {groups.length === 0 && (
              <motion.div variants={itemVariants} className="px-4 py-12 text-center">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">No active groups</p>
              </motion.div>
            )}
          </div>
        </div>

        <motion.div variants={itemVariants} className="p-8 mt-auto relative z-10 shrink-0">
          <div className="double-bezel mb-6 group cursor-pointer overflow-hidden">
            <div className="double-bezel-inner p-4 flex items-center gap-4 transition-colors duration-500 group-hover:bg-black/[0.02] dark:group-hover:bg-white/[0.02]">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt="" className="w-12 h-12 rounded-xl border border-black/5 dark:border-white/10 shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user.displayName}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono tracking-tighter">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-700 ease-fluid active:scale-[0.98] font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button 
              onClick={toggleTheme}
              className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all duration-700 ease-fluid active:scale-[0.98]"
              title={theme ==='dark' ?'Switch to Light Mode' :'Switch to Dark Mode'}
            >
              {theme ==='dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-700 ease-fluid active:scale-[0.98] ${active ?'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-lg' :'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}
    >
      <Icon weight={active ? 'fill' : 'regular'} className="w-5 h-5" />
      <span className="font-bold">{label}</span>
    </button>
  );
}
