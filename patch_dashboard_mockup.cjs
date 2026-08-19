const fs = require('fs');

const dashboardCode = `import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRightLeft,
  CreditCard,
  PiggyBank,
  Eye,
  EyeOff,
  BarChart3,
  History,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Coffee,
  Utensils,
  Car,
  Home,
  Briefcase,
  Zap,
  Tag
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { motion } from "motion/react";
import { BudgetSection } from "../components/BudgetSection";

const financialQuotes = [
  "Uang adalah hamba yang baik, namun tuan yang buruk.",
  "Jangan menabung apa yang tersisa setelah dihabiskan, tapi habiskan apa yang tersisa setelah ditabung.",
  "Kekayaan bukanlah tentang memiliki banyak uang, melainkan tentang memiliki banyak pilihan.",
  "Setiap Rupiah yang Anda hemat adalah benih untuk masa depan Anda.",
  "Investasi terbaik yang bisa Anda lakukan adalah pada diri Anda sendiri.",
  "Perdamaian finansial bukan tentang membeli barang, melainkan belajar hidup dengan kurang dari yang Anda hasilkan.",
  "Kontrol pengeluaran Anda, sebelum pengeluaran Anda mengontrol Anda.",
  "Bukan seberapa banyak uang yang Anda hasilkan, tapi seberapa banyak yang Anda simpan.",
  "Ketenangan pikiran finansial adalah bentuk tertinggi dari kekayaan.",
];

// Helper to get category icon
const getCategoryIcon = (categoryName: string) => {
  const cat = categoryName.toLowerCase();
  if (cat.includes("kopi") || cat.includes("coffee") || cat.includes("cafe")) return <Coffee className="w-5 h-5 text-amber-600" />;
  if (cat.includes("makan") || cat.includes("food") || cat.includes("restoran") || cat.includes("kuliner")) return <Utensils className="w-5 h-5 text-orange-500" />;
  if (cat.includes("belanja") || cat.includes("shopping") || cat.includes("mall")) return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
  if (cat.includes("transport") || cat.includes("bensin") || cat.includes("ojek") || cat.includes("kendaraan")) return <Car className="w-5 h-5 text-blue-500" />;
  if (cat.includes("gaji") || cat.includes("salary") || cat.includes("bisnis") || cat.includes("proyek")) return <Briefcase className="w-5 h-5 text-teal-600" />;
  if (cat.includes("tagihan") || cat.includes("listrik") || cat.includes("air") || cat.includes("internet")) return <Zap className="w-5 h-5 text-yellow-500" />;
  if (cat.includes("rumah") || cat.includes("sewa") || cat.includes("kost")) return <Home className="w-5 h-5 text-indigo-500" />;
  return <Tag className="w-5 h-5 text-emerald-600" />;
};

export function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const [greeting, setGreeting] = useState("Halo");
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [currentDateStr, setCurrentDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      
      let newGreeting = "Selamat Malam";
      if (hours >= 5 && hours < 11) newGreeting = "Selamat Pagi";
      else if (hours >= 11 && hours < 15) newGreeting = "Selamat Siang";
      else if (hours >= 15 && hours < 18) newGreeting = "Selamat Sore";
      
      setGreeting(newGreeting);
      setCurrentTimeStr(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
      setCurrentDateStr(now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const randomQuote = useMemo(() => {
    return financialQuotes[Math.floor(Math.random() * financialQuotes.length)];
  }, []);

  const firstName = userProfile?.name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "Teman";
  const userInitial = userProfile?.name?.charAt(0)?.toUpperCase() || firstName.charAt(0).toUpperCase() || "U";
  const { accounts, transactions, hideBalances, toggleHideBalances } = useData();

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  const { income, expense } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      if (tx.type === "expense") expense += tx.amount;
    });
    return { income, expense };
  }, [transactions]);

  // Today's summary calculation
  const { todayIncome, todayExpense, todayDelta, todayCount } = useMemo(() => {
    const today = new Date().toDateString();
    let todayIncome = 0;
    let todayExpense = 0;
    let todayCount = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date).toDateString();
      if (txDate === today) {
        todayCount++;
        if (tx.type === "income") todayIncome += tx.amount;
        if (tx.type === "expense") todayExpense += tx.amount;
      }
    });

    return {
      todayIncome,
      todayExpense,
      todayDelta: todayIncome - todayExpense,
      todayCount
    };
  }, [transactions]);

  // Top / Popular Categories breakdown
  const topCategories = useMemo(() => {
    const catMap: { [key: string]: { name: string; amount: number; count: number; type: 'income' | 'expense' } } = {};
    
    transactions.forEach((tx) => {
      const key = tx.category || "Lainnya";
      if (!catMap[key]) {
        catMap[key] = { name: key, amount: 0, count: 0, type: tx.type };
      }
      catMap[key].amount += tx.amount;
      catMap[key].count += 1;
    });

    const list = Object.values(catMap).sort((a, b) => b.amount - a.amount);
    const maxAmount = list.length > 0 ? Math.max(...list.map((c) => c.amount), 1) : 1;
    return { list: list.slice(0, 4), maxAmount };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const maskedValue = "Rp •••••••";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Top Header matching mock-up */}
      <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 capitalize tracking-wide">
            {currentDateStr || "Hari ini"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            Dashboard
          </h1>
        </div>
        
        <Link 
          to="/dashboard/profile"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#059669] to-teal-400 text-white font-black text-base shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all border-2 border-white dark:border-slate-800"
        >
          {userInitial}
        </Link>
      </motion.div>

      {/* Main Pocket / Wallet Card - Signature Emerald Gradient */}
      <motion.div variants={itemVariants}>
        <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#10b981] via-[#059669] to-[#046a4e] p-1 text-white shadow-2xl shadow-emerald-900/30 overflow-hidden">
          {/* Subtle glossy shine layer */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

          {/* Top Tab / Card Header */}
          <div className="relative z-10 mx-3 mt-3 mb-2 flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md border border-white/20 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse shadow-sm shadow-emerald-300/80" />
              <span className="text-sm font-black tracking-tight text-white drop-shadow-sm truncate max-w-[160px] sm:max-w-none">
                {accounts[0]?.name || "UniFlow Wallet"}
              </span>
            </div>
            <span className="rounded-full bg-white/25 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm border border-white/30">
              {userProfile?.plan === 'pro' ? 'PRO' : accounts[0]?.type?.toUpperCase() || 'CASH'}
            </span>
          </div>

          {/* Stitched Pocket Body Effect */}
          <div className="relative pt-4 pb-6 px-5 sm:px-6 bg-gradient-to-b from-[#059669] to-[#046246] rounded-b-[2.3rem]">
            {/* Decorative stitched line */}
            <div className="absolute top-0 left-4 right-4 h-0 border-t-2 border-dashed border-emerald-300/50 pointer-events-none" />

            {/* Balance & Delta Trend */}
            <div className="mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">
                  TOTAL BALANCE
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                    {hideBalances ? maskedValue : formatCurrency(totalBalance)}
                  </h2>
                </div>
              </div>
              
              {/* Delta Trend Tag */}
              <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-emerald-100 backdrop-blur-md border border-white/20 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                <span>
                  {todayCount > 0 
                    ? (todayDelta >= 0 ? `+${formatCurrency(todayDelta)} hari ini` : `${formatCurrency(todayDelta)} hari ini`)
                    : `${accounts.length} akun aktif`}
                </span>
              </div>
            </div>

            {/* Pocket Action Buttons Row */}
            <div className="mt-6 flex items-center gap-2.5">
              <Link
                to="/dashboard/analytics"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md py-3 px-4 text-xs sm:text-sm font-black text-white shadow-inner border border-white/25 transition-all active:scale-95 hover:shadow-lg"
              >
                <BarChart3 className="w-4 h-4 text-emerald-100" />
                <span>Lihat Laporan</span>
              </Link>
              
              <Link
                to="/dashboard/transactions"
                title="Riwayat Transaksi"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white shadow-inner border border-white/25 transition-all active:scale-95 hover:shadow-lg"
              >
                <History className="w-4 h-4 text-emerald-100" />
              </Link>
              
              <button
                onClick={toggleHideBalances}
                title={hideBalances ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white shadow-inner border border-white/25 transition-all active:scale-95 hover:shadow-lg cursor-pointer"
              >
                {hideBalances ? <EyeOff className="w-4 h-4 text-emerald-100" /> : <Eye className="w-4 h-4 text-emerald-100" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3-Column Stats Row (Sales Today / Items Sold / Low Stock equivalent) */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 rounded-[2rem] bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/80">
          <div className="text-center border-r border-slate-100 dark:border-slate-800 pr-1 sm:pr-2">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {transactions.length}
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Total Transaksi
            </p>
          </div>
          
          <div className="text-center border-r border-slate-100 dark:border-slate-800 px-1 sm:px-2">
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-600 dark:text-emerald-400 truncate">
              {hideBalances ? "Rp •••" : formatCurrency(income).replace(",00", "")}
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Pemasukan
            </p>
          </div>
          
          <div className="text-center pl-1 sm:pr-2">
            <p className="text-sm sm:text-base lg:text-lg font-black text-rose-600 dark:text-rose-400 truncate">
              {hideBalances ? "Rp •••" : formatCurrency(expense).replace(",00", "")}
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Pengeluaran
            </p>
          </div>
        </div>
      </motion.div>

      {/* Popular Categories / Transaksi Terbanyak (Matching 'Popular Products' in mock-up) */}
      <motion.div variants={itemVariants}>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Kategori Populer
              </h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Aktivitas 7 hari terakhir
              </p>
            </div>
            <Link
              to="/dashboard/transactions"
              className="text-xs font-bold text-[#059669] hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-[2.2rem] bg-white dark:bg-slate-900 p-5 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/80 space-y-4">
            {topCategories.list.length > 0 ? (
              topCategories.list.map((cat, idx) => {
                const percent = Math.min(Math.round((cat.amount / topCategories.maxAmount) * 100), 100);
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Rank circular badge + icon */}
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                          <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-black shadow-sm">
                            {idx + 1}
                          </span>
                          {getCategoryIcon(cat.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {cat.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {hideBalances ? "Rp •••" : formatCurrency(cat.amount)}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          {cat.count} transaksi
                        </p>
                      </div>
                    </div>

                    {/* Gradient Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#059669] to-teal-400 transition-all duration-500"
                        style={{ width: \`\${percent}%\` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <p className="text-xs font-semibold text-slate-400">Belum ada kategori tercatat bulan ini</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Grid for Recent Transactions and Accounts/Budget */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="rounded-[2.2rem] border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden h-full">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Transaksi Terakhir</CardTitle>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Catatan mutasi terbaru</p>
              </div>
              <Link to="/dashboard/transactions" className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1">
                Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-5">
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div
                          className={\`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm \${
                            tx.type === "income"
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : tx.type === "expense"
                                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }\`}
                        >
                          {tx.type === "income" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : tx.type === "expense" ? (
                            <TrendingDown className="h-5 w-5" />
                          ) : (
                            <ArrowRightLeft className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{tx.category}</span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                              {new Date(tx.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={\`text-sm sm:text-base font-black \${
                          tx.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "expense"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-900 dark:text-slate-100"
                        }\`}
                      >
                        {tx.type === "expense"
                          ? "-"
                          : tx.type === "income"
                            ? "+"
                            : ""}
                        {formatCurrency(tx.amount)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <PiggyBank className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Belum ada transaksi bulan ini</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Right Sidebar Widget: Budget & Accounts */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <motion.div variants={itemVariants}>
            <BudgetSection />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2.2rem] border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black text-slate-900 dark:text-white">Akun & Dompet</CardTitle>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Saldo per rekening</p>
                </div>
                <Link to="/dashboard/accounts" className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-0.5">
                  Kelola <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={acc.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm" 
                          style={{ backgroundColor: acc.color || '#059669' }}
                        >
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {acc.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            {acc.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {hideBalances ? maskedValue : formatCurrency(acc.balance)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
`;

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode);
