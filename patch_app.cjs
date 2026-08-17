const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'import { Login } from "./pages/Login";',
  'import { Login } from "./pages/Login";\nimport { PhoneLogin } from "./pages/PhoneLogin";'
);

app = app.replace(
  '<Route path="/login" element={<Login />} />',
  '<Route path="/login" element={<Login />} />\n              <Route path="/phone-login" element={<PhoneLogin />} />'
);

fs.writeFileSync('src/App.tsx', app);
