import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendUp as TrendingUp, ChartPieSlice as PieChartIcon } from '@phosphor-icons/react';
import { Group } from '../../types';
import { BaseExpense } from '../../domain/expenses/types';
import { formatCurrency } from '../../utils/format';
import { useCurrency } from '../../hooks/useCurrency';

interface GroupChartsProps {
  group: Group;
  expenses: BaseExpense[];
  currentPeriodExpenses: BaseExpense[];
  theme: 'light' | 'dark';
}

import { getColorForCategory } from '../../utils/colors';

export default function GroupCharts({ group, expenses, currentPeriodExpenses, theme }: GroupChartsProps) {
  const { currencySymbol } = useCurrency();
  const lineData = useMemo(() => {
    if (!group || group.budgetType === 'total') return [];
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const data = [];
    
    if (group.budgetType === 'weekly') {
      const firstDayOfYear = new Date(currentYear, 0, 1);
      const startOfFirstWeek = new Date(firstDayOfYear);
      startOfFirstWeek.setDate(firstDayOfYear.getDate() - firstDayOfYear.getDay());
      startOfFirstWeek.setHours(0, 0, 0, 0);

      for (let i = 0; i < 52; i++) {
        const weekStart = new Date(startOfFirstWeek);
        weekStart.setDate(startOfFirstWeek.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weekSpent = expenses
          .filter(e => {
            const ed = e.date;
            return ed >= weekStart && ed < weekEnd && ed.getFullYear() === currentYear;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        
        data.push({ 
          name: `W${i + 1}`, 
          amount: weekSpent 
        });
      }
    } else if (group.budgetType === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        const monthSpent = expenses
          .filter(e => {
            const ed = e.date;
            return ed.getMonth() === i && ed.getFullYear() === currentYear;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        data.push({ name: monthNames[i], amount: monthSpent });
      }
    }
    return data;
  }, [group, expenses]);

  const pieData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    currentPeriodExpenses.forEach(e => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [currentPeriodExpenses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 min-w-0">
      {group.budgetType !== 'total' && (
        <div className="double-bezel overflow-hidden min-w-0">
          <div className="double-bezel-inner p-4 sm:p-8 h-full">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-8 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Spending Trend ({group.budgetType})
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 500 }}
                  interval="preserveStart"
                  minTickGap={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 500 }}
                  tickFormatter={(value: number) => `${currencySymbol}${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                    padding: '12px', 
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', 
                    color: theme === 'dark' ? '#ffffff' : '#18181b' 
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600, color: theme === 'dark' ? '#ffffff' : '#18181b' }}
                  labelStyle={{ fontSize: '10px', color: '#71717a', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}
                  formatter={(value: number) => [`${currencySymbol}${formatCurrency(value)}`, 'Spent']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      )}
      <div className={`double-bezel overflow-hidden min-w-0 ${group.budgetType === 'total' ? 'lg:col-span-2' : ''}`}>
        <div className="double-bezel-inner p-4 sm:p-8 h-full">
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-8 flex items-center gap-2">
          <PieChartIcon className="w-4 h-4" />
          Category Distribution
        </h3>
        <div className="h-[280px] w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForCategory(entry.name)} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${currencySymbol}${formatCurrency(value)}`, 'Total']}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: `1px solid ${theme === 'dark' ? 'var(--color-zinc-800)' : 'var(--color-zinc-200)'}`, 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                    padding: '12px', 
                    backgroundColor: theme === 'dark' ? 'var(--color-zinc-950)' : 'var(--color-white)', 
                    color: theme === 'dark' ? 'var(--color-zinc-100)' : 'var(--color-zinc-900)' 
                  }}
                  itemStyle={{ color: theme === 'dark' ? 'var(--color-zinc-100)' : 'var(--color-zinc-900)' }}
                  labelStyle={{ color: theme === 'dark' ? 'var(--color-zinc-400)' : 'var(--color-zinc-500)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 500, paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm">
              <PieChartIcon className="w-10 h-10 mb-2 opacity-20" />
              <h4 className="font-bold text-zinc-900 dark:text-white mb-1">No expenses yet</h4>
              <p className="font-medium">It's so quiet, you can hear a penny drop.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
