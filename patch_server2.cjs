const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'res.status(500).json({ error: error.message || "Gagal menghubungi AI" });',
  `
      const errorMessage = error.message || "Gagal menghubungi AI";
      if (errorMessage.includes("429") || errorMessage.includes("depleted")) {
        res.status(429).json({ error: "Kuota API Gemini Anda telah habis. Silakan periksa pengaturan billing di Google AI Studio." });
      } else {
        res.status(500).json({ error: errorMessage });
      }
  `
);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts error handling");
