const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const themeClassesInjection = `
  const themeClasses = activeWorkspace === 'business' 
    ? {
        gradientTop: 'from-cyan-400 via-[#0891b2] to-[#0e7490]',
        gradientMain: 'from-[#0891b2] via-[#0e7490] to-[#155e75]',
        borderLight: 'border-cyan-300/40',
        borderMain: 'border-cyan-500/30',
        textLight: 'text-cyan-100/90',
        textDark: 'text-cyan-900',
        shadowMain: 'shadow-cyan-950/40',
        textAccent: 'text-cyan-200/90',
        textAccentBright: 'text-cyan-200',
        textPrimary: 'text-cyan-600',
        textPrimaryDark: 'text-[#0891b2]',
        bgLight: 'bg-cyan-100',
        bgDark: 'dark:bg-cyan-950/50',
        textDarkPrimary: 'dark:text-cyan-400',
        hoverBorder: 'hover:border-cyan-200 dark:hover:border-cyan-900/50',
        hoverText: 'hover:text-cyan-700',
        iconBg: 'bg-cyan-50',
        plusText: 'text-cyan-200 hover:text-[#0891b2]'
      }
    : {
        gradientTop: 'from-emerald-400 via-[#10b981] to-[#059669]',
        gradientMain: 'from-[#059669] via-[#047857] to-[#046246]',
        borderLight: 'border-emerald-300/40',
        borderMain: 'border-emerald-500/30',
        textLight: 'text-emerald-100/90',
        textDark: 'text-emerald-900',
        shadowMain: 'shadow-emerald-950/40',
        textAccent: 'text-emerald-200/90',
        textAccentBright: 'text-emerald-200',
        textPrimary: 'text-emerald-600',
        textPrimaryDark: 'text-[#059669]',
        bgLight: 'bg-emerald-100',
        bgDark: 'dark:bg-emerald-950/50',
        textDarkPrimary: 'dark:text-emerald-400',
        hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-900/50',
        hoverText: 'hover:text-emerald-700',
        iconBg: 'bg-emerald-50',
        plusText: 'text-emerald-200 hover:text-[#059669]'
      };
`;

code = code.replace(
  "  const totalBalance = useMemo(() => {",
  themeClassesInjection + "\n  const totalBalance = useMemo(() => {"
);

// We need to replace specific strings safely.
// Let's use template literals for classes in Dashboard.tsx where they exist.
// This is tedious to do with regex, maybe I'll replace the entire return block or specific lines?
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Injected themeClasses to Dashboard");
