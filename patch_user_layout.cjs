const fs = require('fs');

let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// Insert the dashboard background condition
if (!code.includes('isDashboard')) {
  code = code.replace(
    'const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);',
    'const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);\n  const isDashboard = location.pathname === \'/dashboard\';'
  );
}

const mainContentStr = '<main className={`flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-20 lg:pt-0 transition-all duration-300 ${isSidebarCollapsed ? \'lg:pl-20\' : \'lg:pl-64\'}`}>';

if (!code.includes('bg-gradient-to-b from-[#059669] to-[#047857] h-[360px]')) {
  code = code.replace(
    mainContentStr,
    mainContentStr + '\n        {isDashboard && <div className="hidden lg:block absolute top-0 left-0 right-0 bg-[#059669] h-[340px] z-0 shadow-sm pointer-events-none" />}\n        <div className="relative z-10 flex flex-col flex-1 h-full">'
  );
  
  // Close the relative wrapper
  code = code.replace(
    '      </main>',
    '        </div>\n      </main>'
  );
}

// Ensure header is relative z-20 so it sits above the green bg
code = code.replace(
  '<header className="hidden lg:flex sticky top-0 z-10',
  '<header className="hidden lg:flex sticky top-0 z-20'
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log('UserLayout patched for dashboard desktop bg');
