const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

code = code.replace(
  'className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${activeWorkspace === \'business\' ? \'focus-visible:ring-cyan-600\' : \'focus-visible:ring-[#059669]\'}"',
  'className={`w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${activeWorkspace === \'business\' ? \'focus-visible:ring-cyan-600\' : \'focus-visible:ring-[#059669]\'}`}'
);

fs.writeFileSync('src/pages/Transactions.tsx', code);
