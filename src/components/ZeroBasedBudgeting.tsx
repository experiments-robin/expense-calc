import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator, ArrowRight, CheckCircle, Sparkle as Sparkles, WarningCircle } from '@phosphor-icons/react';
import { CATEGORIES } from '../types';
import { useCurrency } from '../hooks/useCurrency';

interface ZeroBasedBudgetingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ZeroBasedBudgeting({ isOpen, onClose }: ZeroBasedBudgetingProps) {
  const { currencySymbol } = useCurrency();
  const [income, setIncome] = useState<string>('5000');
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);

  // Remaining equals income - sum of all allocations
  const numericIncome = parseFloat(income) || 0;
  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => sum + val, 0);
  }, [allocations]);
  
  const remaining = numericIncome - totalAllocated;

  const handleAllocationChange = (category: string, value: string) => {
    const num = parseFloat(value) || 0;
    setAllocations(prev => ({
      ...prev,
      [category]: num
    }));
  };

  const runAutopilot = () => {
    setIsAutoPlanning(true);
    // Simulate AI thinking
    setTimeout(() => {
      // 50-30-20 rule based autopilot simulation
      if (numericIncome > 0) {
        const newAllocations: Record<string, number> = {};
        
        // Needs (50%)
        newAllocations['Rent'] = numericIncome * 0.30;
        newAllocations['Utilities'] = numericIncome * 0.05;
        newAllocations['Food'] = numericIncome * 0.10;
        newAllocations['Health'] = numericIncome * 0.05;

        // Wants (30%)
        newAllocations['Entertainment'] = numericIncome * 0.10;
        newAllocations['Shopping'] = numericIncome * 0.10;
        newAllocations['Travel'] = numericIncome * 0.10;

        // Savings & Others (20%)
        newAllocations['Other'] = numericIncome * 0.20; // representing savings/debt

        setAllocations(newAllocations);
      }
      setIsAutoPlanning(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-zinc-200/50 dark:border-white/5 p-6 sm:p-10 outline-none max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-start justify-between mb-8 shrink-0">
              <div className="pr-12">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Calculator className="w-3.5 h-3.5" weight="bold" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Zero-Based Planning
                  </span>
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-display leading-tight">Monthly Budget</h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">
                  Give every dollar a purpose. Your income minus expenses should equal zero.
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors absolute top-6 right-6 sm:top-10 sm:right-10"
              >
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 -mr-2 space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Income Pane */}
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 rounded-[24px] p-6 border border-zinc-100 dark:border-white/5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-4">Total Income</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold text-2xl transition-colors">{currencySymbol}</span>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full pl-12 pr-5 py-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-mono font-bold text-3xl text-zinc-900 dark:text-white group-hover:border-zinc-300 dark:group-hover:border-zinc-600 shadow-sm"
                    />
                  </div>
                </div>

                {/* Remaining Pane */}
                <div className="flex-1 flex flex-col justify-center bg-zinc-900 dark:bg-zinc-950 rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Calculator className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Unallocated</span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${remaining === 0 ? 'bg-emerald-500/20 text-emerald-300' : remaining < 0 ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>
                        {remaining === 0 ? 'Balanced' : remaining < 0 ? 'Over Budget' : 'Needs Purpose'}
                      </span>
                    </div>
                    <p className={`text-5xl font-bold tracking-tight font-mono ${remaining === 0 ? 'text-emerald-400' : remaining < 0 ? 'text-red-400' : 'text-white'}`}>
                      {currencySymbol}{Math.abs(remaining).toFixed(2)}
                    </p>
                    {remaining !== 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10 text-sm font-medium text-zinc-400">
                        {remaining > 0 ? `Assign ${currencySymbol}${remaining.toFixed(2)} to a category to balance.` : `Reduce spending by ${currencySymbol}${Math.abs(remaining).toFixed(2)}!`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Allocations</h4>
                  <button 
                    onClick={runAutopilot}
                    disabled={isAutoPlanning || numericIncome <= 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-sm rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all disabled:opacity-50 active:scale-95 group border border-emerald-100 dark:border-emerald-500/20"
                  >
                    {isAutoPlanning ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" weight="fill" />}
                    Autopilot Setup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CATEGORIES.map(category => (
                    <div key={category} className="group flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 hover:border-zinc-300 dark:hover:border-white/10 transition-colors">
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-3 ml-1">{category}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">{currencySymbol}</span>
                        <input
                          type="number"
                          value={allocations[category] || ''}
                          onChange={(e) => handleAllocationChange(category, e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-mono font-bold text-base dark:text-white shadow-inner"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] active:scale-[0.98] outline-none focus:ring-4 focus:ring-zinc-900/20 dark:focus:ring-white/20 text-lg"
              >
                Save Budget Plan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
