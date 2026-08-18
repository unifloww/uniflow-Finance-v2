const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// replace handleUpgrade implementation
code = code.replace(
  /const handleUpgrade = async \(\) => \{[\s\S]*?\}\s*\} catch \(\w+\) \{[\s\S]*?\}\s*\};/,
  `const handleUpgrade = () => {
    navigate('/dashboard/profile#pricing');
  };`
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
