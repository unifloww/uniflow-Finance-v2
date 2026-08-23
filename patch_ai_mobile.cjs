const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

code = code.replace(
  'fixed bottom-24 right-4 lg:bottom-28 lg:right-8',
  'fixed bottom-28 right-4 lg:bottom-28 lg:right-8'
);

fs.writeFileSync('src/components/AIAssistant.tsx', code);
console.log("Patched mobile AI assistant position");
