const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

code = code.replace(
  "if (!response.ok) throw new Error('Gagal menghubungi AI');",
  `if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menghubungi AI');
      }`
);

code = code.replace(
  "setMessages(prev => [...prev, { role: 'ai', content: 'Maaf, sedang terjadi gangguan pada koneksi saya. Mohon coba lagi nanti.' }]);",
  "setMessages(prev => [...prev, { role: 'ai', content: error instanceof Error ? error.message : 'Maaf, sedang terjadi gangguan pada koneksi saya. Mohon coba lagi nanti.' }]);"
);

fs.writeFileSync('src/components/AIAssistant.tsx', code);
console.log("Patched AIAssistant.tsx error handling");
