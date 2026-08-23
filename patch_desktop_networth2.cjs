const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  'bg-gradient-to-br from-[#059669] to-[#047857] text-white',
  'bg-slate-900 dark:bg-slate-950 text-white'
);

code = code.replace(
  '<p className="text-[11px] font-bold text-emerald-100 mt-4">Aset dikurangi hutang</p>',
  '<p className="text-[11px] font-bold text-slate-400 mt-4">Aset dikurangi hutang</p>'
);

code = code.replace(
  '<div className="text-[11px] font-bold text-emerald-100 mb-2 uppercase tracking-wider">Kekayaan Bersih</div>',
  '<div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Kekayaan Bersih</div>'
);


fs.writeFileSync('src/pages/Dashboard.tsx', code);
