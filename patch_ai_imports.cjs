const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

code = code.replace(
  "import { MessageSquare, X, Send, User, Sparkles, Headset } from 'lucide-react';",
  "import { MessageSquare, X, Send, User, Sparkles, Headset, Settings, Key, Check } from 'lucide-react';"
);

fs.writeFileSync('src/components/AIAssistant.tsx', code);
