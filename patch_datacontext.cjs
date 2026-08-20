const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

// 1. Add workspace to interfaces
code = code.replace(
  "  user_id?: string;\n}",
  "  user_id?: string;\n  workspace?: 'personal' | 'business';\n}"
); // Account
code = code.replace(
  "  user_id?: string;\n}",
  "  user_id?: string;\n  workspace?: 'personal' | 'business';\n}"
); // Transaction
code = code.replace(
  "  user_id?: string;\n}",
  "  user_id?: string;\n  workspace?: 'personal' | 'business';\n}"
); // Goal
code = code.replace(
  "  user_id?: string;\n}",
  "  user_id?: string;\n  workspace?: 'personal' | 'business';\n}"
); // Budget

// 2. Add activeWorkspace to context type
code = code.replace(
  "  displayCurrency: 'IDR' | 'USD';\n  setDisplayCurrency: (currency: 'IDR' | 'USD') => void;\n}",
  "  displayCurrency: 'IDR' | 'USD';\n  setDisplayCurrency: (currency: 'IDR' | 'USD') => void;\n  activeWorkspace: 'personal' | 'business';\n  setActiveWorkspace: (w: 'personal' | 'business') => void;\n}"
);

// 3. Add state to DataProvider
const stateInjection = `  const [activeWorkspace, setActiveWorkspaceState] = useState<'personal' | 'business'>(() => {
    return (localStorage.getItem('uniflow_workspace') as 'personal' | 'business') || 'personal';
  });

  const setActiveWorkspace = (workspace: 'personal' | 'business') => {
    localStorage.setItem('uniflow_workspace', workspace);
    setActiveWorkspaceState(workspace);
  };

  const [rawAccounts, setRawAccounts] = useState<Account[]>([]);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [rawGoals, setRawGoals] = useState<Goal[]>([]);
  const [rawBudgets, setRawBudgets] = useState<Budget[]>([]);`;

code = code.replace(
  "  const [accounts, setAccounts] = useState<Account[]>([]);\n  const [transactions, setTransactions] = useState<Transaction[]>([]);\n  const [goals, setGoals] = useState<Goal[]>([]);\n  const [budgets, setBudgets] = useState<Budget[]>([]);",
  stateInjection
);

// 4. In useEffect for fetch, use raw setters
code = code.replace(/setAccounts\(/g, "setRawAccounts(");
code = code.replace(/setTransactions\(/g, "setRawTransactions(");
code = code.replace(/setGoals\(/g, "setRawGoals(");
code = code.replace(/setBudgets\(/g, "setRawBudgets(");

// 5. Add useMemo for filtered data
const filteredDataInjection = `  const accounts = React.useMemo(() => rawAccounts.filter(a => activeWorkspace === 'personal' ? (!a.workspace || a.workspace === 'personal') : a.workspace === 'business'), [rawAccounts, activeWorkspace]);
  const transactions = React.useMemo(() => rawTransactions.filter(t => activeWorkspace === 'personal' ? (!t.workspace || t.workspace === 'personal') : t.workspace === 'business'), [rawTransactions, activeWorkspace]);
  const goals = React.useMemo(() => rawGoals.filter(g => activeWorkspace === 'personal' ? (!g.workspace || g.workspace === 'personal') : g.workspace === 'business'), [rawGoals, activeWorkspace]);
  const budgets = React.useMemo(() => rawBudgets.filter(b => activeWorkspace === 'personal' ? (!b.workspace || b.workspace === 'personal') : b.workspace === 'business'), [rawBudgets, activeWorkspace]);

  useEffect(() => {
    const handleOnline = () => setSyncStatus('synced');`;

code = code.replace(
  "  useEffect(() => {\n    const handleOnline = () => setSyncStatus('synced');",
  filteredDataInjection
);

// 6. Update add actions to inject workspace
code = code.replace(
  "await setDoc(newRef, { ...account, user_id: currentUser.uid });",
  "await setDoc(newRef, { ...account, user_id: currentUser.uid, workspace: activeWorkspace });"
);

code = code.replace(
  "batch.set(newTxRef, { ...tx, user_id: currentUser.uid });",
  "batch.set(newTxRef, { ...tx, user_id: currentUser.uid, workspace: activeWorkspace });"
);

code = code.replace(
  "await setDoc(newRef, { ...goal, user_id: currentUser.uid });",
  "await setDoc(newRef, { ...goal, user_id: currentUser.uid, workspace: activeWorkspace });"
);

code = code.replace(
  "await setDoc(newRef, { ...budget, user_id: currentUser.uid });",
  "await setDoc(newRef, { ...budget, user_id: currentUser.uid, workspace: activeWorkspace });"
);

// 7. Inject to provider
code = code.replace(
  "      setDisplayCurrency\n    }}",
  "      setDisplayCurrency,\n      activeWorkspace,\n      setActiveWorkspace\n    }}"
);

fs.writeFileSync('src/contexts/DataContext.tsx', code);
console.log("Patched DataContext");
