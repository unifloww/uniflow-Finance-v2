import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'wallet' | 'cash' | 'investment';
  provider?: string | null;
  color?: string;
  balance: number;
  user_id?: string;
  workspace?: 'personal' | 'business';
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  date: string;
  user_id?: string;
  workspace?: 'personal' | 'business';
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  user_id?: string;
  workspace?: 'personal' | 'business';
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  user_id?: string;
  workspace?: 'personal' | 'business';
}

interface DataContextType {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  editAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  editGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  editBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  isLoaded: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  hideBalances: boolean;
  toggleHideBalances: () => void;
  displayCurrency: 'IDR' | 'USD';
  setDisplayCurrency: (currency: 'IDR' | 'USD') => void;
  activeWorkspace: 'personal' | 'business';
  setActiveWorkspace: (w: 'personal' | 'business') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  const [activeWorkspace, setActiveWorkspaceState] = useState<'personal' | 'business'>(() => {
    return (localStorage.getItem('uniflow_workspace') as 'personal' | 'business') || 'personal';
  });

  const setActiveWorkspace = (workspace: 'personal' | 'business') => {
    localStorage.setItem('uniflow_workspace', workspace);
    setActiveWorkspaceState(workspace);
  };

  const [rawAccounts, setRawAccounts] = useState<Account[]>([]);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [rawGoals, setRawGoals] = useState<Goal[]>([]);
  const [rawBudgets, setRawBudgets] = useState<Budget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>(
    navigator.onLine ? 'synced' : 'offline'
  );

  const [hideBalances, setHideBalances] = useState(() => {
    return localStorage.getItem('uniflow_hide_balances') === 'true';
  });
  const [displayCurrency, setDisplayCurrencyState] = useState<'IDR' | 'USD'>(() => {
    return (localStorage.getItem('uniflow_currency') as 'IDR' | 'USD') || 'IDR';
  });

  const setDisplayCurrency = (currency: 'IDR' | 'USD') => {
    localStorage.setItem('uniflow_currency', currency);
    setDisplayCurrencyState(currency);
  };

  const toggleHideBalances = () => {
    setHideBalances(prev => {
      const newVal = !prev;
      localStorage.setItem('uniflow_hide_balances', String(newVal));
      return newVal;
    });
  };

  const accounts = React.useMemo(() => rawAccounts.filter(a => activeWorkspace === 'personal' ? (!a.workspace || a.workspace === 'personal') : a.workspace === 'business'), [rawAccounts, activeWorkspace]);
  const transactions = React.useMemo(() => rawTransactions.filter(t => activeWorkspace === 'personal' ? (!t.workspace || t.workspace === 'personal') : t.workspace === 'business'), [rawTransactions, activeWorkspace]);
  const goals = React.useMemo(() => rawGoals.filter(g => activeWorkspace === 'personal' ? (!g.workspace || g.workspace === 'personal') : g.workspace === 'business'), [rawGoals, activeWorkspace]);
  const budgets = React.useMemo(() => rawBudgets.filter(b => activeWorkspace === 'personal' ? (!b.workspace || b.workspace === 'personal') : b.workspace === 'business'), [rawBudgets, activeWorkspace]);

  useEffect(() => {
    const handleOnline = () => setSyncStatus('synced');
    const handleOffline = () => setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setRawAccounts([]);
      setRawTransactions([]);
      setRawGoals([]);
      setRawBudgets([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    setSyncStatus('syncing');

    const unsubscribeAccounts = onSnapshot(query(collection(db, 'accounts'), where('user_id', '==', currentUser.uid)), (snapshot) => {
      setRawAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)));
    });

    const unsubscribeTransactions = onSnapshot(query(collection(db, 'transactions'), where('user_id', '==', currentUser.uid)), (snapshot) => {
      setRawTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    const unsubscribeGoals = onSnapshot(query(collection(db, 'goals'), where('user_id', '==', currentUser.uid)), (snapshot) => {
      setRawGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    });
    
    const unsubscribeBudgets = onSnapshot(query(collection(db, 'budgets'), where('user_id', '==', currentUser.uid)), (snapshot) => {
      setRawBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
    });

    setTimeout(() => {
      setIsLoaded(true);
      setSyncStatus('synced');
    }, 1000);

    return () => {
      unsubscribeAccounts();
      unsubscribeTransactions();
      unsubscribeGoals();
      unsubscribeBudgets();
    };
  }, [currentUser]);

  const updateAccount = async (id: string, account: Partial<Account>) => {
    if (!currentUser) return;
    try {
      setSyncStatus('syncing');
      const ref = doc(db, 'accounts', id);
      await setDoc(ref, { ...account, user_id: currentUser.uid, updatedAt: new Date().toISOString() }, { merge: true });
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error updating account', error);
      setSyncStatus('offline');
    }
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    const newRef = doc(collection(db, 'accounts'));
    await setDoc(newRef, { ...account, user_id: currentUser.uid, workspace: activeWorkspace });
    setSyncStatus('synced');
  };

  const editAccount = async (id: string, updatedData: Partial<Account>) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    await setDoc(doc(db, 'accounts', id), updatedData, { merge: true });
    setSyncStatus('synced');
  };

