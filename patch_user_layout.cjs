const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

const targetContent = `
            {!isSidebarCollapsed && trialRemaining && (
`;

const replacementContent = `
            {!isSidebarCollapsed && (
              <button
                onClick={() => setActiveWorkspace(activeWorkspace === 'business' ? 'personal' : 'business')}
                className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl mb-4 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={\`p-1.5 rounded-lg \${activeWorkspace === 'business' ? 'bg-cyan-500' : 'bg-emerald-500'}\`}>
                    {activeWorkspace === 'business' ? <Briefcase className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-white/70">Mode Workspace</span>
                    <span className="text-xs font-bold text-white">{activeWorkspace === 'business' ? 'Bisnis' : 'Personal'}</span>
                  </div>
                </div>
                <ArrowRightLeft className="h-3 w-3 text-white/50" />
              </button>
            )}
            
            {isSidebarCollapsed && (
              <button
                onClick={() => setActiveWorkspace(activeWorkspace === 'business' ? 'personal' : 'business')}
                title="Ganti Workspace"
                className="w-full flex justify-center mb-4 text-white/70 hover:text-white"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </button>
            )}

            {!isSidebarCollapsed && trialRemaining && (
`;

code = code.replace(targetContent, replacementContent);
fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Patched UserLayout.tsx");
