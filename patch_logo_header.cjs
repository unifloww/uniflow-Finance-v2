const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// The mobile header is inside <main>. For it to be sticky to the top of the viewport when scrolling, <main> needs to not be the scroll container OR header must be fixed.
// The easiest way to make header fixed is to pull it outside of main, or change its position to fixed.
// Since main has overflow-y-auto, sticky will only stick inside the main container. This is actually fine as it acts sticky to the viewport of the app.
// But we want to ensure it works well on mobile browsers. Let's make it fixed.

code = code.replace(
  '<header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#10b981] bg-[#059669] px-4 py-2 lg:hidden shadow-md">',
  '<header className="fixed top-0 inset-x-0 z-50 flex h-20 items-center justify-between border-b border-[#10b981] bg-[#059669] px-4 py-2 lg:hidden shadow-md">'
);

// We need to add pt-20 to main if we use fixed mobile header
code = code.replace(
  '<main className={`flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? \'lg:pl-20\' : \'lg:pl-64\'}`}>',
  '<main className={`flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-20 lg:pt-0 transition-all duration-300 ${isSidebarCollapsed ? \'lg:pl-20\' : \'lg:pl-64\'}`}>'
);

// Make the logo larger
code = code.replace(
  'h-16 w-auto max-w-[180px] object-contain drop-shadow-md scale-110 origin-left ml-1',
  'h-16 w-auto max-w-[200px] object-contain drop-shadow-md scale-125 origin-left ml-2'
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
