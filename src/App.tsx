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
import MainLayout from './components/MainLayout';
import SubscriptionsPage from './components/SubscriptionsPage';
import SavingsPage from './components/SavingsPage';
import GroupDetailPage from './components/GroupDetailPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
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

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app/dashboard" /> : <LandingPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/privacy" element={<PrivacyPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/faq" element={<FAQPage theme={theme} toggleTheme={toggleTheme} />} />
      
      {user && (
        <Route path="/app" element={
          <MainLayout 
            user={user} 
            groups={groups} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
            onLogout={logOut}
          />
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={
            <motion.div
              initial={{ opacity: 0, y: 10, filter:'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter:'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter:'blur(10px)' }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="p-10 max-w-7xl mx-auto"
            >
              <Dashboard 
                user={user} 
                groups={groups} 
                theme={theme}
              />
            </motion.div>
          } />
          <Route path="subscriptions" element={<SubscriptionsPage user={user} />} />
          <Route path="savings" element={<SavingsPage user={user} />} />
          <Route path="settings" element={<SettingsPage user={user} theme={theme} toggleTheme={toggleTheme} onBack={() => navigate('/app/dashboard')} onLogout={logOut} />} />
          <Route path="groups/:id" element={<GroupDetailPage user={user} theme={theme} />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
