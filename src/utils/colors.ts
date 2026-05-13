export const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#f59e0b', // amber-500
  'Rent': '#3b82f6', // blue-500
  'Utilities': '#0ea5e9', // sky-500
  'Transport': '#8b5cf6', // violet-500
  'Entertainment': '#ec4899', // pink-500
  'Shopping': '#ef4444', // red-500
  'Health': '#10b981', // emerald-500
  'Travel': '#06b6d4', // cyan-500
  'Other': '#71717a' // zinc-500
};

export const getColorForCategory = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
};
