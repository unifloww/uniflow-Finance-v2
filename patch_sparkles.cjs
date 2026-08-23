const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

code = code.replace(
  /<Sparkles className="h-4 w-4 absolute top-2 right-2 text-pink-200 animate-pulse" \/>/g,
  ''
);

fs.writeFileSync('src/components/AIAssistant.tsx', code);
console.log("Removed sparkles");
