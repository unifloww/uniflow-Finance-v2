const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

code = code.replace(
  "t.date.split('T')[0]",
  "(t.date ? String(t.date).split('T')[0] : 'Tanggal Tidak Diketahui')"
);

code = code.replace(
  "g.targetDate.split('T')[0]",
  "(g.targetDate ? String(g.targetDate).split('T')[0] : 'Tanggal Tidak Diketahui')"
);

fs.writeFileSync('src/components/AIAssistant.tsx', code);
console.log("Patched splits");
