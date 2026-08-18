const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// The mobile navigation hides the "Analitik" menu
code = code.replace(
  "if (item.name === 'Analitik') return null; // Sembunyikan analitik di mobile agar muat 5 icon",
  "// Now showing all 6 icons"
);

// We need to change the width of the icons from w-[20%] to w-[16.66%] or flex-1 since there are 6 items now
code = code.replace(
  "className={`relative flex flex-col items-center justify-center w-[20%] h-full pt-1 ${",
  "className={`relative flex flex-col items-center justify-center flex-1 h-full pt-1 ${"
);

// We also need to shrink the text slightly to fit better if needed, but text-[10px] is already quite small. Let's make it text-[9px] just in case.
code = code.replace(
  "className={`text-[10px] font-bold ${isActive ? 'text-white drop-shadow-md' : 'text-emerald-200/80'}`}",
  "className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-white drop-shadow-md' : 'text-emerald-200/80'}`}"
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
