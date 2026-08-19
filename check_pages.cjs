const fs = require('fs');

const pages = ['Accounts.tsx', 'Transactions.tsx', 'Analytics.tsx', 'Goals.tsx', 'Profile.tsx'];
pages.forEach(p => {
  const content = fs.readFileSync('src/pages/' + p, 'utf8');
  console.log(p, 'has text-white h1:', content.includes('<h1 className="text-2xl font-bold tracking-tight text-white">') || content.includes('<h1 className="text-3xl font-bold tracking-tight text-white">'));
});
