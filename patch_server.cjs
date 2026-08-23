const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importStatement = `import { GoogleGenAI } from "@google/genai";\n`;
if (!code.includes('@google/genai')) {
  code = code.replace('import dotenv from "dotenv";', 'import dotenv from "dotenv";\n' + importStatement);
}

const aiEndpoint = `
  app.post("/api/ai/chat", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { history, context } = req.body;
      
      const contents = history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: "Kamu adalah FIA (Finance Intelligence Assistant), asisten keuangan pintar, ramah, dan solutif dari Uniflow Finance. Berikan respon yang ringkas, jelas, dan menggunakan bahasa Indonesia yang baik. Berikut adalah konteks pengguna saat ini:\\n\\n" + context,
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Gagal menghubungi AI" });
    }
  });
`;

if (!code.includes('/api/ai/chat')) {
  // Insert before Vite middleware
  code = code.replace('// Vite middleware for development', aiEndpoint + '\n  // Vite middleware for development');
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with AI endpoint");
} else {
  console.log("AI endpoint already exists");
}
