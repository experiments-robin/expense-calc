import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash, PencilSimple, X, Repeat, CreditCard } from '@phosphor-icons/react';
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useCurrency } from '../../hooks/useCurrency';
import { CATEGORIES } from '../../types';

interface SubscriptionsListProps {
  user: User;
}

export default function SubscriptionsList({ user }: SubscriptionsListProps) {
  const { currencySymbol } = useCurrency();
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions(user.uid);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to Rent or similar
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setCycle('monthly');
    setCategory(CATEGORIES[1]);
    setNextDate(new Date().toISOString().split('T')[0]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (sub: any) => {
    setName(sub.name);
    setAmount(sub.amount.toString());
    setCycle(sub.cycle);
    setCategory(sub.category);
    setNextDate(sub.nextBillingDate?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
    setEditingId(sub.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    try {
      const data = {
        name: name.trim(),
        amount: parseFloat(amount),
        cycle,
        category,
        nextBillingDate: Timestamp.fromDate(new Date(nextDate)),
        active: true
      };

      if (editingId) {
        await updateSubscription(editingId, data);
      } else {
        await addSubscription(data);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate monthly total
  const monthlyTotal = subscriptions.reduce((total, sub) => {
    if (!sub.active) return total;
    if (sub.cycle === 'monthly') return total + sub.amount;
    if (sub.cycle === 'yearly') return total + (sub.amount / 12);
    if (sub.cycle === 'weekly') return total + (sub.amount * 4.33); // approx weeks
    return total;
  }, 0);

  if (loading) return null;

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Subscriptions</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">
              {currencySymbol}{monthlyTotal.toFixed(2)} / month avg
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="w-10 h-10 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-full flex items-center justify-center transition-all duration-700 ease-fluid active:scale-95"
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
                <h3 className="font-bold text-zinc-900 dark:text-white">{editingId ? 'Edit Subscription' : 'New Subscription'}</h3>
                <button type="button" onClick={resetForm} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Service Name</label>
                  <select
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium appearance-none dark:text-white"
                  >
                    <option value="" disabled>Select a service...</option>
                    <option value="Netflix">Netflix</option>
                    <option value="Spotify">Spotify</option>
                    <option value="Amazon Prime">Amazon Prime</option>
                    <option value="Gym Membership">Gym Membership</option>
                    <option value="Internet Bill">Internet Bill</option>
                    <option value="Mobile Plan">Mobile Plan</option>
                    <option value="Apple One">Apple One</option>
                    <option value="Disney+">Disney+</option>
                    <option value="Hulu">Hulu</option>
                    <option value="YouTube Premium">YouTube Premium</option>
                    <option value="Xbox Game Pass">Xbox Game Pass</option>
                    <option value="PlayStation Plus">PlayStation Plus</option>
                    <option value="Creative Cloud">Creative Cloud</option>
                    <option value="Office 365">Office 365</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">{currencySymbol}</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Billing Cycle</label>
                  <select
                    value={cycle}
                    onChange={(e: any) => setCycle(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium appearance-none dark:text-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Next Billing Date</label>
                  <input
                    required
                    type="date"
                    value={nextDate}
                    onChange={e => setNextDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold dark:text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95">
                Save Subscription
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Repeat className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-zinc-900 dark:text-white font-bold mb-1">No subscriptions yet</h3>
            <p className="text-zinc-500 text-sm">Add your recurring bills to track them</p>
          </div>
        ) : (
          subscriptions.map(sub => (
            <div key={sub.id} className="group flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shadow-sm border border-slate-100 dark:border-zinc-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">{sub.name}</h4>
                  <div className="text-xs font-medium text-zinc-500 tracking-wide mt-0.5">
                    {sub.cycle.charAt(0).toUpperCase() + sub.cycle.slice(1)} • Next billing: {sub.nextBillingDate?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-bold text-zinc-900 dark:text-white block">{currencySymbol}{sub.amount.toFixed(2)}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(sub)} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                    <PencilSimple className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}
