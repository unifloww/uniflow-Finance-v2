const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

code = code.replace(
  '{ name: "Penghasilan", path: "/admin/revenue", icon: DollarSign },',
  '{ name: "Penghasilan", path: "/admin/revenue", icon: DollarSign },\n    { name: "Pembayaran", path: "/admin/upgrades", icon: CreditCard },' // Assuming CreditCard is already imported
);

// We should also ensure CreditCard is imported. I think I checked and it was imported.
// Actually, I saw CreditCard imported from lucide-react.

fs.writeFileSync('src/components/AdminLayout.tsx', code);
