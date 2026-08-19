const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

const oldMobileNavStart = code.indexOf('{/* Mobile Bottom Navigation */}');
const trialOverlayStart = code.indexOf('{/* Floating Action Button (FAB) - ONLY DESKTOP */}');

if (oldMobileNavStart !== -1 && trialOverlayStart !== -1) {
  const replacement = `      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-6 left-4 right-4 z-50 lg:hidden">
        <nav className="flex h-[72px] items-center justify-between bg-emerald-600/95 dark:bg-emerald-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(5,150,105,0.4)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] border border-emerald-500/50 dark:border-emerald-700/50 px-5">
          {[navItems[0], navItems[2]].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-[4rem] h-full gap-1 transition-all"
              >
                <div className={\`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 \${isActive ? 'bg-emerald-700/50 dark:bg-emerald-800/50 shadow-inner' : ''}\`}>
                  <Icon className={\`h-[22px] w-[22px] \${isActive ? 'text-white drop-shadow-md' : 'text-emerald-100/70'}\`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={\`text-[9px] font-semibold transition-all duration-300 \${isActive ? 'text-white drop-shadow-md' : 'text-emerald-100/70'}\`}>
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
            <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] flex items-center justify-center text-emerald-600 border-[5px] border-emerald-600 dark:border-emerald-900 ring-1 ring-emerald-500/50">
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
                <div className={\`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 \${isActive ? 'bg-emerald-700/50 dark:bg-emerald-800/50 shadow-inner' : ''}\`}>
                  <Icon className={\`h-[22px] w-[22px] \${isActive ? 'text-white drop-shadow-md' : 'text-emerald-100/70'}\`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={\`text-[9px] font-semibold transition-all duration-300 \${isActive ? 'text-white drop-shadow-md' : 'text-emerald-100/70'}\`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      `;

  const newCode = code.substring(0, oldMobileNavStart) + replacement + code.substring(trialOverlayStart);
  fs.writeFileSync('src/components/UserLayout.tsx', newCode);
  console.log("Updated UserLayout.tsx for Green Bottom Nav");
} else {
  console.error("Could not find sections");
}
