const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

code = code.replace("AlertCircle  Briefcase,", "AlertCircle,\n  Briefcase,");

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Fixed lucide-react import");
