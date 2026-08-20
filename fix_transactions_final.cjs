const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

code = code.replace(
  "  const { transactions, accounts, addTransaction, deleteTransaction } = useData();",
  "  const { transactions, accounts, addTransaction, deleteTransaction, activeWorkspace } = useData();\n  const expenseCategories = activeWorkspace === 'business' ? ['Pembelian Stok/Bahan', 'Gaji Karyawan', 'Operasional', 'Pemasaran', 'Sewa Tempat', 'Pajak', 'Lainnya'] : ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan & Utilitas', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'];\n  const incomeCategories = activeWorkspace === 'business' ? ['Penjualan Produk', 'Pendapatan Jasa', 'Pendapatan Lainnya'] : ['Gaji', 'Bonus', 'Investasi', 'Pemberian', 'Lainnya'];"
);

// We should also replace the static CATEGORIES usage in the JSX.
code = code.replace(/EXPENSE_CATEGORIES/g, "expenseCategories");
code = code.replace(/INCOME_CATEGORIES/g, "incomeCategories");

fs.writeFileSync('src/pages/Transactions.tsx', code);
