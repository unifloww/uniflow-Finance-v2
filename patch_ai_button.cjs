const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

code = code.replace(
  "import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';",
  "import { MessageSquare, X, Send, Bot, User, Sparkles, Headset } from 'lucide-react';"
);

// We need to fix the button rendering.
const oldButton = `<motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 lg:bottom-8 lg:right-28 h-16 w-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center z-50 transition-all border-2 border-white dark:border-slate-800 cursor-pointer group hover:scale-110 active:scale-95"
          >
            <div className="relative flex items-center justify-center w-full h-full"><Bot className="h-7 w-7 relative z-10 group-hover:-translate-y-0.5 transition-transform" /><Sparkles className="h-4 w-4 absolute top-2 right-2 text-pink-200 animate-pulse" /><div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div></div>
          </motion.button>`;

const newButton = `<motion.button
            drag
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 lg:bottom-8 lg:right-28 h-16 w-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center z-50 transition-shadow border-2 border-white dark:border-slate-800 cursor-pointer group"
            style={{ touchAction: 'none' }}
          >
            <div className="relative flex items-center justify-center w-full h-full"><Headset className="h-7 w-7 relative z-10 group-hover:-translate-y-0.5 transition-transform" /><Sparkles className="h-4 w-4 absolute top-2 right-2 text-pink-200 animate-pulse" /><div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div></div>
          </motion.button>`;

if (code.includes('onClick={() => setIsOpen(true)}')) {
  code = code.replace(oldButton, newButton);
  fs.writeFileSync('src/components/AIAssistant.tsx', code);
  console.log("Patched AIAssistant.tsx button");
}
