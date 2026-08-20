const fs = require('fs');
let code = fs.readFileSync('src/components/BudgetSection.tsx', 'utf8');

code = code.replace(
  "const { budgets, transactions, addBudget, editBudget, deleteBudget } = useData();",
  "const { budgets, transactions, addBudget, editBudget, deleteBudget, activeWorkspace } = useData();\n  const expenseCategories = activeWorkspace === 'business' ? ['Pembelian Stok/Bahan', 'Gaji Karyawan', 'Operasional', 'Pemasaran', 'Sewa Tempat', 'Pajak', 'Lainnya'] : ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan & Utilitas', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'];"
);

code = code.replace(/EXPENSE_CATEGORIES/g, "expenseCategories");

code = code.replace(
  "const [category, setCategory] = useState(expenseCategories[0]);",
  "const [category, setCategory] = useState('Makanan & Minuman');\n  useEffect(() => { setCategory(expenseCategories[0]); }, [activeWorkspace]);"
);

// Include useEffect from React
if (!code.includes('useEffect')) {
  code = code.replace("import React, { useState, useMemo } from 'react';", "import React, { useState, useMemo, useEffect } from 'react';");
}

fs.writeFileSync('src/components/BudgetSection.tsx', code);
