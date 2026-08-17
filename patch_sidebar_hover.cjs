const fs = require('fs');

let layout = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// The LogOut button hover state was hover:text-white but the background didn't have high enough contrast on hover,
// and there might be z-index issues. Let's make it very explicit and high contrast.

layout = layout.replace(
  /className=\{\`flex w-full items-center rounded-full py-3 text-sm font-semibold text-emerald-50 hover:bg-rose-50 dark:bg-rose-950\/50 hover:text-white transition-colors/g,
  "className={`flex w-full items-center rounded-full py-3 text-sm font-bold text-white bg-rose-500/10 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all cursor-pointer"
);

fs.writeFileSync('src/components/UserLayout.tsx', layout);
