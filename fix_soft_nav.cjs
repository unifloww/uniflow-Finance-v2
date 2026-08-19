const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

const oldMobileNavStart = code.indexOf('{/* Mobile Bottom Navigation */}');
const trialOverlayStart = code.indexOf('{/* Trial Expired Overlay */}');

if (oldMobileNavStart !== -1 && trialOverlayStart !== -1) {
  const replacement = `      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-6 left-4 right-4 z-50 lg:hidden">
        <nav className="flex h-[72px] items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-white/50 dark:border-slate-700/50 px-5">
          {[navItems[0], navItems[2]].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-[4rem] h-full gap-1 transition-all"
              >
                <div className={\`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 \${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}\`}>
                  <Icon className={\`h-[22px] w-[22px] \${isActive ? 'text-[#059669]' : 'text-slate-400 dark:text-slate-500'}\`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={\`text-[9px] font-semibold transition-all duration-300 \${isActive ? 'text-[#059669]' : 'text-slate-400 dark:text-slate-500'}\`}>
                  {item.name === 'Dashboard' ? 'Home' : item.name}
                </span>
              </Link>
            );
          })}
          
          {/* Soft UI Central Floating Button */}
          <button
            onClick={() => navigate('/dashboard/transactions', { state: { openAdd: true } })}
            className="flex flex-col items-center justify-center -mt-10 relative z-50 transition-transform active:scale-90"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#059669] to-teal-400 shadow-[0_12px_24px_-8px_rgba(5,150,105,0.6)] flex items-center justify-center text-white border-[5px] border-white dark:border-slate-900 ring-1 ring-slate-100/50 dark:ring-slate-800/50">
              <Plus className="h-7 w-7" strokeWidth={3} />
            </div>
          </button>

          {[navItems[3], navItems[4]].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-[4rem] h-full gap-1 transition-all"
              >
                <div className={\`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 \${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}\`}>
                  <Icon className={\`h-[22px] w-[22px] \${isActive ? 'text-[#059669]' : 'text-slate-400 dark:text-slate-500'}\`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={\`text-[9px] font-semibold transition-all duration-300 \${isActive ? 'text-[#059669]' : 'text-slate-400 dark:text-slate-500'}\`}>
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
  console.log("Updated UserLayout.tsx for Soft UI");
} else {
  console.error("Could not find sections");
}
