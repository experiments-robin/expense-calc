import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ChartPieSlice, Users, Receipt, CaretRight, X } from '@phosphor-icons/react';
import { signIn } from '../firebase';

export default function LandingPage({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-x-hidden transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:128px_128px]" />
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-zinc-200/50 dark:bg-zinc-800/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-1/4 w-[80%] h-[80%] bg-emerald-200/20 dark:bg-emerald-800/10 rounded-full blur-[120px]" />
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 px-6 py-6 pointer-events-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] ${showHowItWorks ? 'bg-zinc-900 dark:bg-white' : 'bg-white'}`}>
              <Wallet weight="duotone" className={`w-6 h-6 ${showHowItWorks ? 'text-white dark:text-zinc-900' : 'text-zinc-900'}`} />
            </div>
            <span className={`text-xl font-bold tracking-tight font-display transition-colors ${showHowItWorks ? 'text-zinc-900 dark:text-white' : 'text-white'}`}>Budgetly</span>
          </div>
          <div className={`flex items-center gap-4 border p-1.5 rounded-2xl backdrop-blur-md transition-colors ${showHowItWorks ? 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50' : 'border-white/20 bg-white/10'}`}>
            <button 
              onClick={() => setShowSignInModal(true)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] ${showHowItWorks ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105' : 'bg-white text-zinc-900 hover:scale-105'}`}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {!showHowItWorks ? (
          <motion.main 
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center text-center overflow-hidden min-h-[100dvh]"
          >
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
              <video
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_094440_a3592600-bd1e-49e5-9bce-a73662061d83.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-zinc-950/40 transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-zinc-950/20 to-zinc-950/40 transition-colors" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col items-center justify-center w-full pt-28 pb-16 sm:py-24 my-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-6 sm:mb-8 text-xs sm:text-sm font-medium text-white shadow-lg"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                Start tracking together
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white mb-6 sm:mb-8 max-w-5xl font-display leading-[1.1] drop-shadow-xl"
              >
                Shared expenses, <br className="hidden sm:block" />
                <span className="text-zinc-200 italic font-medium drop-shadow-xl">beautifully resolved.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-2xl text-zinc-100 mb-10 sm:mb-12 max-w-3xl leading-relaxed font-medium drop-shadow-lg"
              >
                The professional way to track expenses, split bills, and manage shared budgets with your partner, roommates, or on trips.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <button 
                  onClick={() => setShowSignInModal(true)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-500 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 group ring-1 ring-white/20"
                >
                  Get Started
                  <CaretRight weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => setShowHowItWorks(true)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 border border-white/20 text-white backdrop-blur-xl rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all active:scale-95 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]"
                >
                  How it works
                </button>
              </motion.div>
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="how-it-works"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32"
          >
            <div className="mb-16">
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium mb-8"
              >
                <CaretRight weight="bold" className="w-4 h-4 rotate-180" />
                Back
              </button>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">How it works</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-emerald-600 dark:text-emerald-400">
                  <Users weight="duotone" className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 sm:mb-4">Create Groups</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                  Start by creating a group for anything—your household, a shared vacation, or an ongoing project. Set total or monthly budget limits optionally to keep spending on track.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-emerald-600 dark:text-emerald-400">
                  <Receipt weight="duotone" className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 sm:mb-4">Log Expenses easily</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                  Add expenses quickly, selecting who paid and what category it belongs to. Say goodbye to spreadsheets.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-emerald-600 dark:text-emerald-400">
                  <ChartPieSlice weight="duotone" className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-3 sm:mb-4">Deep insights</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">
                  Visualize your spending habits with fully integrated Categorical Breakdowns. See exactly where your money goes with deep pie chart integrations out of the box.
                </p>
              </div>
              
              <div className="bg-emerald-600 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col justify-center border border-emerald-500">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 font-display">Ready to master your budgets?</h3>
                <button 
                  onClick={() => setShowSignInModal(true)}
                  className="mt-4 sm:mt-6 w-full py-3.5 sm:py-4 bg-white text-emerald-950 rounded-2xl font-bold text-base sm:text-lg hover:bg-emerald-50 transition-all active:scale-95 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)]"
                >
                  Sign in instantly
                </button>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showSignInModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowSignInModal(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-w-md w-full bg-zinc-50/50 dark:bg-white/5 backdrop-blur-2xl p-6 sm:p-12 rounded-[32px] sm:rounded-[48px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-zinc-200 dark:border-white/10 relative z-10"
            >
              <button 
                onClick={() => setShowSignInModal(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800 rounded-full shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-zinc-900 dark:bg-white rounded-3xl sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                <Wallet weight="duotone" className="w-8 h-8 sm:w-12 sm:h-12 text-white dark:text-zinc-900" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-center tracking-tight mb-3 sm:mb-4 text-zinc-900 dark:text-white font-display">Sign In</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 sm:mb-10 text-center leading-relaxed text-sm">
                Join now to track expenses and manage shared budgets in seconds.
              </p>
              <button
                onClick={signIn}
                className="w-full py-3.5 sm:py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 sm:gap-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-sm sm:text-base outline-none focus:ring-4 focus:ring-emerald-500/40"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full p-0.5" />
                Continue with Google
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
