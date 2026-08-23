const fs = require('fs');
let code = fs.readFileSync('src/components/AIAssistant.tsx', 'utf8');

// Replace the glowing orb styling and position
code = code.replace(
  /className="fixed bottom-24 right-4 lg:bottom-8 lg:right-28 h-16 w-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white rounded-full shadow-\[0_0_30px_rgba\(168,85,247,0\.5\)\] flex items-center justify-center z-50 transition-shadow border-2 border-white dark:border-slate-800 cursor-pointer group"/g,
  'className="fixed bottom-24 right-4 lg:bottom-28 lg:right-8 h-12 w-12 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-shadow border-2 border-white dark:border-slate-800 cursor-pointer group"'
);

// Scale down the avatar inside it
code = code.replace(
  /<FiaAvatar className="h-8 w-8 relative z-10 group-hover:-translate-y-0\.5 transition-transform" \/>/g,
  '<FiaAvatar className="h-6 w-6 relative z-10 group-hover:-translate-y-0.5 transition-transform" />'
);

code = code.replace(
  /className="fixed bottom-0 right-0 left-0 lg:bottom-24 lg:right-8 lg:left-auto lg:w-96 h-\[80vh\] lg:h-\[600px\] z-\[60\] /g,
  'className="fixed bottom-0 right-0 left-0 lg:bottom-28 lg:right-24 lg:left-auto lg:w-96 h-[80vh] lg:h-[600px] z-[60] '
);

fs.writeFileSync('src/components/AIAssistant.tsx', code);
console.log("Patched AIAssistant.tsx");
