const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  'const { userProfile, updateProfile } = useAuth();',
  'const { userProfile, updateProfile, currentUser } = useAuth();'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
