const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  /const firstName = userProfile\?\.name\?\.split\(" "\)\[0\] \|\| currentUser\?\.email\?\.split\("@"\)\[0\] \|\| "Teman";\n  const displayName = activeWorkspace === "business" \? \(userProfile\?\.businessName \|\| "Bisnis Anda"\) : \(userProfile\?\.name \|\| firstName\);\n  const displayFirstName = activeWorkspace === "business" \? \(userProfile\?\.businessName \|\| "Bisnis"\) : firstName;\n  const userInitial = userProfile\?\.name\?\.charAt\(0\)\?\.toUpperCase\(\) \|\| firstName\.charAt\(0\)\.toUpperCase\(\) \|\| "U";\n  const \{ accounts, transactions, hideBalances, toggleHideBalances, activeWorkspace \} = useData\(\);/g,
  `const { accounts, transactions, hideBalances, toggleHideBalances, activeWorkspace } = useData();\n  const firstName = userProfile?.name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "Teman";\n  const displayName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis Anda") : (userProfile?.name || firstName);\n  const displayFirstName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis") : firstName;\n  const userInitial = userProfile?.name?.charAt(0)?.toUpperCase() || firstName.charAt(0).toUpperCase() || "U";`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
