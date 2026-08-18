const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

code = code.replace(
  'provider?: string;',
  'provider?: string | null;\n  color?: string;'
);

fs.writeFileSync('src/contexts/DataContext.tsx', code);
