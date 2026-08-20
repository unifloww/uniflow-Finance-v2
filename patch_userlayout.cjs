const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// Ensure FileText is imported
if (!code.includes('FileText')) {
  code = code.replace(
    "} from 'lucide-react';",
    "  FileText,\n} from 'lucide-react';"
  );
}

// Separate navItems into core and extra, and dynamically combine them for Sidebar ONLY.
// Oh wait, if I change navItems definition, it will affect the mobile bottom bar which maps navItems[0], navItems[2], navItems[3], navItems[4].
// It's safer to just create a new array `sidebarNavItems` for the sidebar mapping.
// Let's replace the `navItems.map` in the sidebar section.

// First find the sidebar section:
// <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
//   {navItems.map((item) => {

code = code.replace(
  /<nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">\s*\{navItems\.map\(\(item\) => \{/g,
  `<nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {[...navItems.slice(0, 5), ...(activeWorkspace === 'business' ? [{ name: 'Invoice', path: '/dashboard/invoice', icon: FileText }] : []), navItems[5]].map((item) => {`
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Patched UserLayout.tsx");
