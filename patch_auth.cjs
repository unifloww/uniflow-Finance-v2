const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  "  phone?: string;\n  role: 'user' | 'superadmin';",
  "  phone?: string;\n  businessName?: string;\n  role: 'user' | 'superadmin';"
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
console.log("Patched AuthContext");
