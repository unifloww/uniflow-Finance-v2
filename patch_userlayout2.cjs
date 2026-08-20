const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

code = code.replace(
  '<nav className="space-y-2 relative">\n            {navItems.map((item) => {',
  `<nav className="space-y-2 relative">
            {[...navItems.slice(0, 5), ...(activeWorkspace === 'business' ? [{ name: 'Invoice', path: '/dashboard/invoice', icon: FileText }] : []), navItems[5]].map((item) => {`
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Patched UserLayout.tsx again");
