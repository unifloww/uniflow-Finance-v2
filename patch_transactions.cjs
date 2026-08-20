const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

// We need activeWorkspace
code = code.replace(
  "const { transactions, accounts, addTransaction, deleteTransaction, updateTransaction } = useData();",
  "const { transactions, accounts, addTransaction, deleteTransaction, updateTransaction, activeWorkspace } = useData();"
);

// We define dynamic categories inside the component
const dynamicCategories = `  const expenseCategories = activeWorkspace === 'business' 
    ? ["Pembelian Stok/Bahan", "Gaji Karyawan", "Operasional", "Pemasaran", "Sewa Tempat", "Pajak", "Lainnya"]
    : ["Makanan & Minuman", "Transportasi", "Belanja", "Tagihan & Utilitas", "Hiburan", "Kesehatan", "Pendidikan", "Lainnya"];
    
  const incomeCategories = activeWorkspace === 'business'
    ? ["Penjualan Produk", "Pendapatan Jasa", "Pendapatan Lainnya"]
    : ["Gaji", "Bonus", "Investasi", "Pemberian", "Lainnya"];`;

code = code.replace(
  "  const { transactions, accounts, addTransaction, deleteTransaction, updateTransaction, activeWorkspace } = useData();",
  "  const { transactions, accounts, addTransaction, deleteTransaction, updateTransaction, activeWorkspace } = useData();\n" + dynamicCategories
);

// We need to initialize category properly, currently it's initialized as "Makanan & Minuman".
// Let's use a useEffect to update it if the type or workspace changes.
const categoryEffect = `  useEffect(() => {
    setCategory(type === "expense" ? expenseCategories[0] : incomeCategories[0]);
  }, [type, activeWorkspace]);`;

code = code.replace(
  "  const [customDateRange, setCustomDateRange] = useState({ start: \"\", end: \"\" });",
  "  const [customDateRange, setCustomDateRange] = useState({ start: \"\", end: \"\" });\n" + categoryEffect
);

// Remove the manual setCategory from onClick and handleTypeChange
code = code.replace(/setCategory\(newType === "expense" \? EXPENSE_CATEGORIES\[0\] : INCOME_CATEGORIES\[0\]\);/g, "");
code = code.replace(/onClick=\{\(\) => \{ setType\('expense'\); setCategory\(EXPENSE_CATEGORIES\[0\]\); \}\}/g, "onClick={() => setType('expense')}");
code = code.replace(/onClick=\{\(\) => \{ setType\('income'\); setCategory\(INCOME_CATEGORIES\[0\]\); \}\}/g, "onClick={() => setType('income')}");

// Use dynamic categories in map
code = code.replace(
  /\{\(type === "expense" \? EXPENSE_CATEGORIES : INCOME_CATEGORIES\)\.map\(cat => \(/g,
  "{(type === 'expense' ? expenseCategories : incomeCategories).map(cat => ("
);

// Fix focus rings to use cyan-600 for business
code = code.replace(
  /focus-visible:ring-\[\#059669\]/g,
  "${activeWorkspace === 'business' ? 'focus-visible:ring-cyan-600' : 'focus-visible:ring-[#059669]'}"
);

// Some buttons have hardcoded text-emerald-600.
code = code.replace(
  /text-emerald-600/g,
  "${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'}"
);
code = code.replace(
  /bg-emerald-100/g,
  "${activeWorkspace === 'business' ? 'bg-cyan-100' : 'bg-emerald-100'}"
);

// We have template literals in some classNames already, let's just make sure we replace it correctly.
// A better way is to define theme classes in Transactions.tsx like we did for Dashboard.

fs.writeFileSync('src/pages/Transactions.tsx', code);
console.log("Patched Transactions categories");
