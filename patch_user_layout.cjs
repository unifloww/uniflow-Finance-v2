const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// Update mobile header
code = code.replace(
  '<header className="sticky top-0 z-20 flex h-28 items-center justify-between border-b border-[#10b981] bg-[#059669] px-4 py-2 lg:hidden">',
  '<header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#10b981] bg-[#059669] px-4 py-2 lg:hidden shadow-md">'
);
code = code.replace(
  'h-20 w-auto max-w-[180px] object-contain drop-shadow-md',
  'h-12 w-auto max-w-[150px] object-contain drop-shadow-md'
);
// enhance logout button to be more visible and ensure it is clickable on mobile
code = code.replace(
  '<button onClick={handleLogout} className="text-emerald-100 hover:text-rose-400 p-2 rounded-full hover:bg-white/10 transition-colors">',
  '<button onClick={(e) => { e.preventDefault(); handleLogout(); }} className="text-white bg-rose-500 hover:bg-rose-600 p-2 rounded-full shadow-md transition-colors z-50 relative cursor-pointer">'
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
