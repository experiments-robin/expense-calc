import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Subscription } from '../types';

export function useSubscriptions(userId: string | undefined) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, `users/${userId}/subscriptions`), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];
      setSubscriptions(subs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscriptions:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const addSubscription = async (data: Omit<Subscription, 'id' | 'userId' | 'createdAt'>) => {
    if (!userId) return;
    await addDoc(collection(db, `users/${userId}/subscriptions`), {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  };

  const updateSubscription = async (id: string, data: Partial<Omit<Subscription, 'id' | 'userId' | 'createdAt'>>) => {
    if (!userId) return;
    await updateDoc(doc(db, `users/${userId}/subscriptions`, id), data);
  };

  const deleteSubscription = async (id: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, `users/${userId}/subscriptions`, id));
  };

  return { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription };
}
