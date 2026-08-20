const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

const oldBlock = `            return (
              <div key={period} className={\`relative shrink-0 \${displayClass}\`}>
                {period === "custom" && (
                  <input 
                    type="date"
                    value={customDate}
                    onClick={() => setFilterPeriod("custom")}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCustomDate(e.target.value);
                        setFilterPeriod("custom");
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ WebkitAppearance: 'none' }}
                  />
                )}
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
              </div>
            );`;

const newBlock = `            return (
              <div key={period} className={\`relative shrink-0 \${displayClass}\`}>
                {period === "custom" ? (
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
                )}
              </div>
            );`;

if (code.includes('className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"')) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/pages/Transactions.tsx', code);
  console.log("Patched successfully.");
} else {
  console.log("Could not find the block to replace.");
}
