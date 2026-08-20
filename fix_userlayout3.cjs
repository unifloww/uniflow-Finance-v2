const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

if (!code.includes('Briefcase')) {
  code = code.replace("} from 'lucide-react';", "  Briefcase,\n} from 'lucide-react';");
}

const workspaceSwitcher = `
          <div className={\`border-t \${themeClasses.border} pt-4\`}>
            {!isSidebarCollapsed && (
              <div className="mb-4">
                <p className="text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Ruang Kerja</p>
                <div className="flex bg-black/20 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setActiveWorkspace('personal')}
                    className={\`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all \${activeWorkspace === 'personal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/70 hover:text-white'}\`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Personal
                  </button>
                  <button
                    onClick={() => setActiveWorkspace('business')}
                    className={\`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all \${activeWorkspace === 'business' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/70 hover:text-white'}\`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Bisnis
                  </button>
                </div>
              </div>
            )}
            
            <button`;

code = code.replace(/<div className=\{\`border-t \$\{themeClasses\.border\} pt-4\`\}>\s*<button/g, workspaceSwitcher);

// Add mobile switcher to mobile header
const mobileHeader = `
        <header className={\`fixed top-0 inset-x-0 z-50 flex h-20 items-center justify-between border-b border-emerald-600/40 bg-gradient-to-r \${themeClasses.gradient} px-4 py-2 lg:hidden shadow-md\`}>
          <div className="flex items-center">
            <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20White.png?alt=media&token=ed8e2972-f297-4861-9920-c8145506122d" alt="UniFlow" className="h-16 w-auto max-w-[200px] object-contain drop-shadow-md scale-125 origin-left ml-2" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveWorkspace(activeWorkspace === 'personal' ? 'business' : 'personal')}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-black/20 hover:bg-black/30 transition-colors text-white"
            >
              {activeWorkspace === 'personal' ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
            </button>
`;

code = code.replace(
  /<header className=\{\`fixed top-0 inset-x-0 z-50 flex h-20 items-center justify-between border-b border-emerald-600\/40 bg-gradient-to-r \$\{themeClasses\.gradient\} px-4 py-2 lg:hidden shadow-md\`\}>\s*<div className="flex items-center">\s*<img src="[^"]*" alt="UniFlow" className="[^"]*" \/>\s*<\/div>\s*<div className="flex items-center space-x-2">/g,
  mobileHeader
);

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Fixed UserLayout 3");
