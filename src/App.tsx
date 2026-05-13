/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from'react';
import { auth, db, signIn, logOut } from'./firebase';
import { onAuthStateChanged, User } from'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc,
  getDocs,
  deleteDoc,
  collectionGroup,
  where,
  getDocFromServer
} from'firebase/firestore';
import { handleFirestoreError, OperationType } from'./utils/errorHandling';
import { 
  Plus, 
  SignOut as LogOut, 
  SquaresFour as LayoutDashboard, 
  Users, 
  Receipt, 
  Gear as Settings, 
  CaretRight as ChevronRight,
  Wallet,
  ChartPieSlice as PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  MagnifyingGlass as Search,
  Funnel as Filter,
  DotsThreeVertical as MoreVertical,
  List as Menu,
  X,
  Sun,
  Moon
} from'@phosphor-icons/react';
import { motion, AnimatePresence } from'motion/react';
import { Group, UserProfile } from'./types';

// Components
import Dashboard from'./components/Dashboard';
import GroupView from'./components/GroupView';
import CreateGroupModal from './components/CreateGroupModal';
import LandingPage from './components/LandingPage';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PrivacyPage from './components/PrivacyPage';
import FAQPage from './components/FAQPage';
import SettingsPage from './components/SettingsPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dataDeletedPopup, setDataDeletedPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState<'light' |'dark'>(() => {
    if (typeof window !=='undefined') {
      return (localStorage.getItem('theme') as'light' |'dark') ||'dark';
    }
    return'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme ==='dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev ==='dark' ?'light' :'dark');
  };

  useEffect(() => {
    (window as any).openCreateGroupModal = () => setIsCreateModalOpen(true);
    return () => {
      delete (window as any).openCreateGroupModal;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user has seen welcome popup
        const hasSeenWelcome = localStorage.getItem(`hasSeenWelcome_${currentUser.uid}`);
        if (!hasSeenWelcome) {
          setShowWelcomePopup(true);
        }

        // Ensure user profile exists
        const userRef = doc(db,'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              createdAt: serverTimestamp(),
            });
          } else {
            const data = userSnap.data();
            const createdAt = data.createdAt?.toDate();
            if (createdAt && (Date.now() - createdAt.getTime() > 24 * 60 * 60 * 1000)) {
              // Delete all groups created by this user
              console.log("Checking for demo data reset...");
              const groupsQuery = query(collection(db,'groups'), where('memberIds','array-contains', currentUser.uid));
              const groupsSnap = await getDocs(groupsQuery);
              for (const groupDoc of groupsSnap.docs) {
                if (groupDoc.data().createdBy === currentUser.uid) {
                  await deleteDoc(doc(db,'groups', groupDoc.id));
                }
              }
              // Reset their createdAt
              await setDoc(userRef, {
                ...data,
                createdAt: serverTimestamp(),
              });
              // Show popup
              setDataDeletedPopup(true);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE,'users');
        }

        // Test connection (CRITICAL CONSTRAINT)
        try {
          await getDocFromServer(doc(db,'users', currentUser.uid));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      return;
    }

    // Query groups where the user is a member using the memberIds array
    const groupsQuery = query(
      collection(db,'groups'),
      where('memberIds','array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
      console.log(`Groups snapshot received: ${snapshot.docs.length} groups`);
      setLastError(null);
      const fetchedGroups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Group));
      setGroups(fetchedGroups);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'groups', false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedGroupId && !groups.find(g => g.id === selectedGroupId)) {
      setSelectedGroupId(null);
    }
  }, [groups, selectedGroupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const appLayout = user ? (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03] dark:opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:128px_128px]" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/5 flex flex-col z-50 lg:z-10 transition-all duration-300 ease-in-out overflow-y-auto custom-scrollbar
        ${isSidebarOpen ?'translate-x-0' :'-translate-x-full lg:translate-x-0'}
      `}>
        {/* Vibrant background glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10 dark:opacity-20">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-zinc-300 dark:bg-zinc-800 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 -right-32 w-64 h-64 bg-zinc-300 dark:bg-zinc-800 rounded-full blur-[100px]" />
        </div>

        <div className="p-8 relative z-10 shrink-0">
                <div className="flex items-center justify-between mb-10 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 ease-out-expo">
                <Wallet weight="duotone" className="w-6 h-6 text-white dark:text-zinc-900 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Budgeted</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => {
                setSelectedGroupId(null);
                setIsSidebarOpen(false);
                navigate('/app');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-700 ease-fluid active:scale-[0.98] ${!selectedGroupId ?'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-lg' :'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard weight={!selectedGroupId ? 'fill' : 'regular'} className="w-5 h-5" />
              <span className="font-bold">Dashboard</span>
            </button>
            <button 
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-700 ease-fluid active:scale-[0.98] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
            >
              <Settings className="w-5 h-5" />
              <span className="font-bold">Settings</span>
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 relative z-10 custom-scrollbar min-h-[200px]">
          <div className="flex items-center justify-between px-4 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Your Groups</span>
            <button 
              onClick={() => {
                setIsCreateModalOpen(true);
                setIsSidebarOpen(false);
              }}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-700 ease-fluid active:scale-[0.98] group ${selectedGroupId === group.id ?'bg-emerald-600 text-white shadow-lg' :'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ease-fluid group-hover:scale-150 ${group.type ==='personal' ?'bg-blue-400' : group.type ==='household' ?'bg-emerald-400' :'bg-orange-400'}`} />
                  <span className="truncate text-sm font-bold">{group.name}</span>
                </div>
                {selectedGroupId === group.id && <ChevronRight className="w-4 h-4 opacity-70" />}
              </button>
            ))}
            {groups.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">No groups yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 mt-auto relative z-10 shrink-0">
          <div className="double-bezel mb-4">
            <div className="double-bezel-inner p-4 flex items-center gap-3">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt="" className="w-10 h-10 rounded-[calc(1rem-0.375rem)] border border-black/5 dark:border-white/10" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user.displayName}</p>
                <p className="text-[10px] text-zinc-500 truncate font-mono">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={logOut}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-700 ease-fluid active:scale-[0.98] font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-2xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-all duration-700 ease-fluid active:scale-[0.98]"
              title={theme ==='dark' ?'Switch to Light Mode' :'Switch to Dark Mode'}
            >
              {theme ==='dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
              <Wallet weight="duotone" className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <span className="font-bold text-white font-display">Budgeted</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          {!selectedGroupId ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10, filter:'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter:'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter:'blur(10px)' }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="p-10 max-w-7xl mx-auto"
            >
              <Dashboard 
                user={user} 
                groups={groups} 
                onSelectGroup={(id) => {
                  setSelectedGroupId(id);
                  setIsSidebarOpen(false);
                }}
                theme={theme}
              />
            </motion.div>
          ) : (
            <motion.div
              key={selectedGroupId}
              initial={{ opacity: 0, y: 10, filter:'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter:'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter:'blur(10px)' }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="p-10 max-w-7xl mx-auto"
            >
              <GroupView 
                groupId={selectedGroupId} 
                user={user} 
                onBack={() => setSelectedGroupId(null)} 
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}


      <CreateGroupModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        user={user!}
      />

    </div>
  ) : null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app" /> : <LandingPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/privacy" element={<PrivacyPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/faq" element={<FAQPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/settings" element={user ? <SettingsPage user={user} theme={theme} toggleTheme={toggleTheme} onBack={() => navigate('/app')} /> : <Navigate to="/" />} />
      <Route path="/app/*" element={user ? appLayout : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
