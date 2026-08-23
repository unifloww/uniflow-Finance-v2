const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const targetStr = `<div className="grid grid-cols-4 gap-5 mb-8">
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white">
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Kas & Likuid</div>`;

const replacementStr = `<div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-gradient-to-br from-[#059669] to-[#047857] text-white">
            <div className="text-[11px] font-bold text-emerald-100 mb-2 uppercase tracking-wider">Kekayaan Bersih</div>
            <div className="flex justify-between items-start">
               <h2 className="text-2xl xl:text-3xl font-black">{hideBalances ? "••••••" : formatCurrency(netWorth)}</h2>
               <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
               </div>
            </div>
            <p className="text-[11px] font-bold text-emerald-100 mt-4">Aset dikurangi hutang</p>
          </Card>

          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white">
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Kas & Likuid</div>`;

if (code.includes('<div className="grid grid-cols-4 gap-5 mb-8">')) {
  code = code.replace(targetStr, replacementStr);
  
  // also adjust the cashflow card width if necessary, but 5 columns is fine
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log("Patched successfully");
} else {
  console.error("Target string not found");
}

