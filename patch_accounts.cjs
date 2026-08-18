const fs = require('fs');
let code = fs.readFileSync('src/pages/Accounts.tsx', 'utf8');

code = code.replace(
  'provider: provider !== "other" ? provider : undefined,',
  'provider: provider !== "other" ? provider : null,'
);
code = code.replace(
  'provider: provider !== "other" ? provider : undefined,',
  'provider: provider !== "other" ? provider : null,'
);

fs.writeFileSync('src/pages/Accounts.tsx', code);
