const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

code = code.replace(
  /'bg-white dark:bg-slate-900 \$\{activeWorkspace === 'business' \? 'text-cyan-600' : 'text-emerald-600'\} shadow-sm'/g,
  "\`bg-white dark:bg-slate-900 \${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'} shadow-sm\`"
);

code = code.replace(
  /'bg-white dark:bg-slate-900 \$\{activeWorkspace === 'business' \? 'text-cyan-600' : 'text-emerald-600'\} shadow-sm'/g, // This was for type === 'income'
  "\`bg-white dark:bg-slate-900 \${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'} shadow-sm\`"
);

code = code.replace(
  /\$\{activeWorkspace === 'business' \? 'bg-cyan-100' : 'bg-emerald-100'\}/g,
  "bg-emerald-100" // I will revert this and do it properly if needed.
);

code = code.replace(
  /\$\{activeWorkspace === 'business' \? 'text-cyan-600' : 'text-emerald-600'\}/g,
  "text-emerald-600"
);

// I will just revert all text-emerald-600 and bg-emerald-100 replacements in Transactions.tsx.
// It's easier to just use the original and selectively apply.
