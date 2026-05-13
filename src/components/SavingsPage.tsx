import React from 'react';
import { User } from 'firebase/auth';
import SavingsGoalsList from './finance/SavingsGoalsList';
import { motion } from 'motion/react';

interface SavingsPageProps {
  user: User;
}

export default function SavingsPage({ user }: SavingsPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-10 max-w-7xl mx-auto"
    >
      <header className="mb-12">
        <span className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold mb-6 inline-block text-zinc-500 dark:text-zinc-400">Goals</span>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4 font-display leading-tight">
          Savings <span className="text-emerald-600 dark:text-emerald-400">Milestones</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-lg">
          Plan for the future and track your progress towards your financial goals.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <SavingsGoalsList user={user} />
      </div>
    </motion.div>
  );
}
