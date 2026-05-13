import { collection, doc, query, orderBy, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { BaseExpense } from '../types';
import { ExpenseStoragePort } from '../ports';
import { handleFirestoreError, OperationType } from '../../../utils/errorHandling';

export class FirebaseExpenseStorageAdapter implements ExpenseStoragePort {
  async getExpenses(groupId: string): Promise<BaseExpense[]> {
    try {
      const expensesQuery = query(collection(db, 'groups', groupId, 'expenses'), orderBy('date', 'desc'));
      const snapshot = await getDocs(expensesQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        } as BaseExpense;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `groups/${groupId}/expenses`);
      return [];
    }
  }

  subscribeToExpenses(groupId: string, callback: (expenses: BaseExpense[]) => void): () => void {
    const expensesQuery = query(collection(db, 'groups', groupId, 'expenses'), orderBy('date', 'desc'));
    return onSnapshot(expensesQuery, (snapshot) => {
      const expenses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as BaseExpense;
      });
      callback(expenses);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `groups/${groupId}/expenses`, false);
    });
  }

  async createExpense(groupId: string, expense: Omit<BaseExpense, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'groups', groupId, 'expenses'), {
        ...expense,
        date: expense.date instanceof Date ? Timestamp.fromDate(expense.date) : expense.date,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `groups/${groupId}/expenses`);
      return '';
    }
  }

  async updateExpense(groupId: string, expenseId: string, updates: Partial<BaseExpense>): Promise<void> {
    try {
      const dataToUpdate: any = { ...updates };
      if (dataToUpdate.date && dataToUpdate.date instanceof Date) {
        dataToUpdate.date = Timestamp.fromDate(dataToUpdate.date);
      }
      await updateDoc(doc(db, 'groups', groupId, 'expenses', expenseId), dataToUpdate);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}/expenses/${expenseId}`);
    }
  }

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'groups', groupId, 'expenses', expenseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `groups/${groupId}/expenses/${expenseId}`);
    }
  }
}
