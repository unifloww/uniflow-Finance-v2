const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace the truncated classes with smaller font classes without truncation
code = code.replace(/text-xl xl:text-2xl font-black([^>]*) flex-1 min-w-0 truncate pr-2/g, 'text-base lg:text-sm xl:text-lg font-black$1 tracking-tighter');
code = code.replace(/text-xl xl:text-2xl font-black flex-1 min-w-0 truncate pr-2/g, 'text-base lg:text-sm xl:text-lg font-black tracking-tighter');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Font sizes adjusted and truncation removed");
