const fs = require('fs');

// PATCH Accounts.tsx
let accountsCode = fs.readFileSync('src/pages/Accounts.tsx', 'utf8');

// Add color state
accountsCode = accountsCode.replace(
  'const [balance, setBalance] = useState("");',
  'const [balance, setBalance] = useState("");\n  const [color, setColor] = useState("#059669");'
);

// Add color to resetForm
accountsCode = accountsCode.replace(
  'setBalance("");',
  'setBalance("");\n    setColor("#059669");'
);

// Add color to handleEditClick
accountsCode = accountsCode.replace(
  'setBalance(acc.balance.toString());',
  'setBalance(acc.balance.toString());\n    setColor(acc.color || "#059669");'
);

// Add color to editAccount
accountsCode = accountsCode.replace(
  'balance: parseFloat(balance),',
  'balance: parseFloat(balance),\n        color,'
);

// Add color to addAccount
accountsCode = accountsCode.replace(
  'balance: parseFloat(balance),\n      });',
  'balance: parseFloat(balance),\n        color,\n      });'
);

// Add Color picker UI
const colorPickerUI = `
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Warna Dompet</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {['#059669', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setColor(c)}
                              className={\`w-8 h-8 rounded-full border-2 transition-all \${color === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent hover:scale-110'}\`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <div className="relative">
                            <input 
                              type="color" 
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden appearance-none"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>
`;

accountsCode = accountsCode.replace(
  '<div className="space-y-2">\n                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">\n                          Saldo {editingId ? "Saat Ini (Rp)" : "Awal (Rp)"}\n                        </label>',
  colorPickerUI + '\n                      <div className="space-y-2">\n                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">\n                          Saldo {editingId ? "Saat Ini (Rp)" : "Awal (Rp)"}\n                        </label>'
);

// Make button more vibrant
accountsCode = accountsCode.replace(
  'className="bg-[#059669] text-white hover:bg-[#047857] shadow-lg shadow-emerald-900/20 rounded-xl font-semibold px-6"',
  'className="bg-gradient-to-r from-[#059669] to-teal-500 text-white hover:from-[#047857] hover:to-teal-600 shadow-xl shadow-emerald-500/30 rounded-xl font-bold px-8"'
);

accountsCode = accountsCode.replace(
  'className="bg-[#059669] text-white hover:bg-[#047857] shadow-lg shadow-emerald-900/20 rounded-xl font-semibold px-6 flex items-center gap-2"',
  'className="bg-gradient-to-r from-[#059669] to-teal-500 text-white hover:from-[#047857] hover:to-teal-600 shadow-xl shadow-emerald-500/30 rounded-xl font-bold px-6 flex items-center gap-2"'
);

// Apply color to cards in Accounts.tsx
// Currently Card has: <Card className="relative overflow-hidden group border-0 shadow-md bg-white dark:bg-slate-900 rounded-[2rem] hover:shadow-xl transition-all duration-300">
// Let's add a subtle background tint or a colorful top border using style
accountsCode = accountsCode.replace(
  '<Card className="relative overflow-hidden group border-0 shadow-md bg-white dark:bg-slate-900 rounded-[2rem] hover:shadow-xl transition-all duration-300">',
  '<Card className="relative overflow-hidden group border-0 shadow-md bg-white dark:bg-slate-900 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ borderBottom: \`4px solid \${acc.color || \'#059669\'}\` }}>'
);

accountsCode = accountsCode.replace(
  '<div className="h-10 w-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 dark:text-slate-500">',
  '<div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: acc.color || \'#059669\' }}>'
);

fs.writeFileSync('src/pages/Accounts.tsx', accountsCode);


// PATCH Dashboard.tsx
let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dashboardCode = dashboardCode.replace(
  '<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600">',
  '<div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: acc.color || \'#059669\' }}>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode);

