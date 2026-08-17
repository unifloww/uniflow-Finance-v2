const fs = require('fs');

let layout = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// 1. Remove the large banner
const largeBanner = `{/* Trial Countdown Banner */}
        {trialRemaining && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  Uji Coba PRO Berakhir dalam {trialRemaining.days} hari {trialRemaining.hours} jam
                </h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5 font-medium">
                  Jangan sampai kehilangan akses fitur pintar Uniflow Anda.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 font-bold whitespace-nowrap"
            >
              Upgrade PRO
            </Button>
          </div>
        )}`;

layout = layout.replace(largeBanner, '');

// 2. Inject simple banner into sidebar before <button onClick={handleLogout}
const simpleSidebarBanner = `
            {!isSidebarCollapsed && trialRemaining && (
              <div className="mb-4 px-4">
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="text-[10px] text-emerald-100 mb-2 font-medium leading-relaxed">
                     Sisa Trial: <span className="font-bold text-white text-xs">{trialRemaining.days} hr {trialRemaining.hours} jm</span>
                  </div>
                  <button 
                     onClick={handleUpgrade}
                     className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] uppercase tracking-wider font-bold rounded-lg shadow-md transition-colors"
                  >
                     Upgrade PRO
                  </button>
                </div>
              </div>
            )}
`;

layout = layout.replace(
  '<button\n              onClick={handleLogout}',
  simpleSidebarBanner + '\n            <button\n              onClick={handleLogout}'
);

fs.writeFileSync('src/components/UserLayout.tsx', layout);
