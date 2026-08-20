const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

code = code.replace(
  '<Bot className="h-6 w-6 text-white" />',
  '<Headset className="h-6 w-6 text-white" />'
);

fs.writeFileSync('src/components/AIAssistant.tsx', code);
console.log("Patched AIAssistant.tsx header");
