import React, { useState, useEffect, useRef, useMemo } from'react';
import { motion, AnimatePresence, TargetAndTransition, VariantLabels } from'motion/react';
import { useExpenseModule } from '../domain/expenses/context';
import { BaseExpense } from '../domain/expenses/types';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Receipt, 
  DotsThreeVertical as MoreVertical, 
  Trash as Trash2, 
  UserPlus,
  TrendUp as TrendingUp,
  ChartPieSlice as PieChartIcon,
  Calendar,
  Tag,
  CreditCard,
  ChartBar as BarChart3,
  Sparkle as Sparkles,
  Spinner as Loader2,
  PencilSimple as Pencil,
  X,
  Wallet,
  FileCsv,
  Funnel as Filter
} from '@phosphor-icons/react';
import Markdown from'react-markdown';
import { GoogleGenAI } from "@google/genai";
import AddExpenseModal from './group/AddExpenseModal';
import AddMemberModal from './group/AddMemberModal';
import DebtSimplification from './group/DebtSimplification';
import GroupCharts from './group/GroupCharts';
import TransactionHistory from './group/TransactionHistory';
import ImportCSVModal from './group/ImportCSVModal';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from'recharts';
import { db } from'../firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  setDoc,
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  Timestamp,
  getDocs,
  where,
  updateDoc,
  arrayUnion
} from'firebase/firestore';
import { User } from'firebase/auth';
import { Group, Expense, GroupMember, CATEGORIES, BudgetType } from'../types';
import { formatCurrency } from'../utils/format';
import { useCurrency } from '../hooks/useCurrency';
import { handleFirestoreError, OperationType } from'../utils/errorHandling';

interface GroupViewProps {
  groupId: string;
  user: User;
  onBack: () => void;
  theme:'light' |'dark';
}

