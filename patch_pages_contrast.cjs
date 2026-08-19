const fs = require('fs');

const files = ['src/pages/Transactions.tsx', 'src/pages/Accounts.tsx', 'src/pages/Goals.tsx', 'src/pages/Analytics.tsx', 'src/pages/Profile.tsx'];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Replace text-white on h1/h2 page headings
  code = code.replace(
    /<h1 className="text-2xl font-bold tracking-tight text-white">/g,
    '<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">'
  );
  code = code.replace(
    /<h1 className="text-3xl font-bold tracking-tight text-white">/g,
    '<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">'
  );
  code = code.replace(
    /<p className="text-sm text-emerald-100 max-w-xl mt-1 opacity-90">/g,
    '<p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">'
  );
  code = code.replace(
    /<p className="text-sm text-emerald-100 mt-1">/g,
    '<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">'
  );
  code = code.replace(
    /<p className="text-emerald-100 mt-1">/g,
    '<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">'
  );
  code = code.replace(
    /<p className="text-emerald-100 text-sm">/g,
    '<p className="text-sm text-slate-500 dark:text-slate-400">'
  );

  fs.writeFileSync(file, code);
});

console.log('Pages contrast updated successfully');
