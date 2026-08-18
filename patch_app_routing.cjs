const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { AdminUsers } from "./pages/AdminUsers";',
  'import { AdminUsers } from "./pages/AdminUsers";\nimport { AdminUpgrades } from "./pages/AdminUpgrades";'
);

code = code.replace(
  '<Route path="/admin/users" element={<AdminUsers />} />',
  '<Route path="/admin/users" element={<AdminUsers />} />\n                  <Route path="/admin/upgrades" element={<AdminUpgrades />} />'
);

fs.writeFileSync('src/App.tsx', code);

// Patch AdminLayout
let layout = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

if (!layout.includes('/admin/upgrades')) {
  layout = layout.replace(
    'href: "/admin/revenue", icon: DollarSign',
    'href: "/admin/revenue", icon: DollarSign },\n  { name: "Pembayaran", href: "/admin/upgrades", icon: DollarSign' // Let's use a different icon if imported, else DollarSign
  );
  // change the icon to CreditCard or something
  if (layout.includes('CreditCard')) {
     layout = layout.replace('{ name: "Pembayaran", href: "/admin/upgrades", icon: DollarSign', '{ name: "Pembayaran", href: "/admin/upgrades", icon: CreditCard');
  } else {
     layout = layout.replace('Users, DollarSign', 'Users, DollarSign, CreditCard');
     layout = layout.replace('{ name: "Pembayaran", href: "/admin/upgrades", icon: DollarSign', '{ name: "Pembayaran", href: "/admin/upgrades", icon: CreditCard');
  }
}
fs.writeFileSync('src/components/AdminLayout.tsx', layout);
