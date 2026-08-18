const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  '), document.body)}',
  ', document.body)}'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
