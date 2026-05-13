import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { CaretLeft, Bell, CurrencyDollar, MapPin, SignOut } from '@phosphor-icons/react';
import { useCurrency } from '../hooks/useCurrency';

export default function SettingsPage({ user, theme, toggleTheme, onBack, onLogout }: { user: User, theme: string, toggleTheme: () => void, onBack: () => void, onLogout: () => void }) {
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
      className="p-4 md:p-8 max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <CaretLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <h1 className="text-3xl font-display font-bold tracking-tight text-zinc-900 dark:text-white">Profile & Settings</h1>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} alt="" className="w-28 h-28 rounded-3xl mx-auto shadow-md border border-white dark:border-zinc-800 mb-6 object-cover bg-white" />
             <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-1 tracking-tight">{user.displayName}</h3>
             <p className="text-sm text-zinc-500 truncate font-mono mb-8">{user.email}</p>
             
             <button
               onClick={onLogout}
               className="w-full py-3.5 px-4 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] transition-all"
             >
               <SignOut className="w-5 h-5" />
               Sign Out
             </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h2 className="text-xl font-bold mb-8 text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">Preferences</h2>
            
            <div className="space-y-8 relative z-10">
              {/* Currency Select */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <CurrencyDollar className="w-4 h-4" />
                  </span>
                  Primary Currency
                </label>
                <div className="relative">
                  <select 
                    value={localCurrency}
                    onChange={(e) => setLocalCurrency(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <CaretLeft className="w-4 h-4 text-zinc-400 -rotate-90" />
                  </div>
                </div>
              </div>

              {/* Timezone Select */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  Timezone Configuration
                </label>
                <div className="relative">
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="UTC">UTC Universal Time</option>
                    <option value="America/New_York">America / New York</option>
                    <option value="America/Los_Angeles">America / Los Angeles</option>
                    <option value="Europe/London">Europe / London</option>
                    <option value="Asia/Tokyo">Asia / Tokyo</option>
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Current: {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <CaretLeft className="w-4 h-4 text-zinc-400 -rotate-90" />
                  </div>
                </div>
              </div>

              {/* Notifications Toggle */}
              <div className="p-5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => setPushEnabled(!pushEnabled)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-[14px] flex items-center justify-center transition-transform group-hover:scale-105">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-[15px] mb-0.5">Push Notifications</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Receive alerts when groups update</p>
                  </div>
                </div>
                <button 
                  className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 border ${pushEnabled ? 'bg-emerald-500 border-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-600'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-sm ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between relative z-10">
              <div className="h-6 flex items-center">
                {savedMessage && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg"
                  >
                    ✓ Preferences Saved
                  </motion.span>
                )}
              </div>
              <button 
                onClick={handleSave}
                className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-2xl active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.1)] focus:ring-4 focus:ring-zinc-900/20 dark:focus:ring-white/20 outline-none"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
