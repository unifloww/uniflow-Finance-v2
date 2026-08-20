const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!code.includes('Target')) {
  code = code.replace(
    '} from "lucide-react";',
    '  Target,\n} from "lucide-react";'
  );
}

if (!code.includes('FileText')) {
  code = code.replace(
    '} from "lucide-react";',
    '  FileText,\n} from "lucide-react";'
  );
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
