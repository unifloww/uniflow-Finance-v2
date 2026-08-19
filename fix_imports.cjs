const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Undo all bad Clock insertions
code = code.replace(/import \{ Clock, /g, 'import { ');

// Make sure Clock is imported from lucide-react
if (!code.includes('Clock,') && code.includes('lucide-react')) {
  code = code.replace(/import \{\n  Card/g, 'import {\n  Clock,\n  Card');
  code = code.replace(/import \{\n  Wallet/g, 'import {\n  Clock,\n  Wallet');
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
