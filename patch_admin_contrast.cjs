const fs = require('fs');

const files = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/AdminRevenue.tsx',
  'src/pages/AdminUpgrades.tsx',
  'src/pages/AdminUsers.tsx',
  'src/pages/AdminPricing.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /text-emerald-100 max-w-xl mt-1 opacity-90/g,
    'text-slate-500 dark:text-slate-400 max-w-xl mt-1'
  );
  code = code.replace(
    /<h1 className="text-2xl font-bold tracking-tight text-white">/g,
    '<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">'
  );
  code = code.replace(
    /<h1 className="text-3xl font-bold tracking-tight text-white">/g,
    '<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">'
  );

  fs.writeFileSync(file, code);
});

console.log('Admin pages contrast updated');
