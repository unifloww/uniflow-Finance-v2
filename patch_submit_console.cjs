const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  'const submitManualPayment = async () => {',
  'const submitManualPayment = async () => {\n    console.log("Submitting manual payment...", { proofImage: !!proofImage, selectedPlan, currentUser: !!currentUser });'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
