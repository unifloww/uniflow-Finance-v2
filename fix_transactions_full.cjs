const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

// I'll revert all the bad dynamic styles I introduced by replacing the broken ones.
code = code.replace(
  /\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \$\{type === 'income' \? \`bg-white dark:bg-slate-900 text-emerald-600 shadow-sm\` : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'\}\`/g,
  "`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`"
);

code = code.replace(
  /\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \$\{type === 'expense' \? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'\}\`/g,
  "`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`"
);

// I'll write a clean function to fix it
