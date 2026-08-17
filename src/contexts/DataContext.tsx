import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'wallet' | 'cash';
  provider?: string;
  balance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string; // e.g., '2026-08'
}

interface DataContextType {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  editAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  editGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  editBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  isLoaded: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  hideBalances: boolean;
  toggleHideBalances: () => void;
  displayCurrency: 'IDR' | 'USD';
  setDisplayCurrency: (currency: 'IDR' | 'USD') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialAccounts: Account[] = [
  { id: '1', name: 'BCA Utama', type: 'bank', provider: 'bca', balance: 15000000 },
  { id: '2', name: 'GoPay', type: 'wallet', provider: 'gopay', balance: 500000 },
];

const initialTransactions: Transaction[] = [
  { id: '1', accountId: '1', type: 'income', amount: 10000000, category: 'Gaji', description: 'Gaji Bulanan', date: new Date().toISOString() },
  { id: '2', accountId: '2', type: 'expense', amount: 150000, category: 'Makanan', description: 'Makan siang', date: new Date().toISOString() },
];

const initialGoals: Goal[] = [
  { id: '1', name: 'Liburan Jepang', target: 20000000, current: 5000000, deadline: '2027-12-31' },
];

const initialBudgets: Budget[] = [
  { id: '1', category: 'Makanan & Minuman', amount: 3000000, period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
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

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 800);
    };
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = () => {
    if (!navigator.onLine) return;
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('synced'), 600); // Simulate network latency
  };

  // Load from local storage
  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoaded(false);
    const accountsData = localStorage.getItem(`uniflow_accounts_${currentUser.uid}`);
    const transactionsData = localStorage.getItem(`uniflow_transactions_${currentUser.uid}`);
    const goalsData = localStorage.getItem(`uniflow_goals_${currentUser.uid}`);
    const budgetsData = localStorage.getItem(`uniflow_budgets_${currentUser.uid}`);

    if (accountsData) setAccounts(JSON.parse(accountsData));
    else setAccounts(initialAccounts);

    if (transactionsData) setTransactions(JSON.parse(transactionsData));
    else setTransactions(initialTransactions);

    if (goalsData) setGoals(JSON.parse(goalsData));
    else setGoals(initialGoals);
    
    if (budgetsData) setBudgets(JSON.parse(budgetsData));
    else setBudgets(initialBudgets);
    
    setIsLoaded(true);
  }, [currentUser]);

  // Save to local storage when state changes
  useEffect(() => {
    if (!currentUser || !isLoaded) return;
    localStorage.setItem(`uniflow_accounts_${currentUser.uid}`, JSON.stringify(accounts));
    triggerSync();
  }, [accounts, currentUser, isLoaded]);

  useEffect(() => {
    if (!currentUser || !isLoaded) return;
    localStorage.setItem(`uniflow_transactions_${currentUser.uid}`, JSON.stringify(transactions));
    triggerSync();
  }, [transactions, currentUser, isLoaded]);

  useEffect(() => {
    if (!currentUser || !isLoaded) return;
    localStorage.setItem(`uniflow_goals_${currentUser.uid}`, JSON.stringify(goals));
    triggerSync();
  }, [goals, currentUser, isLoaded]);

  useEffect(() => {
    if (!currentUser || !isLoaded) return;
    localStorage.setItem(`uniflow_budgets_${currentUser.uid}`, JSON.stringify(budgets));
    triggerSync();
  }, [budgets, currentUser, isLoaded]);

  const addAccount = (account: Omit<Account, 'id'>) => {
    setAccounts([...accounts, { ...account, id: crypto.randomUUID() }]);
  };

  const editAccount = (id: string, updatedData: Partial<Account>) => {
    setAccounts(accounts.map(acc => acc.id === id ? { ...acc, ...updatedData } : acc));
  };

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    setTransactions([ { ...tx, id: crypto.randomUUID() }, ...transactions]);
    
    // Update account balance
    setAccounts(accounts.map(acc => {
      if (acc.id === tx.accountId) {
        if (tx.type === 'income') return { ...acc, balance: acc.balance + tx.amount };
        if (tx.type === 'expense') return { ...acc, balance: acc.balance - tx.amount };
      }
      return acc;
    }));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    
    // Revert account balance
    setAccounts(accounts.map(acc => {
      if (acc.id === tx.accountId) {
        if (tx.type === 'income') return { ...acc, balance: acc.balance - tx.amount };
        if (tx.type === 'expense') return { ...acc, balance: acc.balance + tx.amount };
      }
      return acc;
    }));
    
    setTransactions(transactions.filter(t => t.id !== id));
  }

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    setGoals([...goals, { ...goal, id: crypto.randomUUID() }]);
  };

  const editGoal = (id: string, updatedData: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updatedData } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    setBudgets([...budgets, { ...budget, id: crypto.randomUUID() }]);
  };

  const editBudget = (id: string, updatedData: Partial<Budget>) => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, ...updatedData } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  return (
    <DataContext.Provider value={{ 
      accounts, 
      transactions, 
      goals,
      budgets,
      addAccount, 
      editAccount,
      deleteAccount,
      addTransaction, 
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
      setDisplayCurrency
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
