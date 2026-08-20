const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add activeWorkspace to useData
code = code.replace(
  "const { accounts, transactions, hideBalances, toggleHideBalances } = useData();",
  "const { accounts, transactions, hideBalances, toggleHideBalances, activeWorkspace } = useData();"
);

// Add displayName
code = code.replace(
  'const firstName = userProfile?.name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "Teman";',
  'const firstName = userProfile?.name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "Teman";\n  const displayName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis Anda") : (userProfile?.name || firstName);\n  const displayFirstName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis") : firstName;'
);

// Replace userProfile?.name in UI
code = code.replace(
  "{userProfile?.name || firstName}",
  "{displayName}"
);

// Replace greeting line
code = code.replace(
  "<h1 className=\"text-3xl font-bold\">{greeting}, {userProfile?.name?.split(' ')[0] || firstName} 👋</h1>",
  "<h1 className=\"text-3xl font-bold\">{greeting}, {displayFirstName} 👋</h1>"
);

// Check if we also need to change theme colors in Dashboard?
// In UserLayout, the gradient and everything is handled by `themeClasses.bg` etc. But Dashboard might have hardcoded greens in cards or gradients.
// Wait, the Mobile Header is in UserLayout. Dashboard has `const isDashboard = true;` in UserLayout.
// Let's check Dashboard's UI for hardcoded greens that might need to become cyan/blue.
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Dashboard greeting");
