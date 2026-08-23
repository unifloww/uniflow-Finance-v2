const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetContent = `
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { history, context } = req.body;
`;

const replacementContent = `
      const { history, context, userApiKey } = req.body;
      const apiKeyToUse = userApiKey || process.env.GEMINI_API_KEY;

      if (!apiKeyToUse) {
        throw new Error("API Key tidak ditemukan. Silakan atur API Key Anda di pengaturan.");
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
`;

if (code.includes('if (!process.env.GEMINI_API_KEY) {')) {
  code = code.replace(targetContent, replacementContent);
  fs.writeFileSync('server.ts', code);
  console.log("Patched BYOK on server.ts");
}
