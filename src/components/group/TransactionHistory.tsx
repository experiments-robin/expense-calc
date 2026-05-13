import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Receipt, Funnel as Filter, Trash as Trash2, PencilSimple as Pencil } from '@phosphor-icons/react';
import { BaseExpense } from '../../domain/expenses/types';
import { GroupMember, CATEGORIES } from '../../types';
import { formatCurrency } from '../../utils/format';
import { useCurrency } from '../../hooks/useCurrency';
import { getColorForCategory } from '../../utils/colors';

interface TransactionHistoryProps {
  expenses: BaseExpense[];
  filteredExpenses: BaseExpense[];
  members: GroupMember[];
  timeFilter: string;
  setTimeFilter: (val: any) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  payeeFilter: string;
  setPayeeFilter: (val: string) => void;
  setEditingExpense: (expense: BaseExpense) => void;
  setExpenseToDelete: (id: string) => void;
}

export default function TransactionHistory({
  expenses,
  filteredExpenses,
  members,
  timeFilter,
  setTimeFilter,
  categoryFilter,
  setCategoryFilter,
  payeeFilter,
  setPayeeFilter,
  setEditingExpense,
  setExpenseToDelete
}: TransactionHistoryProps) {
  const { currencySymbol } = useCurrency();
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3 font-display">
          <Receipt className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
          Transaction History
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shrink-0 shadow-sm">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none appearance-none pr-4"
            >
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shrink-0 shadow-sm">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none appearance-none pr-4"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shrink-0 shadow-sm">
            <select 
              value={payeeFilter}
              onChange={(e) => setPayeeFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none appearance-none pr-4"
            >
              <option value="all">All Payees</option>
              {members.map(m => <option key={m.uid} value={m.uid}>{m.displayName || m.email}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-200/50 dark:border-zinc-800 overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
        {filteredExpenses.length === 0 ? (
          <div className="p-10 sm:p-20 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-300 dark:text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No transactions</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto text-sm">
              {expenses.length > 0 ? "No transactions match your filters." : "Start tracking your shared expenses by adding your first transaction."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 relative">
            <AnimatePresence mode="popLayout" initial={false}>
            {filteredExpenses.map((expense, index) => (
              <motion.div 
                key={expense.id}
                layout
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)', x: -20 }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', x: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)', transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.02 }}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between group transition-all duration-200 gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-700 transition-all duration-300 ease-out-expo shrink-0 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter text-zinc-500">{expense.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg sm:text-xl font-bold leading-none text-zinc-900 dark:text-white">{expense.date.getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{expense.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border shrink-0"
                        style={{
                          backgroundColor: `${getColorForCategory(expense.category)}1A`, // 10% opacity
                          color: getColorForCategory(expense.category),
                          borderColor: `${getColorForCategory(expense.category)}33` // 20% opacity
                        }}
                      >
                        {expense.category}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline shrink-0">•</span>
                      <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">Paid by {members.find(m => m.uid === expense.paidBy)?.displayName || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                  <div className="text-left sm:text-right min-w-0">
                    <p 
                      className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white font-mono tracking-tight truncate"
                      title={`${currencySymbol}${formatCurrency(expense.amount)}`}
                    >
                      {currencySymbol}{formatCurrency(expense.amount)}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setEditingExpense(expense)}
                      className="p-2 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl sm:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:bg-emerald-50 dark:focus:bg-emerald-500/10 transition-all active:scale-90 outline-none focus:ring-2 focus:ring-emerald-500"
                      title="Edit Expense"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setExpenseToDelete(expense.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl sm:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:bg-red-50 dark:focus:bg-red-500/10 transition-all active:scale-90 outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
