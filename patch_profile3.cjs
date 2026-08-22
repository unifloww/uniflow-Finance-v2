const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const targetScript = `const script = document.createElement('script');
          script.src = "https://app.midtrans.com/snap/snap.js";
          script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy");`;

const replacementScript = `const script = document.createElement('script');
          const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy";
          // Deteksi otomatis apakah menggunakan Sandbox atau Production berdasarkan Client Key
          const isSandbox = clientKey.includes("SB-");
          script.src = isSandbox ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js";
          script.setAttribute('data-client-key', clientKey);`;

code = code.replace(targetScript, replacementScript);

fs.writeFileSync('src/pages/Profile.tsx', code);
