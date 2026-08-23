const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUpgrades.tsx', 'utf8');

code = code.replace(
  `let planType = 'pro';
        if (planName.toLowerCase().includes('selamanya')) {
          planType = 'lifetime';
        }`,
  `let planType = 'pro';
        if (planName.toLowerCase().includes('selamanya')) {
          // Tetap 'pro', tetapi tanpa expiry
        }`
);

fs.writeFileSync('src/pages/AdminUpgrades.tsx', code);
