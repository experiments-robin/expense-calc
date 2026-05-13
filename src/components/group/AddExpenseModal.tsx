import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkle as Sparkles, Spinner } from '@phosphor-icons/react';
import { BaseExpense } from '../../domain/expenses/types';
import { useCurrency } from '../../hooks/useCurrency';
import { CATEGORIES } from '../../types';
import { useExpenseModule } from '../../domain/expenses/context';
import { handleFirestoreError, OperationType } from '../../utils/errorHandling';
import { User } from 'firebase/auth';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  user: User;
  editingExpense: BaseExpense | null;
}

export default function AddExpenseModal({ isOpen, onClose, groupId, user, editingExpense }: AddExpenseModalProps) {
  const { currencySymbol } = useCurrency();
  const expenseModule = useExpenseModule();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.description);
      setCategory(editingExpense.category);
      setDate(editingExpense.date.toISOString().split('T')[0]);
    } else {
      setAmount('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingExpense, isOpen]);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
              {
                text: 'Extract the receipt details. Determine the total amount, description/merchant name, date (YYYY-MM-DD), and categorize it into one of these: Housing, Food, Transportation, Utilities, Entertainment, Shopping, Health, Other. If you cannot determine a value, make a best guess or return empty string.',
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER, description: "Total amount on receipt" },
                description: { type: Type.STRING, description: "Merchant name or brief description" },
                category: { type: Type.STRING, description: "Category from the list provided" },
                date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
              },
              required: ["amount", "description", "category", "date"]
            }
          }
        });

        const jsonStr = response.text.trim();
        const extracted = JSON.parse(jsonStr);
        
        if (extracted.amount) setAmount(extracted.amount.toString());
        if (extracted.description) setDescription(extracted.description);
        if (extracted.category && CATEGORIES.includes(extracted.category)) setCategory(extracted.category);
        if (extracted.date) setDate(extracted.date);
        
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to scan receipt:", error);
      setIsScanning(false);
    }
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    try {
      const expenseData = {
        amount: parseFloat(amount),
        description: description.trim(),
        category,
        paidBy: editingExpense ? editingExpense.paidBy : user.uid,
        date: new Date(date),
        createdAt: editingExpense ? editingExpense.createdAt : serverTimestamp(),
        splitType: 'equal' as const
      };

      if (editingExpense) {
        await expenseModule.updateExpense(groupId, editingExpense.id, {
          amount: expenseData.amount,
          description: expenseData.description,
          category: expenseData.category,
          date: expenseData.date as any
        });
      } else {
        await expenseModule.addExpense(groupId, {
          amount: expenseData.amount,
          description: expenseData.description,
          category: expenseData.category,
          paidBy: expenseData.paidBy,
          date: expenseData.date as any,
          splitType: expenseData.splitType
        });
      }
      
      onClose();
    } catch (error) {
      handleFirestoreError(error, editingExpense ? OperationType.UPDATE : OperationType.CREATE, `groups/${groupId}/expenses`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-expense-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-6 sm:p-10 outline-none"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 id="add-expense-title" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            
            {!editingExpense && (
              <div className="mb-6">
                 <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handleScanReceipt} 
                 />
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isScanning}
                   className="w-full py-4 px-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/50"
                 >
                   {isScanning ? (
                     <Spinner className="w-5 h-5 animate-spin" />
                   ) : (
                     <Sparkles className="w-5 h-5" />
                   )}
                   {isScanning ? 'Scanning Receipt...' : 'Auto-fill from Receipt'}
                 </button>
              </div>
            )}
            
            <form onSubmit={handleAddExpense} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono font-bold text-lg dark:text-white"
                    placeholder="0.00"
                    required
                    autoFocus={!editingExpense}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium dark:text-white"
                  placeholder="What was it for?"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none dark:text-white"
                  >
                    {CATEGORIES.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-zinc-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-all mt-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] dark:active:scale-95"
              >
                {editingExpense ? 'Update Transaction' : 'Save Transaction'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
