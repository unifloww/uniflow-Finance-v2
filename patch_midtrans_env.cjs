const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `snapClient = new midtransClient.Snap({
        isProduction: false,
        serverKey: serverKey,`,
  `const isProd = !serverKey.startsWith('SB-');
    
    snapClient = new midtransClient.Snap({
        isProduction: isProd,
        serverKey: serverKey,`
);

fs.writeFileSync('server.ts', code);
