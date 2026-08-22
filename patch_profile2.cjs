const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  `script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");`,
  `script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy");`
);

fs.writeFileSync('src/pages/Profile.tsx', code);
