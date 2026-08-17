const fs = require('fs');

let layout = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

layout = layout.replace(
  'const handleUpgrade = () => {',
  `const handleUpgrade = () => {
    navigate('/dashboard/profile#pricing');
    setTimeout(() => {
      const element = document.getElementById('pricing');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return;`
);

fs.writeFileSync('src/components/UserLayout.tsx', layout);
