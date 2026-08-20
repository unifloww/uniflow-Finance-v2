const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

code = code.replace(
  "  const navItems = [\n    { name: 'Dashboard', path: '/dashboard', icon: Home },\n    { name: 'Transaksi', path: '/dashboard/transactions', icon: ArrowRightLeft },\n    { name: 'Akun', path: '/dashboard/accounts', icon: Wallet },\n    { name: 'Impian', path: '/dashboard/goals', icon: Target },\n    { name: 'Analitik', path: '/dashboard/analytics', icon: PieChart },\n    { name: 'Profil', path: '/dashboard/profile', icon: User },\n  ];",
  `  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Transaksi', path: '/dashboard/transactions', icon: ArrowRightLeft },
    { name: 'Akun', path: '/dashboard/accounts', icon: Wallet },
    { name: activeWorkspace === 'business' ? 'Target Usaha' : 'Impian', path: '/dashboard/goals', icon: Target },
    { name: 'Analitik', path: '/dashboard/analytics', icon: PieChart },
    { name: 'Profil', path: '/dashboard/profile', icon: User },
  ];`
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Fixed UserLayout navItems");
