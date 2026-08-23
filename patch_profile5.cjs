const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  'await updateProfile({ plan: selectedPlan.planId });',
  'await updateProfile({ plan: "pro", planId: selectedPlan.planId, planName: selectedPlan.planName });'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
