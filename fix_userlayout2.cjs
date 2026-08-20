const fs = require('fs');
let code = fs.readFileSync('src/components/UserLayout.tsx', 'utf8');

// Fix broken templates
code = code.replace(/lg:\$\{themeClasses\.bg\}\/10 lg:text-\[\#059669\] lg:dark:text-emerald-400 border border-emerald-500\/30 lg:border-\[\#059669\]\/20/g, "lg:bg-emerald-500/10 lg:text-emerald-600 lg:dark:text-emerald-400 border border-emerald-500/30 lg:border-emerald-500/20");
code = code.replace(/lg:\$\{themeClasses\.border\} lg:bg-gradient-to-b lg:from-\[\#059669\] lg:to-\[\#046a4e\]/g, "lg:border-emerald-600 lg:bg-gradient-to-b lg:from-[#059669] lg:to-[#046a4e]");

// Fix navText variables
code = code.replace(/\$\{isActive \? themeClasses.activeNav : ''\}/g, "${isActive ? themeClasses.activeNav : ''}");

// Insert Workspace Switcher in the sidebar profile section
const workspaceSwitcher = `
          <div className={\`border-t \${themeClasses.border} p-4 mt-auto\`}>
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

fs.writeFileSync('src/components/UserLayout.tsx', code);
console.log("Fixed UserLayout and added workspace switcher");
