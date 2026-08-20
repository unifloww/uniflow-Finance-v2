const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes('InvoiceGenerator')) {
  code = code.replace(
    'import { Profile } from "./pages/Profile";',
    'import { Profile } from "./pages/Profile";\nimport { InvoiceGenerator } from "./pages/InvoiceGenerator";'
  );
  
  // Add route
  code = code.replace(
    '<Route path="/dashboard/profile" element={<Profile />} />',
    '<Route path="/dashboard/invoice" element={<InvoiceGenerator />} />\n                  <Route path="/dashboard/profile" element={<Profile />} />'
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx");
} else {
  console.log("Already patched");
}
