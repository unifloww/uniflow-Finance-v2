const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  'if (!data.token) {\n        throw new Error("Gagal mengambil token pembayaran");\n      }',
  'if (!data.token) {\n        throw new Error(data.error || "Gagal mengambil token pembayaran");\n      }'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
