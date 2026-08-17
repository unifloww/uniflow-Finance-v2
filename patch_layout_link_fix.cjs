const fs = require('fs');

let layout = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

layout = layout.replace(
  `const handleUpgrade = () => {
    navigate('/dashboard/profile#pricing');
    setTimeout(() => {
      const element = document.getElementById('pricing');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return;`,
  `const handleUpgrade = () => {
    navigate('/dashboard/profile#pricing');
    setTimeout(() => {
      const element = document.getElementById('pricing');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };`
);

fs.writeFileSync('src/components/UserLayout.tsx', layout);

let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const scrollEffect = `
  useEffect(() => {
    if (window.location.hash === '#pricing') {
      setTimeout(() => {
        const element = document.getElementById('pricing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [window.location.hash]);
`;

profile = profile.replace('const [isProcessing, setIsProcessing] = useState(false);', 'const [isProcessing, setIsProcessing] = useState(false);\n' + scrollEffect);

// Also let's fix contrast on AdminDashboard tooltips
let admin = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
admin = admin.replace(/bg-slate-800 text-white/g, 'bg-slate-800 dark:bg-slate-700 text-white');
fs.writeFileSync('src/pages/AdminDashboard.tsx', admin);

fs.writeFileSync('src/pages/Profile.tsx', profile);
