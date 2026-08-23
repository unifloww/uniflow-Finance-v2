const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  "{userProfile?.plan === 'pro' ? (",
  "{['pro', '1_month', '1_year', 'lifetime'].includes(userProfile?.plan || '') ? ("
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
