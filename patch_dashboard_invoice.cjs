const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const invoiceCard = `
      {activeWorkspace === 'business' && (
        <motion.div variants={itemVariants} className="mb-6">
          <Link to="/dashboard/invoice" className="flex items-center justify-between bg-cyan-600 hover:bg-cyan-700 text-white rounded-[2rem] p-5 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Buat Invoice Baru</h3>
                <p className="text-cyan-100 text-xs font-medium">Buat dan unduh tagihan PDF untuk klien</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </motion.div>
      )}
`;

// Insert into Desktop view (before {/* 4 Cards Grid */})
code = code.replace(
  "{/* 4 Cards Grid */}",
  invoiceCard + "\n      {/* 4 Cards Grid */}"
);

// Insert into Mobile view (after Pocket Action Buttons Row, but before the 3-Column Stats Row? No, before "3-Column Stats Row" is a good place).
code = code.replace(
  "{/* 3-Column Stats Row (Sales Today / Items Sold / Low Stock equivalent) */}",
  invoiceCard + "\n      {/* 3-Column Stats Row (Sales Today / Items Sold / Low Stock equivalent) */}"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
