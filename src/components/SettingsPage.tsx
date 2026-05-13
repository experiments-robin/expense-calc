import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { CaretLeft, Globe, Bell, CurrencyDollar, MapPin, HandTap } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

export default function SettingsPage({ user, theme, toggleTheme, onBack }: { user: User, theme: string, toggleTheme: () => void, onBack: () => void }) {
  const { currencyCode, setCurrency } = useCurrency();
  const [localCurrency, setLocalCurrency] = useState(currencyCode);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setCurrency(localCurrency);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="p-6 md:p-10 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <CaretLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white">Profile & Settings</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-center">
             <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt="" className="w-24 h-24 rounded-2xl mx-auto shadow-sm border border-zinc-200 dark:border-white/10 mb-4" />
             <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-1">{user.displayName}</h3>
             <p className="text-sm text-zinc-500 truncate font-mono">{user.email}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4">Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  <CurrencyDollar className="w-4 h-4 text-emerald-500" />
                  Primary Currency
                </label>
                <select 
                  value={localCurrency}
                  onChange={(e) => setLocalCurrency(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Timezone Analysis
                </label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New York</option>
                  <option value="America/Los_Angeles">America/Los Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
                </select>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Push Notifications</h4>
                    <p className="text-xs text-zinc-500">Enable for PWA functionality</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${pushEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                {savedMessage && <span className="text-emerald-600 font-medium text-sm">Saved successfully!</span>}
              </div>
              <button 
                onClick={handleSave}
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
