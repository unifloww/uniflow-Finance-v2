const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

// 1. Add new state variables
code = code.replace(
  'const [customDate, setCustomDate] = useState("");',
  `const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });\n  const [showDatePickerModal, setShowDatePickerModal] = useState(false);`
);

// 2. Remove dateInputRef if it exists
code = code.replace(
  'const dateInputRef = React.useRef<HTMLInputElement>(null);',
  ''
);

// 3. Update the filter logic
const oldFilterLogic = `      if (filterPeriod === "custom" && customDate) {
        return txDate.toISOString().split("T")[0] === customDate;
      }`;
const newFilterLogic = `      if (filterPeriod === "custom" && customDateRange.start && customDateRange.end) {
        const txDateStr = txDate.toISOString().split("T")[0];
        return txDateStr >= customDateRange.start && txDateStr <= customDateRange.end;
      }`;
code = code.replace(oldFilterLogic, newFilterLogic);

// 4. Update the labels logic
const oldLabelLogic = `custom: customDate && filterPeriod === "custom" ? new Date(customDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) + " 📅" : "Pilih Tanggal 📅"`;
const newLabelLogic = `custom: (customDateRange.start && customDateRange.end && filterPeriod === "custom") ? \`\${new Date(customDateRange.start).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} - \${new Date(customDateRange.end).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}\` : "Pilih Tanggal 📅"`;
code = code.replace(oldLabelLogic, newLabelLogic);

// 5. Update the button
const oldButtonBlock = `{period === "custom" ? (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setFilterPeriod("custom");
                      if (dateInputRef.current) {
                        try {
                          if (typeof dateInputRef.current.showPicker === "function") {
                            dateInputRef.current.showPicker();
                          } else {
                            dateInputRef.current.focus();
                          }
                        } catch (e) {
                          console.warn("Failed to show picker:", e);
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
                ) :`;
                
const newButtonBlock = `{period === "custom" ? (
                  <Button 
                    variant="outline"
                    onClick={() => setShowDatePickerModal(true)}
                    className={\`relative rounded-full px-5 h-10 w-full transition-all \${
                      isSelected 
                        ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                    }\`}
                    size="sm"
                  >
                    {labels[period]}
                  </Button>
                ) :`;
code = code.replace(oldButtonBlock, newButtonBlock);

// 6. Add Modal
const modalCode = `
      {showDatePickerModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Pilih Rentang Tanggal</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dari Tanggal</label>
                <Input 
                  type="date" 
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sampai Tanggal</label>
                <Input 
                  type="date" 
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="w-full rounded-xl"
                onClick={() => setShowDatePickerModal(false)}
              >
                Batal
              </Button>
              <Button 
                className="w-full rounded-xl bg-[#059669] hover:bg-teal-600 text-white border-0"
                onClick={() => {
                  if (customDateRange.start && customDateRange.end) {
                    setFilterPeriod("custom");
                    setShowDatePickerModal(false);
                  } else {
                    alert("Mohon pilih tanggal mulai dan selesai");
                  }
                }}
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}`;

code = code.replace(/    <\/div>\n  \);\n}\n?$/, modalCode);

fs.writeFileSync('src/pages/Transactions.tsx', code);
console.log("Patched successfully.");
