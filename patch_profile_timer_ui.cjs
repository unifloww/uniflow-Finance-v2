const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const oldUI = `                  {trialRemaining && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {trialRemaining.days} hari {trialRemaining.hours} jam
                     </span>
                  )}
`;

const newUI = `                  {trialRemaining && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {trialRemaining.days} hari {trialRemaining.hours} jam
                     </span>
                  )}
                  {planRemaining && userProfile?.plan === 'pro' && !userProfile?.planName?.toLowerCase().includes('selamanya') && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {planRemaining.days} hari {planRemaining.hours} jam
                     </span>
                  )}
`;

if (code.includes('Sisa: {trialRemaining.days} hari')) {
  code = code.replace(oldUI, newUI);
  fs.writeFileSync('src/pages/Profile.tsx', code);
  console.log("Patched Profile.tsx UI");
}
