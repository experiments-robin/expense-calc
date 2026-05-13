import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { SavingsGoal } from '../types';

export function useSavingsGoals(userId: string | undefined) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${userId}/savingsGoals`), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const g = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavingsGoal[];
      setGoals(g);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching savings goals:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addGoal = async (data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>) => {
    if (!userId) return;
    await addDoc(collection(db, `users/${userId}/savingsGoals`), {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  };

  const updateGoal = async (id: string, data: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>>) => {
    if (!userId) return;
    await updateDoc(doc(db, `users/${userId}/savingsGoals`, id), data);
  };

  const deleteGoal = async (id: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, `users/${userId}/savingsGoals`, id));
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal };
}
