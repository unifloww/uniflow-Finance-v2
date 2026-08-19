const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace the return statement to include both layouts
const returnIndex = code.indexOf('  return (\n    <motion.div \n      variants={containerVariants}\n      initial="hidden"\n      animate="show"\n      className="space-y-6 max-w-7xl mx-auto"\n    >');

if (returnIndex !== -1) {
  let desktopCode = `
    {/* DESKTOP LAYOUT */}
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="hidden lg:block max-w-7xl mx-auto relative z-10">
      {/* Green Header Background matching the image */}
      <div className="absolute -top-10 -left-12 -right-12 h-[340px] bg-[#059669] -z-10 rounded-b-[3rem] shadow-sm pointer-events-none" />

      {/* Greeting Section */}
      <div className="flex items-start justify-between text-white mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold">{greeting}, {userProfile?.name?.split(' ')[0] || firstName} 👋</h1>
          <p className="text-sm mt-2 opacity-90">"{randomQuote}"</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-4 bg-white/20 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTimeStr} — Jangan lupa catat keuanganmu hari ini!</span>
          </div>
        </div>
        <button 
          onClick={toggleHideBalances} 
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-bold border border-white/30 backdrop-blur-sm transition-all"
        >
          {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {hideBalances ? "Tampilkan" : "Sembunyikan"}
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white">
          <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Total Dana</div>
          <div className="flex justify-between items-start">
             <h2 className="text-3xl font-black text-slate-900">{hideBalances ? "••••••" : formatCurrency(totalBalance)}</h2>
             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-indigo-500" />
             </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-4">Dari {accounts.length} akun aktif</p>
        </Card>

        <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white">
          <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Pemasukan</div>
          <div className="flex justify-between items-start">
             <h2 className="text-3xl font-black text-[#059669]">{hideBalances ? "••••••" : formatCurrency(income)}</h2>
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-[#059669]" />
             </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-4">Total akumulasi</p>
        </Card>

        <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white">
          <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Pengeluaran</div>
          <div className="flex justify-between items-start">
             <h2 className="text-3xl font-black text-rose-600">{hideBalances ? "••••••" : formatCurrency(expense)}</h2>
             <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-rose-600" />
             </div>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-4">Total akumulasi</p>
        </Card>

        <Card className="rounded-[1.5rem] border-0 shadow-lg bg-[#047857] text-white p-5">
          <div className="text-[11px] font-bold text-emerald-200 mb-2 uppercase tracking-wider">Cashflow</div>
          <div className="flex justify-between items-start">
             <h2 className="text-3xl font-black">{hideBalances ? "••••••" : formatCurrency(income - expense)}</h2>
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-white" />
             </div>
          </div>
          <p className="text-[11px] font-bold text-emerald-200 mt-4">Selisih masuk & keluar</p>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {/* Transaksi Terakhir */}
          <Card className="rounded-[1.5rem] border-0 shadow-lg shadow-slate-200/50 bg-white dark:bg-slate-900 h-[calc(100%-2rem)]">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-base font-black text-slate-900 dark:text-white">Transaksi Terakhir</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center space-x-3.5">
                        <div className={\`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm \${tx.type === "income" ? "bg-emerald-100 text-emerald-600" : tx.type === "expense" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"}\`}>
                          {tx.type === "income" ? <TrendingUp className="h-5 w-5" /> : tx.type === "expense" ? <TrendingDown className="h-5 w-5" /> : <ArrowRightLeft className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{tx.category}</span>
                            <span className="text-[11px] font-medium text-slate-400">
                              {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={\`text-sm sm:text-base font-black \${tx.type === "income" ? "text-emerald-600" : tx.type === "expense" ? "text-rose-600" : "text-slate-900"}\`}>
                        {tx.type === "expense" ? "-" : tx.type === "income" ? "+" : ""}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <PiggyBank className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Belum ada transaksi bulan ini</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 space-y-6">
          <BudgetSection />
          
          <Card className="rounded-[1.5rem] border-0 shadow-lg shadow-slate-200/50 bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-black text-slate-900 dark:text-white">Akun & Dompet</CardTitle>
              <Link to="/dashboard/accounts" className="text-2xl text-emerald-200 hover:text-[#059669] transition-colors leading-none pb-1">+</Link>
            </CardHeader>
            <CardContent className="pt-4 pb-5">
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: acc.color || '#059669' }}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{acc.type}</p>
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {hideBalances ? maskedValue : formatCurrency(acc.balance)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  `;

  const newReturnStart = `
  return (
    <>
      {/* MOBILE LAYOUT */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-7xl mx-auto lg:hidden"
      >
  `;
  
  code = code.replace(
    '  return (\n    <motion.div \n      variants={containerVariants}\n      initial="hidden"\n      animate="show"\n      className="space-y-6 max-w-7xl mx-auto"\n    >',
    newReturnStart
  );

  // Close the <> wrapper at the very end
  const lastDivIndex = code.lastIndexOf('</motion.div>\n  );');
  if (lastDivIndex !== -1) {
    code = code.substring(0, lastDivIndex + 13) + '\n' + desktopCode + '\n    </>\n  );';
  }

  // Need to add Clock import if missing
  if (!code.includes('Clock,')) {
    code = code.replace('Lock,', 'Lock, Clock,');
    if (!code.includes('Clock,')) {
      code = code.replace('import {', 'import { Clock,');
    }
  }

  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log('Dashboard updated with split layouts');
} else {
  console.log('Failed to find return statement');
}

