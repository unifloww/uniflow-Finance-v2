const fs = require('fs');

// Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  'res.json({ token: transaction.token, redirect_url: transaction.redirect_url });',
  'res.json({ token: transaction.token, redirect_url: transaction.redirect_url, isSandbox: !isProduction });'
);
fs.writeFileSync('server.ts', serverCode);

// Patch api/midtrans/token.js
let apiCode = fs.readFileSync('api/midtrans/token.js', 'utf8');
apiCode = apiCode.replace(
  'res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url });',
  'const isSandbox = serverKey.includes("SB-");\n    res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url, isSandbox });'
);
fs.writeFileSync('api/midtrans/token.js', apiCode);

