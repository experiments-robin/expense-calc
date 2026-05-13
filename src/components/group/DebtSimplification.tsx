import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowsLeftRight, CheckCircle } from '@phosphor-icons/react';
import { BaseExpense } from '../../domain/expenses/types';
import { GroupMember } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';

interface DebtSimplificationProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: BaseExpense[];
  members: GroupMember[];
}

interface Transaction {
  from: GroupMember;
  to: GroupMember;
  amount: number;
}

export default function DebtSimplification({ isOpen, onClose, expenses, members }: DebtSimplificationProps) {
  const { currencySymbol } = useCurrency();

  const transactions = useMemo(() => {
    if (members.length === 0 || expenses.length === 0) return [];

    // Calculate net balances
    const balances: Record<string, number> = {};
    members.forEach(m => balances[m.uid] = 0);

    expenses.forEach(e => {
      // Assuming equal splits for now as per AddExpenseModal
      const splitAmount = e.amount / members.length;
      members.forEach(m => {
        balances[m.uid] -= splitAmount;
      });
      if (balances[e.paidBy] !== undefined) {
        balances[e.paidBy] += e.amount;
      }
    });

    // Greedy min-cash-flow algorithm
    const debtors = members
      .map(m => ({ member: m, balance: balances[m.uid] }))
      .filter(x => x.balance < -0.01)
      .sort((a, b) => a.balance - b.balance); // Most negative first

    const creditors = members
      .map(m => ({ member: m, balance: balances[m.uid] }))
      .filter(x => x.balance > 0.01)
      .sort((a, b) => b.balance - a.balance); // Most positive first

    const result: Transaction[] = [];
    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      
      const amount = Math.min(-debtor.balance, creditor.balance);
      
      if (amount > 0.01) {
        result.push({
          from: debtor.member,
          to: creditor.member,
          amount
        });
      }

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) d++;
      if (Math.abs(creditor.balance) < 0.01) c++;
    }

    return result;
  }, [expenses, members]);

  return (
      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-zinc-200/50 dark:border-white/5 p-8 outline-none"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="pr-12">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <ArrowsLeftRight className="w-3.5 h-3.5" weight="bold" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Smart Settle
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display leading-tight">Optimized Transfers</h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">
                  Minimum number of transactions to balance all group debts.
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors absolute top-6 right-6"
              >
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center py-16 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" weight="duotone" />
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">All Settled Up</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">Everyone is fully paid back.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-5 rounded-2xl border border-zinc-100/50 dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="flex-1 min-w-0 flex flex-col items-end">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">From</span>
                          <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">
                            {tx.from.displayName || tx.from.email || 'Unknown'}
                          </span>
                        </div>
                        <div className="w-8 h-8 shrink-0 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 z-10">
                          <ArrowsLeftRight className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col items-start">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 mb-1">To</span>
                          <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">
                            {tx.to.displayName || tx.to.email || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 sm:pl-6 sm:border-l border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                        <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                          {currencySymbol}{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {transactions.length > 0 && (
              <div className="mt-8">
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-4 focus:ring-zinc-900/20 dark:focus:ring-white/20"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
