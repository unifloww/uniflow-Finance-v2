const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

const targetState = `  const [isLoading, setIsLoading] = useState(false);
  const { transactions, accounts, goals } = useData();`;

const replacementState = `  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  
  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (key.trim()) {
      localStorage.setItem('user_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
  };

  const { transactions, accounts, goals } = useData();`;

code = code.replace(targetState, replacementState);
fs.writeFileSync('src/components/AIAssistant.tsx', code);
