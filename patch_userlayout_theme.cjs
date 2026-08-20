const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

code = code.replace(
  `const themeColor = activeWorkspace === 'business' ? '#4f46e5' : '#059669'; // indigo-600 vs emerald-600
  const themeClasses = activeWorkspace === 'business' 
    ? {
        bg: 'bg-[#4f46e5]',
        border: 'border-[#6366f1]',
        gradient: 'from-[#4f46e5] to-indigo-700',
        activeNav: 'bg-indigo-700/50 dark:bg-indigo-800/50 shadow-inner',
        navText: 'text-indigo-100/70',
        textActive: 'text-indigo-600',
        borderActive: 'border-indigo-600 dark:border-indigo-900',
        ringActive: 'ring-indigo-500/50'
      }`,
  `const themeColor = activeWorkspace === 'business' ? '#0891b2' : '#059669'; // cyan-600 vs emerald-600
  const themeClasses = activeWorkspace === 'business' 
    ? {
        bg: 'bg-[#0891b2]',
        border: 'border-[#06b6d4]',
        gradient: 'from-[#0891b2] to-cyan-700',
        activeNav: 'bg-cyan-700/50 dark:bg-cyan-800/50 shadow-inner',
        navText: 'text-cyan-100/70',
        textActive: 'text-cyan-600',
        borderActive: 'border-cyan-600 dark:border-cyan-900',
        ringActive: 'ring-cyan-500/50'
      }`
);

// We should also replace the button colors in the switcher
code = code.replace(
  `activeWorkspace === 'business' ? 'bg-white text-indigo-600 shadow-sm'`,
  `activeWorkspace === 'business' ? 'bg-white text-cyan-600 shadow-sm'`
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Patched UserLayout theme");
