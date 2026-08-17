const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

code = code.replace(
  '<div className="font-bold text-slate-900 dark:text-white text-base">{user.name}</div>\n                        <div className="text-xs text-slate-500">{user.email}</div>',
  `<div className="font-bold text-slate-900 dark:text-white text-base">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                        {user.phone && <div className="text-xs text-slate-400 mt-0.5">📞 {user.phone}</div>}`
);

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
