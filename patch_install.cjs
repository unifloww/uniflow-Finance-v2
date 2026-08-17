const fs = require('fs');
let code = fs.readFileSync('src/components/InstallPrompt.tsx', 'utf8');

code = code.replace(
  'const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);',
  `const isIOSDevice = 
      /iphone|ipad|ipod/.test(userAgent) ||
      (userAgent.includes("mac") && "ontouchend" in document);`
);

fs.writeFileSync('src/components/InstallPrompt.tsx', code);
