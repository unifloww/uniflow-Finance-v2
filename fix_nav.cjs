const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

const oldMobileNavStart = code.indexOf('{/* Mobile Bottom Navigation */}');
const trialOverlayStart = code.indexOf('{/* Trial Expired Overlay */}');

if (oldMobileNavStart !== -1 && trialOverlayStart !== -1) {
  const replacement = `      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-6 left-4 right-4 z-40 lg:hidden">
        <nav className="flex h-[72px] items-center justify-between bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 px-4">
          {[navItems[0], navItems[2]].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-[4.5rem] h-full gap-1"
              >
                <Icon className={\`h-[22px] w-[22px] \${isActive ? 'text-[#10b981]' : 'text-slate-500 dark:text-slate-400'}\`} />
                <span className={\`text-[10px] font-medium \${isActive ? 'text-[#10b981]' : 'text-slate-500 dark:text-slate-400'}\`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          <button
            onClick={() => navigate('/dashboard/transactions', { state: { openAdd: true } })}
            className="flex flex-col items-center justify-center -mt-8 relative z-50 transition-transform active:scale-95"
          >
            <div className="h-16 w-16 rounded-full bg-[#10b981] shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white border-[6px] border-slate-50 dark:border-slate-950">
              <Plus className="h-8 w-8" strokeWidth={2.5} />
            </div>
          </button>

          {[navItems[3], navItems[4]].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-[4.5rem] h-full gap-1"
              >
                <Icon className={\`h-[22px] w-[22px] \${isActive ? 'text-[#10b981]' : 'text-slate-500 dark:text-slate-400'}\`} />
                <span className={\`text-[10px] font-medium \${isActive ? 'text-[#10b981]' : 'text-slate-500 dark:text-slate-400'}\`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Floating Action Button (FAB) - ONLY DESKTOP */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate('/dashboard/transactions', { state: { openAdd: true } })}
        className="fixed hidden lg:flex bottom-8 right-8 h-14 w-14 bg-gradient-to-tr from-[#059669] to-teal-400 hover:from-[#047857] hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-900/50 items-center justify-center z-50 transition-all border-2 border-white dark:border-slate-800 cursor-pointer"
      >
        <Plus className="h-6 w-6 font-bold" />
      </motion.button>

      `;

  const newCode = code.substring(0, oldMobileNavStart) + replacement + code.substring(trialOverlayStart);
  fs.writeFileSync('src/components/UserLayout.tsx', newCode);
  console.log("Updated UserLayout.tsx");
} else {
  console.error("Could not find sections");
}
