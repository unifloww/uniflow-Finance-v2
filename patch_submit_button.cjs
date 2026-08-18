const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  'disabled={isProcessing || !proofImage}',
  'disabled={isProcessing || !proofImage}'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
