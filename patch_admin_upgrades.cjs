const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUpgrades.tsx', 'utf8');

code = code.replace(/\\`Apakah Anda yakin/g, '\`Apakah Anda yakin');
code = code.replace(/pembayaran ini\?\\`/g, 'pembayaran ini?\`');

code = code.replace(/alert\(\\`Pembayaran berhasil/g, 'alert(\`Pembayaran berhasil');
code = code.replace(/ditolak\\'\\.\\`\)/g, "ditolak\'.\`)");

fs.writeFileSync('src/pages/AdminUpgrades.tsx', code);
