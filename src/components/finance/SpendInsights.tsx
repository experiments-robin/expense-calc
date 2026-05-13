import { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, YAxis } from 'recharts';
import { Warning, TrendUp } from '@phosphor-icons/react';
import { Group, Expense, CATEGORIES } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { getColorForCategory } from '../../utils/colors';

interface SpendInsightsProps {
  user: User;
  groups: Group[];
  expenses: Expense[] | any[]; // any because DashboardExpense is used
  theme: 'light' | 'dark';
}

export default function SpendInsights({ user, groups, expenses, theme }: SpendInsightsProps) {
  const { currencySymbol } = useCurrency();
  const [timeframe, setTimeframe] = useState<'thisMonth' | 'lastMonth'>('thisMonth');

  const { insightsData, anomalies } = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Calculate limits (We could fetch real limits from userProfile, but we do simple auto-limits for now)
    // Runaway limits: if they spend > $500 in a category, that's an anomaly (in a real app this is user-defined)
    // Or compare month-over-month
    
    const currTotals: Record<string, number> = {};
    const prevTotals: Record<string, number> = {};
    CATEGORIES.forEach(c => { currTotals[c] = 0; prevTotals[c] = 0; });

    expenses.forEach(exp => {
      // Filter out expenses not by user (unless household)
      if (exp.paidBy !== user.uid) return;

      const date = exp.date;
      if (date >= currentMonthStart) {
        if (currTotals[exp.category] !== undefined) currTotals[exp.category] += exp.amount;
      } else if (date >= lastMonthStart && date < currentMonthStart) {
        if (prevTotals[exp.category] !== undefined) prevTotals[exp.category] += exp.amount;
      }
    });

    const anomalies: any[] = [];
    const dataDisplay = timeframe === 'thisMonth' ? currTotals : prevTotals;

    // Detect anomalies (e.g. spending > 50% more than last month and > $50)
    if (timeframe === 'thisMonth') {
      CATEGORIES.forEach(c => {
        const curr = currTotals[c];
        const prev = prevTotals[c];
        if (prev > 0 && curr > prev * 1.5 && curr > 50) {
          anomalies.push({ category: c, increase: Math.round(((curr - prev) / prev) * 100), amount: curr });
        }
      });
    }

    const chartData = Object.entries(dataDisplay)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);

    return { insightsData: chartData, anomalies };
  }, [expenses, timeframe, user.uid]);

  if (insightsData.length === 0) return null;

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner p-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Advanced Insights</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Smart analysis of your spending habits</p>
          </div>
          <select 
            value={timeframe} 
            onChange={(e: any) => setTimeframe(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border-none text-zinc-900 dark:text-white font-bold text-sm px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none h-10 shadow-sm"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>

      {anomalies.length > 0 && (
        <div className="mb-8 space-y-3">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Runaway Alerts</h3>
          {anomalies.map(anom => (
            <div key={anom.category} className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <Warning weight="bold" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-red-950 dark:text-red-200">Spike in {anom.category}</p>
                <p className="text-sm font-medium text-red-800 dark:text-red-400/80">
                  {anom.increase}% higher than last month ({currencySymbol}{anom.amount.toFixed(2)})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-4">Category Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insightsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: theme === 'dark' ? 'var(--color-zinc-400)' : 'var(--color-zinc-500)', fontWeight: 'bold' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: theme === 'dark' ? 'var(--color-zinc-400)' : 'var(--color-zinc-500)', fontWeight: 'bold' }}
                tickFormatter={(value) => `${currencySymbol}${value}`}
              />
              <Tooltip
                cursor={{ fill: theme === 'dark' ? 'var(--color-zinc-800)' : 'var(--color-zinc-50)' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: `1px solid ${theme === 'dark' ? 'var(--color-zinc-800)' : 'var(--color-zinc-200)'}`, 
                  backgroundColor: theme === 'dark' ? 'var(--color-zinc-950)' : 'var(--color-white)', 
                  color: theme === 'dark' ? 'var(--color-zinc-100)' : 'var(--color-zinc-900)' 
                }}
                labelStyle={{ color: theme === 'dark' ? 'var(--color-zinc-400)' : 'var(--color-zinc-500)', fontWeight: 'bold' }}
                formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Total']}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {insightsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorForCategory(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  );
}
