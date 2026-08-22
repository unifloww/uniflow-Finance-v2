const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const targetScript = `const loadSnapScript = () => {
        return new Promise((resolve) => {
          if ((window as any).snap) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy";
          // Deteksi otomatis apakah menggunakan Sandbox atau Production berdasarkan Client Key
          const isSandbox = clientKey.includes("SB-");
          script.src = isSandbox ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js";
          script.setAttribute('data-client-key', clientKey);`;

const replacementScript = `const loadSnapScript = (isSandboxEnvironment) => {
        return new Promise((resolve) => {
          // Selalu muat ulang script jika env berbeda, tapi untuk kesederhanaan kita asumsikan bersih
          const existingScript = document.getElementById('midtrans-script');
          if (existingScript) {
             existingScript.remove();
          }
          if ((window as any).snap) {
            // Hapus cache snap object jika ada agar tidak bentrok
            delete (window as any).snap;
          }

          const script = document.createElement('script');
          script.id = 'midtrans-script';
          const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy";
          
          // Gunakan isSandbox dari backend karena lebih akurat (berdasarkan Server Key)
          script.src = isSandboxEnvironment ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js";
          script.setAttribute('data-client-key', clientKey);`;

code = code.replace(targetScript, replacementScript);

// Patch the call to loadSnapScript
code = code.replace('await loadSnapScript();', 'await loadSnapScript(data.isSandbox);');

fs.writeFileSync('src/pages/Profile.tsx', code);
