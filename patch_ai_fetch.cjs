const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

const targetFetch = `        body: JSON.stringify({
          history: chatHistory,
          context: contextData
        })
      });`;

const replacementFetch = `        body: JSON.stringify({
          history: chatHistory,
          context: contextData,
          userApiKey: apiKey.trim() || undefined
        })
      });`;

code = code.replace(targetFetch, replacementFetch);
fs.writeFileSync('src/components/AIAssistant.tsx', code);
