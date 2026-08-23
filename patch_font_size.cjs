const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Target specific sections for both business and personal grids
// They all use `h2 className="text-3xl font-black` or `h2 className="text-2xl xl:text-3xl font-black`

const replacePatterns = [
  { search: /<h2 className="text-3xl font-black text-slate-900 dark:text-white">/g, replace: '<h2 className="text-xl xl:text-2xl font-black text-slate-900 dark:text-white truncate pr-2">' },
  { search: /<h2 className="text-2xl xl:text-3xl font-black">/g, replace: '<h2 className="text-xl xl:text-2xl font-black truncate pr-2">' },
  { search: /<h2 className="text-3xl font-black text-indigo-600">/g, replace: '<h2 className="text-xl xl:text-2xl font-black text-indigo-600 truncate pr-2">' },
  { search: /<h2 className="text-3xl font-black text-amber-600">/g, replace: '<h2 className="text-xl xl:text-2xl font-black text-amber-600 truncate pr-2">' },
  { search: /<h2 className="text-3xl font-black text-slate-900">/g, replace: '<h2 className="text-xl xl:text-2xl font-black text-slate-900 truncate pr-2">' },
  { search: /<h2 className="text-3xl font-black text-\[#059669\]">/g, replace: '<h2 className="text-xl xl:text-2xl font-black text-[#059669] truncate pr-2">' },
  { search: /<h2 className="text-3xl font-black text-rose-600">/g, replace: '<h2 className="text-xl xl:text-2xl font-black text-rose-600 truncate pr-2">' },
  { search: /<h2 className="text-3xl font-black">/g, replace: '<h2 className="text-xl xl:text-2xl font-black truncate pr-2">' }
];

replacePatterns.forEach(pattern => {
  code = code.replace(pattern.search, pattern.replace);
});

// Since we have a flex justify-between, let's also make sure the container for the text takes remaining width (flex-1 min-w-0) so truncate works.
// Actually, they are structured like:
// <div className="flex justify-between items-start">
//   <h2 className="...">...</h2>
//   <div className="w-10 ... shrink-0">
// 
// So adding truncate to h2 works because flex container doesn't force it to shrink unless we add min-w-0 somewhere, but h2 isn't flex.
// Wait, if flex container has NO min-w-0, the children might overflow the flex container.
// It's safer to wrap the h2 or add min-w-0 to it? `truncate` already applies overflow-hidden whitespace-nowrap. We just need to make sure flex child can shrink. 
// Adding `flex-1 min-w-0` to the h2 along with `truncate pr-2` will do exactly that!

code = code.replace(/<h2 className="([^"]+) truncate pr-2">/g, '<h2 className="$1 flex-1 min-w-0 truncate pr-2">');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Font sizes adjusted");
