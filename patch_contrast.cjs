const fs = require('fs');

function fixContrast(file) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
    // Also fix cases where it becomes "text-slate-500 dark:text-slate-500 dark:text-slate-400"
    code = code.replace(/text-slate-500 dark:text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-400');
    fs.writeFileSync(file, code);
}

fixContrast('src/pages/AdminRevenue.tsx');
fixContrast('src/pages/AdminDashboard.tsx');
fixContrast('src/pages/Accounts.tsx');

