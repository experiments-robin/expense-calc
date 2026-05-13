import { BaseExpense } from'./types';

/**
 * Storage Port for the Expense Operations Module.
 * Defines the interface for persisting and retrieving expenses,
 * allowing us to swap Firestore with an in-memory adapter for testing.
 */
export interface ExpenseStoragePort {
  /**
   * Fetch all expenses for a group
   */
  getExpenses(groupId: string): Promise<BaseExpense[]>;
  
  /**
   * Subscribe to real-time expense updates
   */
  subscribeToExpenses(groupId: string, callback: (expenses: BaseExpense[]) => void): () => void;
  
  /**
   * Create a new expense
   * @returns The generated expense ID
   */
  createExpense(groupId: string, expense: Omit<BaseExpense,'id' |'createdAt'>): Promise<string>;
  
  /**
   * Update an existing expense
   */
  updateExpense(groupId: string, expenseId: string, updates: Partial<BaseExpense>): Promise<void>;
  
  /**
   * Delete an expense
   */
  deleteExpense(groupId: string, expenseId: string): Promise<void>;
}
