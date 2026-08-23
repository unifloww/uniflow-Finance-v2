const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminRevenue.tsx', 'utf8');

code = code.replace(
  "if (doc.data().plan === 'pro') countPro++;",
  "if (['pro', '1_month', '1_year', 'lifetime'].includes(doc.data().plan)) countPro++;"
);

fs.writeFileSync('src/pages/AdminRevenue.tsx', code);
