const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The activeWorkspace error
code = code.replace(
  /const firstName = userProfile\?\.name\?\.split\(" "\)\[0\] \|\| currentUser\?\.email\?\.split\("@"\)\[0\] \|\| "Teman";\n  const displayName = activeWorkspace === "business" \? \(userProfile\?\.businessName \|\| "Bisnis Anda"\) : \(userProfile\?\.name \|\| firstName\);\n  const displayFirstName = activeWorkspace === "business" \? \(userProfile\?\.businessName \|\| "Bisnis"\) : firstName;\n  const \{ accounts, transactions, hideBalances, toggleHideBalances, activeWorkspace \} = useData\(\);/g,
  `const { accounts, transactions, hideBalances, toggleHideBalances, activeWorkspace } = useData();
  const firstName = userProfile?.name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "Teman";
  const displayName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis Anda") : (userProfile?.name || firstName);
  const displayFirstName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis") : firstName;`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
