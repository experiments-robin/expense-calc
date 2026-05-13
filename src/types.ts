import { Timestamp } from'firebase/firestore';

export type GroupType ='personal' |'household' |'trip' |'other';
export type SplitType ='equal' |'percentage' |'exact';
export type MemberRole ='admin' |'member';
export type BudgetType ='weekly' |'monthly' |'total';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  categoryLimits?: Record<string, number>;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  type: GroupType;
  memberIds: string[];
  maxBudget?: number;
  budgetType?: BudgetType;
}

export interface GroupMember {
  uid: string;
  role: MemberRole;
  joinedAt: Timestamp;
  displayName?: string;
  email?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string; // userId
  date: Timestamp;
  createdAt: Timestamp;
  splitType: SplitType;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: Timestamp;
  category: string;
  active: boolean;
  userId: string;
  createdAt: Timestamp;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Timestamp | null;
  color: string;
  userId: string;
  createdAt: Timestamp;
}

export const CATEGORIES = [
 'Food',
 'Rent',
 'Utilities',
 'Transport',
 'Entertainment',
 'Shopping',
 'Health',
 'Travel',
 'Other'
];
