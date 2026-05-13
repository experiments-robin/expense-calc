import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash, PencilSimple, X, Target, Coins } from '@phosphor-icons/react';
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { useCurrency } from '../../hooks/useCurrency';

interface SavingsGoalsListProps {
  user: User;
}

export default function SavingsGoalsList({ user }: SavingsGoalsListProps) {
  const { currencySymbol } = useCurrency();
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useSavingsGoals(user.uid);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10b981'); // default emerald

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setColor('#10b981');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (goal: any) => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline?.toDate().toISOString().split('T')[0] || '');
    setColor(goal.color || '#10b981');
    setEditingId(goal.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount) return;

    try {
      const data = {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || '0'),
        deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
        color
      };

      if (editingId) {
        await updateGoal(editingId, data);
      } else {
        await addGoal(data);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Savings Goals</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">
              {currencySymbol}{totalSaved.toFixed(2)} saved of {currencySymbol}{totalTarget.toFixed(2)} target
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="w-10 h-10 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-full flex items-center justify-center transition-all duration-700 ease-fluid active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" weight="bold" />
          </button>
        </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900 dark:text-white">{editingId ? 'Edit Goal' : 'New Savings Goal'}</h3>
                <button type="button" onClick={resetForm} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Goal Name</label>
                  <select
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium appearance-none dark:text-white"
                  >
                    <option value="" disabled>Select a goal...</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Vacation">Vacation</option>
                    <option value="New Car">New Car</option>
                    <option value="House Downpayment">House Downpayment</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Phone">Phone</option>
                    <option value="Education">Education</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Investment">Investment</option>
                    <option value="Gift">Gift</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">{currencySymbol}</span>
                    <input
                      required
                      type="number"
                      step="1"
                      min="1"
                      value={targetAmount}
                      onChange={e => setTargetAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Current Saved</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={currentAmount}
                      onChange={e => setCurrentAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold dark:text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95">
                Save Goal
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-zinc-900 dark:text-white font-bold mb-1">No savings goals</h3>
            <p className="text-zinc-500 text-sm">Set a target to start tracking your savings</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            return (
              <div key={goal.id} className="group p-5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] transition-colors relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                      <Coins className="w-5 h-5" weight="fill" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white">{goal.name}</h4>
                      {goal.deadline && (
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">
                          Target: {goal.deadline.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(goal)} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                      <PencilSimple className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400">{currencySymbol}{goal.currentAmount.toLocaleString()} saved</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </div>
  );
}
