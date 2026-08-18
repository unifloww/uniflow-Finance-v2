const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  '{/* Upgrade Section */}\n      <motion.div',
  '{/* Upgrade Section */}\n      <motion.div id="pricing"'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
