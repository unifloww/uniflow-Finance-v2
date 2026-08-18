const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// The backend throws an error if MIDTRANS_SERVER_KEY is missing, which is expected since it's not provided yet.
// However, the catch block just alerts "Terjadi kesalahan sistem". We should give a clearer message that the API key is missing.

code = code.replace(
  'alert("Terjadi kesalahan sistem, silakan coba lagi nanti.");',
  'alert("Terjadi kesalahan sistem: " + (error instanceof Error ? error.message : "Gagal memproses pembayaran. Periksa kunci Midtrans di pengaturan lingkungan (Settings)."));'
);

// We should also check what `data` contains if res.ok is false
code = code.replace(
  `const data = await res.json();
      
      if (data.token) {`,
  `const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.error || "Gagal menghubungi server pembayaran");
      }

      if (data.token) {`
);

fs.writeFileSync('src/pages/Profile.tsx', code);
