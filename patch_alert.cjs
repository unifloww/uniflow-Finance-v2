const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUpgrades.tsx', 'utf8');

code = code.replace(/\\`\)/g, '\`)');

fs.writeFileSync('src/pages/AdminUpgrades.tsx', code);
