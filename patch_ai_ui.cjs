const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

const targetHeader = `              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>`;

const replacementHeader = `              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={\`h-8 w-8 rounded-full flex items-center justify-center transition-colors \${showSettings ? 'bg-white text-indigo-500' : 'bg-white/10 hover:bg-white/20 text-white'}\`}
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>`;

const targetBody = `            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">`;

const replacementBody = `            {/* Settings Area */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-indigo-50 dark:bg-slate-800 border-b border-indigo-100 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <Key className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p>
                        Gunakan API Key Gemini Anda sendiri untuk sesi tanya jawab tanpa batas. Kunci ini hanya disimpan di perangkat Anda.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Paste API Key Gemini Anda..."
                        value={apiKey}
                        onChange={(e) => saveApiKey(e.target.value)}
                        className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">`;

if (code.includes('onClick={() => setIsOpen(false)}')) {
  code = code.replace(targetHeader, replacementHeader);
  code = code.replace(targetBody, replacementBody);
  fs.writeFileSync('src/components/AIAssistant.tsx', code);
  console.log("Patched AIAssistant.tsx UI");
}
