export type SplitType ='equal' |'percentage' |'exact';

export interface BaseExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: Date;
  createdAt: Date;
  splitType?: SplitType;
  splitDetails?: Record<string, number>;
}

export interface BudgetAggregationResult {
  totalSpent: number;
  totalBudget: number | null;
  budgetType:'weekly' |'monthly' |'total' | null;
  spentByCategory: Record<string, number>;
  memberBalances: Record<string, number>; // positive = owes money, negative = is owed
}