export default function GroupView({ groupId, user, onBack, theme }: GroupViewProps) {
  const { currencySymbol } = useCurrency();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<BaseExpense[]>([]);
  const expenseModule = useExpenseModule();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isImportCSVOpen, setIsImportCSVOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BaseExpense | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDebtSimplificationOpen, setIsDebtSimplificationOpen] = useState(false);

  // Settings states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMaxBudget, setEditMaxBudget] = useState('');
  const [editBudgetType, setEditBudgetType] = useState<BudgetType>('monthly');

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const analysisAbortController = useRef<AbortController | null>(null);

  // Stat details modal state
  const [selectedStatDetails, setSelectedStatDetails] = useState<{ title: string; amount: number; subtitle?: string } | null>(null);

  const statModalRef = useRef<HTMLDivElement>(null);
  const analysisModalRef = useRef<HTMLDivElement>(null);
  const deleteGroupModalRef = useRef<HTMLDivElement>(null);
  const springProps: any = { type: "spring", stiffness: 100, damping: 20 };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: springProps }
  };

  const closeAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    if (analysisAbortController.current) {
      analysisAbortController.current.abort();
      analysisAbortController.current = null;
    }
    setIsAnalyzing(false);
    setAnalysisResult(null);
  };

  // Delete confirmation state
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isDeleteGroupConfirmOpen, setIsDeleteGroupConfirmOpen] = useState(false);

  const [timeFilter, setTimeFilter] = useState<'all' | 'this_month' | 'last_month'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [payeeFilter, setPayeeFilter] = useState<string>('all');

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    const now = new Date();

    if (timeFilter !== 'all') {
      result = result.filter(e => {
        const d = e.date;
        if (timeFilter === 'this_month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        if (timeFilter === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
        }
        return true;
      });
    }

    if (categoryFilter !== 'all') {
      result = result.filter(e => e.category === categoryFilter);
    }

    if (payeeFilter !== 'all') {
      result = result.filter(e => e.paidBy === payeeFilter);
    }

    return result;
  }, [expenses, timeFilter, categoryFilter, payeeFilter]);

  useEffect(() => {
    if (selectedStatDetails && statModalRef.current) {
      statModalRef.current.focus();
    }
  }, [selectedStatDetails]);

  useEffect(() => {
    if (isAnalysisModalOpen && analysisModalRef.current) {
      analysisModalRef.current.focus();
    }
  }, [isAnalysisModalOpen]);

  useEffect(() => {
    if (isDeleteGroupConfirmOpen && deleteGroupModalRef.current) {
      deleteGroupModalRef.current.focus();
    }
  }, [isDeleteGroupConfirmOpen]);

  useEffect(() => {
    if (expenseToDelete && deleteExpenseModalRef.current) {
      deleteExpenseModalRef.current.focus();
    }
  }, [expenseToDelete]);

  // Invite states
  const deleteExpenseModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const groupRef = doc(db,'groups', groupId);
    const unsubscribeGroup = onSnapshot(groupRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Group;
        setGroup({ id: doc.id, ...data } as Group);
        setEditName(data.name);
        setEditDescription(data.description ||'');
        setEditMaxBudget(data.maxBudget?.toString() ||'');
        setEditBudgetType(data.budgetType ||'monthly');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `groups/${groupId}`, false);
    });

    const unsubscribeExpenses = expenseModule.subscribeToExpenses(groupId, (fetchedExpenses) => {
      setExpenses(fetchedExpenses);
    });

    const membersQuery = collection(db,'groups', groupId,'members');
    const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as GroupMember)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `groups/${groupId}/members`, false);
    });

    return () => {
      unsubscribeGroup();
      unsubscribeExpenses();
      unsubscribeMembers();
    };
  }, [groupId]);

  const handleEditExpense = (expense: BaseExpense) => {
    setEditingExpense(expense as any);
    setIsAddExpenseOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key ==='Escape') {
        setIsAddExpenseOpen(false);
        setIsAddMemberOpen(false);
        setIsSettingsOpen(false);
        closeAnalysisModal();
        setIsDeleteGroupConfirmOpen(false);
        setExpenseToDelete(null);
        setEditingExpense(null);
        setSelectedStatDetails(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseModule.deleteExpense(groupId, id);
      setExpenseToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `groups/${groupId}/expenses/${id}`);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteDoc(doc(db,'groups', groupId));
      onBack();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `groups/${groupId}`);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    
    try {
      const updateData: any = {
        name: editName.trim(),
        description: editDescription.trim(),
        maxBudget: editMaxBudget ? parseFloat(editMaxBudget) : null,
        budgetType: editMaxBudget ? editBudgetType :'total'
      };
      await updateDoc(doc(db,'groups', groupId), updateData);
      setIsSettingsOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}`);
    }
  };

  const isDateInCurrentPeriod = (date: Date, type: BudgetType) => {
    const now = new Date();
    if (type ==='total') return true;
    
    if (type ==='monthly') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    if (type ==='weekly') {
      // Get start of current week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      return date >= startOfWeek && date < endOfWeek;
    }
    
    return true;
  };

  const currentPeriodExpenses = expenses.filter(e => 
    isDateInCurrentPeriod(e.date, group?.budgetType ||'total')
  );

  const totalSpent = currentPeriodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const userSpent = currentPeriodExpenses.filter(e => e.paidBy === user.uid).reduce((sum, e) => sum + e.amount, 0);
  const perPerson = members.length > 0 ? totalSpent / members.length : 0;
  const balance = userSpent - perPerson;

  // Budget calculation
  const currentBudgetSpent = totalSpent;

  const getPeriodLabel = () => {
    const now = new Date();
    const type = group?.budgetType ||'total';
    
    if (type ==='monthly') {
      return now.toLocaleDateString('en-US', { month:'long', year:'numeric' });
    }
    
    if (type ==='weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startMonth = startOfWeek.toLocaleDateString('en-US', { month:'short' });
      const endMonth = endOfWeek.toLocaleDateString('en-US', { month:'short' });
      
      if (startMonth === endMonth) {
        return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${now.getFullYear()}`;
      }
      return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${now.getFullYear()}`;
    }
    
    return'All Time';
  };

  const handleAnalyzeSpending = async () => {
    setIsAnalyzing(true);
    setIsAnalysisModalOpen(true);
    setAnalysisResult(null);

    if (analysisAbortController.current) {
      analysisAbortController.current.abort();
    }
    const abortController = new AbortController();
    analysisAbortController.current = abortController;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const expenseSummary = expenses.map(e => ({
        amount: e.amount,
        description: e.description,
        category: e.category,
        date: e.date.toLocaleDateString()
      }));

      const prompt = `
        Analyze the following spending data for a group budget named "${group?.name}".
        Group Type: ${group?.type}
        Budget Type: ${group?.budgetType}
        Max Budget: ${group?.maxBudget ||'No limit'}
        Total Spent in Current Period: ${totalSpent.toFixed(2)}
        
        Expenses:
        ${JSON.stringify(expenseSummary, null, 2)}
        
        Please provide:
        1. A summary of spending habits.
        2. Identification of any unusual or high spending categories.
        3. Practical suggestions for saving or better budget management.
        4. A brief outlook based on the current budget limit.
        
        Keep the tone helpful, professional, and encouraging. Use markdown for formatting.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [{ text: prompt }] }]
      });

      if (abortController.signal.aborted) return;

      setAnalysisResult(response.text || "Could not generate analysis.");
    } catch (error: any) {
      if (error.name ==='AbortError' || abortController.signal.aborted) {
        return;
      }
      console.error("AI Analysis Error:", error);
      setAnalysisResult("Sorry, I encountered an error while analyzing your spending. Please try again later.");
    } finally {
      if (!abortController.signal.aborted) {
        setIsAnalyzing(false);
      }
    }
  };

  if (!group) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all duration-200 mb-10 group shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-bold">Back to Dashboard</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              group.type ==='household' ?'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' :
              group.type ==='trip' ?'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20' :
             'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'
            }`}>
              {group.type}
            </span>
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{getPeriodLabel()}</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3 font-display">{group.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed font-medium">{group.description ||'No description provided.'}</p>
        </div>

        <div className="flex flex-wrap items-stretch gap-2 sm:gap-3 w-full md:w-auto">
          {user.uid === group.createdBy && (
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-12 sm:w-auto p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm flex items-center justify-center shrink-0"
              title="Group Settings"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => setIsAddMemberOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
          <button 
            onClick={handleAnalyzeSpending}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all disabled:opacity-50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] active:scale-95"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Insights
          </button>
          <button 
            onClick={() => setIsImportCSVOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] transition-all active:scale-95"
          >
            <FileCsv className="w-4 h-4" />
            Import CSV
          </button>
          <button 
            onClick={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 mb-24"
      >
        <motion.div variants={itemVariants} className="double-bezel relative group">
          <button 
            onClick={() => setSelectedStatDetails({ title:'Total Group Spend', amount: totalSpent })}
            className="w-full text-left double-bezel-inner p-8 flex flex-col justify-start relative overflow-hidden transition-all duration-700 ease-fluid cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 transition-transform duration-700 ease-fluid group-hover:scale-150" />
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 relative z-10 hidden md:flex">
               <Receipt weight="duotone" className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="relative w-full z-10">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 font-display">Total Group Spend</p>
              <p 
                className="text-5xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight truncate leading-none mb-2"
                title={`${currencySymbol}${formatCurrency(totalSpent)}`}
              >
                {currencySymbol}{formatCurrency(totalSpent)}
              </p>
              {group.maxBudget && (
                <div className="mt-8 w-full">
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-2 font-display w-full">
                    <span className="text-zinc-500 border-b border-dashed border-zinc-300 pb-0.5">Budget ({group.budgetType})</span>
                    <span className={currentBudgetSpent > group.maxBudget ?'text-red-600 dark:text-red-400' :'text-emerald-600 dark:text-emerald-400'}>
                      {((currentBudgetSpent / group.maxBudget) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${currentBudgetSpent > group.maxBudget ?'bg-red-500' :'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (currentBudgetSpent / group.maxBudget) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                    {currencySymbol}{formatCurrency(currentBudgetSpent)} of {currencySymbol}{formatCurrency(group.maxBudget)}
                  </p>
                </div>
              )}
            </div>
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="double-bezel relative group">
          <button 
            onClick={() => setSelectedStatDetails({ title:'Your Share', amount: perPerson, subtitle: `${totalSpent > 0 ? ((userSpent / totalSpent) * 100).toFixed(0) : 0}% of total paid by you` })}
            className="w-full text-left double-bezel-inner p-8 flex flex-col justify-start relative overflow-hidden transition-all duration-700 ease-fluid cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 transition-transform duration-700 ease-fluid group-hover:scale-150" />
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 relative z-10 hidden md:flex">
               <PieChartIcon weight="duotone" className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="relative z-10 w-full">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 font-display">Your Share</p>
              <p 
                className="text-5xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight truncate leading-none"
                title={`${currencySymbol}${formatCurrency(perPerson)}`}
              >
                {currencySymbol}{formatCurrency(perPerson)}
              </p>
              <p className="text-xs font-medium text-zinc-500 mt-6 tracking-wide">
                {totalSpent > 0 ? ((userSpent / totalSpent) * 100).toFixed(0) : 0}% of total paid by you
              </p>
            </div>
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className={`double-bezel relative group border-none ${balance < 0 ? 'ring-red-500/20 dark:ring-red-500/20' : ''}`}>
          <button 
            onClick={() => setSelectedStatDetails({ title: balance >= 0 ?'You are owed' :'You owe', amount: Math.abs(balance) })}
            className={`w-full text-left double-bezel-inner p-8 flex flex-col justify-start relative overflow-hidden transition-all duration-700 ease-fluid cursor-pointer ${balance >= 0 ? 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10' : 'hover:bg-red-50/50 dark:hover:bg-red-900/10'}`}
          >
            <div className={`absolute top-0 right-0 w-48 h-48 ${balance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-full blur-3xl -mr-24 -mt-24 transition-transform duration-700 ease-fluid group-hover:scale-150`} />
            <div className={`w-14 h-14 ${balance >= 0 ?'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'} rounded-full flex items-center justify-center mb-8 relative z-10 hidden md:flex`}>
               <Wallet weight="duotone" className="w-7 h-7" />
            </div>
            <div className="relative z-10 w-full">
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-zinc-500 font-display`}>
                {balance >= 0 ?'You are owed' :'You owe'}
              </p>
              <p 
                className={`text-5xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight truncate leading-none ${balance >= 0 ?'text-emerald-600 dark:text-emerald-400' :'text-red-600 dark:text-red-400'}`}
                title={`${currencySymbol}${formatCurrency(Math.abs(balance))}`}
              >
                {currencySymbol}{formatCurrency(Math.abs(balance))}
              </p>
            </div>
          </button>
        </motion.div>
      </motion.div>

      <GroupCharts 
        group={group} 
        expenses={expenses} 
        currentPeriodExpenses={currentPeriodExpenses} 
        theme={theme} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <TransactionHistory 
            expenses={expenses}
            filteredExpenses={filteredExpenses}
            members={members}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            payeeFilter={payeeFilter}
            setPayeeFilter={setPayeeFilter}
            setEditingExpense={handleEditExpense}
            setExpenseToDelete={setExpenseToDelete}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8 flex items-center gap-3 font-display">
            <Users className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
            Group Members
          </h2>
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-zinc-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="space-y-6 relative">
              <AnimatePresence mode="popLayout" initial={false}>
              {members.map((member, index) => (
                <motion.div 
                  key={member.uid} 
                  layout
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)', x: 20 }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)', transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.05 }}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-bold border border-zinc-100 dark:border-zinc-700 group-hover:border-emerald-500 transition-colors">
                        {member.displayName?.charAt(0)}
                      </div>
                      {member.uid === group.createdBy && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                          <Sparkles className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{member.displayName}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{member.role}</p>
                    </div>
                  </div>
                  {member.uid === group.createdBy && (
                    <span className="shrink-0 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 ml-2">OWNER</span>
                  )}
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => setIsDebtSimplificationOpen(true)}
              className="mt-6 w-full py-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Settle Debts
            </button>
          </div>
        </div>
      </div>

      {/* Modals extracted */}
      <DebtSimplification 
        isOpen={isDebtSimplificationOpen}
        onClose={() => setIsDebtSimplificationOpen(false)}
        expenses={expenses}
        members={members}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        editingExpense={editingExpense}
        user={user}
        groupId={groupId}
      />

      <ImportCSVModal
        isOpen={isImportCSVOpen}
        onClose={() => setIsImportCSVOpen(false)}
        user={user}
        groupId={groupId}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        groupId={groupId}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 max-h-[90vh] overflow-y-auto outline-none"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 id="settings-title" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Group Settings</h3>
                <button 
                  type="button"
                  onClick={() => setIsSettingsOpen(false)} 
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              <form onSubmit={handleUpdateSettings} className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">General Info</h4>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Group Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium dark:text-white"
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none h-24 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Budget Limits</h4>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Max Budget</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editMaxBudget}
                          onChange={(e) => setEditMaxBudget(e.target.value)}
                          placeholder="No limit"
                          className="w-full pl-10 pr-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono font-bold dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-2">Frequency</label>
                      <select
                        value={editBudgetType}
                        onChange={(e) => setEditBudgetType(e.target.value as BudgetType)}
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none dark:text-white"
                      >
                        <option value="weekly">Per Week</option>
                        <option value="monthly">Per Month</option>
                        <option value="total">Total</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-zinc-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] dark:active:scale-95"
                >
                  Save Settings
                </button>

                {(members.find(m => m.uid === user.uid)?.role ==='admin' || group?.createdBy === user.uid) && (
                  <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsDeleteGroupConfirmOpen(true);
                      }}
                      className="w-full py-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Group
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* AI Analysis Modal */}
      <AnimatePresence>
        {isAnalysisModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeAnalysisModal}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              ref={analysisModalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="analysis-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 max-h-[85vh] overflow-y-auto outline-none"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="analysis-title" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Spending Analysis</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">AI-powered insights for {group.name}</p>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="py-16 flex flex-col items-center justify-center gap-6 text-zinc-400">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <div className="absolute inset-0 blur-lg bg-emerald-400/20 animate-pulse" />
                  </div>
                  <p className="font-bold text-sm uppercase tracking-widest animate-pulse">Analyzing your spending habits...</p>
                </div>
              ) : (
                <div className="max-w-none">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-700 analysis-content dark:text-zinc-300">
                    <Markdown>{analysisResult || ""}</Markdown>
                  </div>
                  <button
                    onClick={closeAnalysisModal}
                    className="w-full py-4 bg-zinc-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-all mt-8 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] dark:active:scale-95"
                  >
                    Close Analysis
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Group Confirmation Modal */}
      <AnimatePresence>
        {isDeleteGroupConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteGroupConfirmOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              ref={deleteGroupModalRef}
              tabIndex={-1}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-group-title"
              aria-describedby="delete-group-desc"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 text-center outline-none"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 id="delete-group-title" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3 font-display">Delete Group?</h3>
              <p id="delete-group-desc" className="text-zinc-500 dark:text-zinc-400 text-sm mb-10 leading-relaxed">This will permanently delete the group <strong>{group?.name}</strong> and all its expenses. This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteGroupConfirmOpen(false)}
                  className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] shadow-red-200 dark:shadow-red-500/20 active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stat Details Modal */}
      <AnimatePresence>
        {selectedStatDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStatDetails(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              ref={statModalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="stat-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 text-center outline-none"
            >
              <p id="stat-title" className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 font-display">{selectedStatDetails.title}</p>
              <p className="text-5xl sm:text-6xl font-bold text-zinc-900 dark:text-white font-display tracking-tight mb-2 break-all">
                ${formatCurrency(selectedStatDetails.amount)}
              </p>
              {selectedStatDetails.subtitle && (
                <p className="text-sm font-medium text-zinc-500 mt-4">
                  {selectedStatDetails.subtitle}
                </p>
              )}
              <button
                onClick={() => setSelectedStatDetails(null)}
                className="w-full py-4 bg-zinc-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-emerald-700 transition-all mt-8 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] dark:active:scale-95"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {expenseToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setExpenseToDelete(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div
              ref={deleteExpenseModalRef}
              tabIndex={-1}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-expense-title"
              aria-describedby="delete-expense-desc"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 text-center outline-none"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 id="delete-expense-title" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3 font-display">Delete Expense?</h3>
              <p id="delete-expense-desc" className="text-zinc-500 dark:text-zinc-400 text-sm mb-10 leading-relaxed">This action cannot be undone. Are you sure you want to remove this expense?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setExpenseToDelete(null)}
                  className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteExpense(expenseToDelete)}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] shadow-red-200 dark:shadow-red-500/20 active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
