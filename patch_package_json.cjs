const fs = require('fs');
let code = fs.readFileSync('package.json', 'utf8');
const pkg = JSON.parse(code);

pkg.scripts.dev = "vite";
pkg.scripts.build = "vite build";
pkg.scripts.start = "npx serve dist -l 3000";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
