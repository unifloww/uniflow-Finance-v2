const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

const oldBlock = `                {period === "custom" ? (
                  <label 
                    className={\`relative flex items-center justify-center rounded-full px-5 h-10 w-full transition-all cursor-pointer text-sm \${
                      isSelected 
                        ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                    }\`}
                  >
                    <span>{labels[period]}</span>
                    <input 
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setCustomDate(e.target.value);
                          setFilterPeriod("custom");
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      style={{ WebkitAppearance: 'none', position: 'absolute' }}
                    />
                  </label>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setFilterPeriod(period as any)}
                    className={\`rounded-full px-5 h-10 w-full transition-all \${
                      isSelected 
                        ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                    }\`}
                    size="sm"
                  >
                    {labels[period]}
                  </Button>
                )}`;

const newBlock = `                {period === "custom" ? (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setFilterPeriod("custom");
                      if (dateInputRef.current) {
                        if (typeof dateInputRef.current.showPicker === "function") {
                          dateInputRef.current.showPicker();
                        } else {
                          dateInputRef.current.focus();
                        }
                      }
                    }}
                    className={\`relative rounded-full px-5 h-10 w-full transition-all \${
                      isSelected 
                        ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                    }\`}
                    size="sm"
                  >
                    {labels[period]}
                    <input 
                      ref={dateInputRef}
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setCustomDate(e.target.value);
                          setFilterPeriod("custom");
                        }
                      }}
                      className="absolute bottom-0 left-1/2 w-0 h-0 opacity-0 pointer-events-none"
                      style={{ position: 'absolute', zIndex: -1 }}
                    />
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setFilterPeriod(period as any)}
                    className={\`rounded-full px-5 h-10 w-full transition-all \${
                      isSelected 
                        ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                    }\`}
                    size="sm"
                  >
                    {labels[period]}
                  </Button>
                )}`;

if (code.includes('span>{labels[period]}</span>')) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/pages/Transactions.tsx', code);
  console.log("Patched successfully.");
} else {
  console.log("Could not find the block to replace.");
}
