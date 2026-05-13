import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileCsv, Sparkle as Sparkles, Spinner } from '@phosphor-icons/react';
import { CATEGORIES } from '../../types';
import { useExpenseModule } from '../../domain/expenses/context';
import { handleFirestoreError, OperationType } from '../../utils/errorHandling';
import { User } from 'firebase/auth';
import { GoogleGenAI, Type } from "@google/genai";
import { formatCurrency } from '../../utils/format';
import { useCurrency } from '../../hooks/useCurrency';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  user: User;
}

export default function ImportCSVModal({ isOpen, onClose, groupId, user }: ImportCSVModalProps) {
  const { currencySymbol } = useCurrency();
  const expenseModule = useExpenseModule();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedExpenses, setImportedExpenses] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are a financial categorizer.
        Analyze the following bank statement CSV data.
        Extract the transactions (ignoring deposits, only extracting expenses/withdrawals/payments where money leaves the account).
        For each transaction, determine:
        1. "amount" as a positive number.
        2. "description" which is a clean merchant name or description.
        3. "date" in YYYY-MM-DD format.
        4. "category" chosen from this exact list: [${CATEGORIES.join(', ')}]. If unsure, pick "Other".

        Here is the CSV:
        ${text.substring(0, 5000)} // Truncate if too long to prevent token issues
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                date: { type: Type.STRING }
              },
              required: ["amount", "description", "category", "date"]
            }
          }
        }
      });

      const jsonStr = response.text.trim();
      const extracted = JSON.parse(jsonStr);
      setImportedExpenses(extracted);
    } catch (error) {
      console.error("Failed to parse CSV:", error);
      alert("Failed to process the CSV. Make sure it's a valid bank statement.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      for (const expense of importedExpenses) {
        if (!expense.amount || !expense.description) continue;
        const cat = CATEGORIES.includes(expense.category) ? expense.category : CATEGORIES[0];
        const date = expense.date ? new Date(expense.date) : new Date();

        await expenseModule.addExpense(groupId, {
          amount: parseFloat(expense.amount),
          description: expense.description,
          category: cat,
          paidBy: user.uid,
          date: date as any,
          splitType: 'equal'
        });
      }
      onClose();
      setImportedExpenses([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `groups/${groupId}/expenses`);
    } finally {
      setIsProcessing(false);
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-6 sm:p-10 outline-none max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display flex items-center gap-3">
                <FileCsv className="w-6 h-6 text-zinc-400" />
                Import Transactions
              </h3>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              {importedExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <input 
                    type="file" 
                    accept=".csv,text/csv" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                    {isProcessing ? <Spinner className="w-8 h-8 animate-spin" /> : <FileCsv className="w-8 h-8" />}
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Upload Bank Statement</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-8">
                    Upload a CSV file of your bank statement. Our AI will automatically extract and categorize your expenses.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-zinc-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isProcessing ? 'Analyzing Data...' : 'Select CSV File'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-zinc-900 dark:text-white">Found {importedExpenses.length} Expenses</h4>
                    <button
                      onClick={() => setImportedExpenses([])}
                      className="text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Clear & Start Over
                    </button>
                  </div>
                  {importedExpenses.map((expense, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{expense.description}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-1">{expense.date}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                          {expense.category}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white min-w-[80px]">
                          {currencySymbol}{formatCurrency(expense.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {importedExpenses.length > 0 && (
              <div className="shrink-0 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleConfirmImport}
                  disabled={isProcessing}
                  className="w-full py-4 bg-zinc-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Spinner className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isProcessing ? 'Importing...' : `Import ${importedExpenses.length} Expenses`}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
