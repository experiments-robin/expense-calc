import { BaseExpense, BudgetAggregationResult } from'./types';
import { ExpenseStoragePort } from'./ports';

export class ExpenseOperationsModule {
  constructor(private storage: ExpenseStoragePort) {}

  /**
   * Add a new expense, enforcing basic domain invariants.
   */
  async addExpense(groupId: string, expenseData: Omit<BaseExpense,'id' |'createdAt'>): Promise<string> {
    if (expenseData.amount <= 0) {
      throw new Error("Amount must be positive");
    }
    // More complex split logic validation could live here
    return this.storage.createExpense(groupId, expenseData);
  }

  async updateExpense(groupId: string, expenseId: string, updates: Partial<BaseExpense>): Promise<void> {
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error("Amount must be positive");
    }
    return this.storage.updateExpense(groupId, expenseId, updates);
  }

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    return this.storage.deleteExpense(groupId, expenseId);
  }

  getExpenses(groupId: string): Promise<BaseExpense[]> {
    return this.storage.getExpenses(groupId);
  }

  subscribeToExpenses(groupId: string, callback: (expenses: BaseExpense[]) => void): () => void {
    return this.storage.subscribeToExpenses(groupId, callback);
  }

  /**
   * Given a list of expenses and budget rules, compute the aggregations.
   * This is a pure function, deeply testable.
   */
  calculateAggregations(
    expenses: BaseExpense[], 
    totalBudget: number | null, 
    budgetType:'weekly' |'monthly' |'total' | null
  ): BudgetAggregationResult {
    let totalSpent = 0;
    const spentByCategory: Record<string, number> = {};
    const memberBalances: Record<string, number> = {};

    for (const exp of expenses) {
      totalSpent += exp.amount;
      spentByCategory[exp.category] = (spentByCategory[exp.category] || 0) + exp.amount;
      
      // Calculate split logic (simplified)
      // For instance, everyone owes their share
    }

    return {
      totalSpent,
      totalBudget,
      budgetType,
      spentByCategory,
      memberBalances
    };
  }
}
