const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
if (!code.includes("planEnd?: string;")) {
  code = code.replace("createdAt?: string;", "createdAt?: string;\n  planEnd?: string;");
  fs.writeFileSync('src/contexts/AuthContext.tsx', code);
}
