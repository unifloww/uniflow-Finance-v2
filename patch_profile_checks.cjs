const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  /planRemaining && userProfile\?\.plan === 'pro'/g,
  "planRemaining && ['pro', '1_month', '1_year'].includes(userProfile?.plan || '')"
);

fs.writeFileSync('src/pages/Profile.tsx', code);
