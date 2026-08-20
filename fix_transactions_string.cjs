const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

code = code.replace(
  "className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-slate-900 ${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'} shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}",
  "className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? `bg-white dark:bg-slate-900 ${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'} shadow-sm` : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}"
);

fs.writeFileSync('src/pages/Transactions.tsx', code);
