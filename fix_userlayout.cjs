const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// Fix strings
code = code.replace(
  `{
        bg: '\${themeClasses.bg}',
        border: '\${themeClasses.border}',
        gradient: '\${themeClasses.gradient}',
        activeNav: '\${themeClasses.activeNav}',
        navText: '\${themeClasses.navText}',
        textActive: '\${themeClasses.textActive}',
        borderActive: '\${themeClasses.borderActive}',
        ringActive: '\${themeClasses.ringActive}'
      }`,
  `{
        bg: 'bg-[#059669]',
        border: 'border-[#10b981]',
        gradient: 'from-[#059669] to-teal-700',
        activeNav: 'bg-emerald-700/50 dark:bg-emerald-800/50 shadow-inner',
        navText: 'text-emerald-100/70',
        textActive: 'text-emerald-600',
        borderActive: 'border-emerald-600 dark:border-emerald-900',
        ringActive: 'ring-emerald-500/50'
      }`
);

// Fix double quotes with ${} to use backticks
code = code.replace(/className="border-t \$\{themeClasses\.border\} pt-4"/g, "className={`border-t ${themeClasses.border} pt-4`}");
code = code.replace(/className="hidden lg:block absolute top-0 left-0 right-0 \$\{themeClasses\.bg\} h-\[340px\] z-0 shadow-sm pointer-events-none"/g, "className={`hidden lg:block absolute top-0 left-0 right-0 ${themeClasses.bg} h-[340px] z-0 shadow-sm pointer-events-none`}");
code = code.replace(/className="fixed top-0 inset-x-0 z-50 flex h-20 items-center justify-between border-b border-emerald-600\/40 bg-gradient-to-r \$\{themeClasses\.gradient\} px-4 py-2 lg:hidden shadow-md"/g, "className={`fixed top-0 inset-x-0 z-50 flex h-20 items-center justify-between border-b border-emerald-600/40 bg-gradient-to-r ${themeClasses.gradient} px-4 py-2 lg:hidden shadow-md`}");
code = code.replace(/className="text-white hover:bg-white\/10 p-2 rounded-full transition-colors flex items-center justify-center \$\{themeClasses\.bg\} shadow-sm border \$\{themeClasses\.border\}"/g, "className={`text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center ${themeClasses.bg} shadow-sm border ${themeClasses.border}`}");
code = code.replace(/className="text-sm font-bold text-white \$\{themeClasses\.bg\} px-4 py-2 rounded-full shadow-sm border \$\{themeClasses\.border\} hover:bg-white dark:bg-slate-900 hover:text-\[\#059669\] transition-colors flex items-center gap-2"/g, "className={`text-sm font-bold text-white ${themeClasses.bg} px-4 py-2 rounded-full shadow-sm border ${themeClasses.border} hover:bg-white dark:bg-slate-900 hover:text-[#059669] transition-colors flex items-center gap-2`}");
code = code.replace(/className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 shadow-\[0_12px_24px_-8px_rgba\(0,0,0,0\.3\)\] flex items-center justify-center \$\{themeClasses\.textActive\} border-\[5px\] \$\{themeClasses\.borderActive\} ring-1 \$\{themeClasses\.ringActive\}"/g, "className={`h-16 w-16 rounded-full bg-white dark:bg-slate-800 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] flex items-center justify-center ${themeClasses.textActive} border-[5px] ${themeClasses.borderActive} ring-1 ${themeClasses.ringActive}`}");
code = code.replace(/className="w-full \$\{themeClasses\.bg\} hover:bg-\[\#047857\] text-white py-6 rounded-xl text-base font-bold shadow-lg shadow-emerald-900\/20"/g, "className={`w-full ${themeClasses.bg} hover:bg-[#047857] text-white py-6 rounded-xl text-base font-bold shadow-lg shadow-emerald-900/20`}");

// Replace nested template literals in backticks
code = code.replace(/\$\{isActive \? '\$\{themeClasses\.activeNav\}' : ''\}/g, "${isActive ? themeClasses.activeNav : ''}");
code = code.replace(/\$\{isActive \? 'text-white drop-shadow-md' : '\$\{themeClasses\.navText\}'\}/g, "${isActive ? 'text-white drop-shadow-md' : themeClasses.navText}");

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Fixed UserLayout double quotes");
