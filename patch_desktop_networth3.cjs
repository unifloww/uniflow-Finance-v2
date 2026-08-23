const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const targetStr = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white dark:bg-slate-900 border-t-4 border-t-cyan-500">
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Kas & Likuid</div>`;

const replacementStr = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-slate-900 dark:bg-slate-950 border-t-4 border-t-cyan-500 text-white">
            <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Nilai Bisnis Bersih</div>
            <div className="flex justify-between items-start">
               <h2 className="text-2xl xl:text-3xl font-black">{hideBalances ? "••••••" : formatCurrency(netWorth)}</h2>
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
               </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-4">Aset dikurangi hutang</p>
          </Card>
          
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white dark:bg-slate-900">
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Kas & Likuid</div>`;

if (code.includes('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">')) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log("Patched business grid successfully");
} else {
  console.error("Target string not found for business grid");
}
