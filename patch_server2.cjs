const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || "",`,
  `clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy",`
);

fs.writeFileSync('server.ts', code);