  const deleteAccount = async (id: string) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    await deleteDoc(doc(db, 'accounts', id));
    setSyncStatus('synced');
  };

  const updateTransaction = async (id: string, tx: Partial<Transaction>) => {
    if (!currentUser) return;
    try {
      setSyncStatus('syncing');
      
      const ref = doc(db, 'transactions', id);
      await setDoc(ref, { ...tx, user_id: currentUser.uid }, { merge: true });
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error updating tx', error);
      setSyncStatus('offline');
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    
    const batch = writeBatch(db);
    
    // Create transaction
    const newTxRef = doc(collection(db, 'transactions'));
    batch.set(newTxRef, { ...tx, user_id: currentUser.uid, workspace: activeWorkspace });
    
    // Update account balance
    const acc = accounts.find(a => a.id === tx.accountId);
    if (acc) {
      let newBalance = acc.balance;
      if (tx.type === 'income') newBalance += tx.amount;
      if (tx.type === 'expense') newBalance -= tx.amount;
      
      const accRef = doc(db, 'accounts', acc.id);
      batch.update(accRef, { balance: newBalance });
    }
    
    await batch.commit();
    setSyncStatus('synced');
  };

  const deleteTransaction = async (id: string) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const batch = writeBatch(db);
    batch.delete(doc(db, 'transactions', id));
    
    const acc = accounts.find(a => a.id === tx.accountId);
    if (acc) {
      let newBalance = acc.balance;
      if (tx.type === 'income') newBalance -= tx.amount;
      if (tx.type === 'expense') newBalance += tx.amount;
      
      batch.update(doc(db, 'accounts', acc.id), { balance: newBalance });
    }

    await batch.commit();
    setSyncStatus('synced');
  }

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    const newRef = doc(collection(db, 'goals'));
    await setDoc(newRef, { ...goal, user_id: currentUser.uid, workspace: activeWorkspace });
    setSyncStatus('synced');
  };

  const editGoal = async (id: string, updatedData: Partial<Goal>) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    await setDoc(doc(db, 'goals', id), updatedData, { merge: true });
    setSyncStatus('synced');
  };

  const deleteGoal = async (id: string) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    await deleteDoc(doc(db, 'goals', id));
    setSyncStatus('synced');
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    const newRef = doc(collection(db, 'budgets'));
    await setDoc(newRef, { ...budget, user_id: currentUser.uid, workspace: activeWorkspace });
    setSyncStatus('synced');
  };

  const editBudget = async (id: string, updatedData: Partial<Budget>) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    await setDoc(doc(db, 'budgets', id), updatedData, { merge: true });
    setSyncStatus('synced');
  };

  const deleteBudget = async (id: string) => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    await deleteDoc(doc(db, 'budgets', id));
    setSyncStatus('synced');
  };

  return (
    <DataContext.Provider value={{ 
      accounts, 
      transactions, 
      goals,
      budgets,
      addAccount, updateAccount, 
      editAccount,
      deleteAccount,
      addTransaction, updateTransaction, 
      deleteTransaction, 
      addGoal, 
      editGoal, 
      deleteGoal,
      addBudget,
      editBudget,
      deleteBudget,
      isLoaded,
      syncStatus,
      hideBalances,
      toggleHideBalances,
      displayCurrency,
      setDisplayCurrency,
      activeWorkspace,
      setActiveWorkspace
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
