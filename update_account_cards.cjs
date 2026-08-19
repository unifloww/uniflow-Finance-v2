const fs = require('fs');

let code = fs.readFileSync('src/pages/Accounts.tsx', 'utf8');

// Replace the entire Card rendering block
const cardRegex = /<Card\s+className="rounded-\[2rem\] border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-slate-900 h-full relative group overflow-hidden"\s*>[\s\S]*?(?=<CardHeader)/;

const newCardPrefix = `<Card
                className="rounded-[2rem] border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 h-full relative group overflow-hidden"
                style={{
                  background: acc.color 
                    ? \`linear-gradient(135deg, \${acc.color}dd, \${acc.color})\` 
                    : 'linear-gradient(135deg, #059669dd, #046a4e)',
                  color: 'white'
                }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />
                
                {confirmDeleteId === acc.id && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md px-4">
                    <p className="text-sm font-bold text-white text-center mb-4">Hapus akun ini?</p>
                    <div className="flex gap-2 w-full justify-center">
                      <Button size="sm" variant="outline" className="rounded-xl border-white/20 text-slate-800 hover:text-slate-900 bg-white" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
                      <Button size="sm" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-0" onClick={() => { deleteAccount(acc.id); setConfirmDeleteId(null); }}>Hapus</Button>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:text-emerald-100 hover:bg-black/20 rounded-full bg-black/10 backdrop-blur-sm shadow-sm border border-white/10"
                    onClick={() => handleEditClick(acc)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:text-rose-200 hover:bg-black/20 rounded-full bg-black/10 backdrop-blur-sm shadow-sm border border-white/10"
                    onClick={() => setConfirmDeleteId(acc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
`;

code = code.replace(cardRegex, newCardPrefix);

// Fix CardHeader and text colors inside the card
code = code.replace(
  /<CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mb-1 pr-10">/,
  '<CardTitle className="text-base font-bold text-white line-clamp-1 mb-1 pr-10 drop-shadow-sm">'
);

code = code.replace(
  /<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">/,
  '<p className="text-[10px] font-bold text-white/70 uppercase tracking-wide mb-3">'
);

code = code.replace(
  /<div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">/,
  '<div className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">'
);

// Simplify the provider logo so it doesn't clash with the colored background
code = code.replace(
  /<div className="h-8 w-16 bg-white dark:bg-slate-900 rounded flex items-center justify-start">/,
  '<div className="h-8 w-16 bg-white/20 backdrop-blur-sm rounded-lg p-1.5 flex items-center justify-center border border-white/30 shadow-sm">'
);

code = code.replace(
  /<div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: acc.color \|\| '#059669' }}>/,
  '<div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-white/20 backdrop-blur-sm border border-white/30">'
);

fs.writeFileSync('src/pages/Accounts.tsx', code);
console.log('Accounts updated to show full card colors');
