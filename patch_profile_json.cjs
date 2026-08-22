const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  'const data = await response.json();',
  `let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error("Non-JSON response from server:", text.substring(0, 200));
        throw new Error("Server tidak mengembalikan format data yang valid. (Cek log console)");
      }`
);

fs.writeFileSync('src/pages/Profile.tsx', code);
