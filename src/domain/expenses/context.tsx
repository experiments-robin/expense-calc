import React, { createContext, useContext, useMemo } from 'react';
import { ExpenseOperationsModule } from './module';
import { FirebaseExpenseStorageAdapter } from './adapters/firebaseAdapter';

interface ExpenseContextType {
  expenseModule: ExpenseOperationsModule;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const expenseModule = useMemo(() => {
    const adapter = new FirebaseExpenseStorageAdapter();
    return new ExpenseOperationsModule(adapter);
  }, []);

  return (
    <ExpenseContext.Provider value={{ expenseModule }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseModule = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseModule must be used within an ExpenseProvider');
  }
  return context.expenseModule;
};
