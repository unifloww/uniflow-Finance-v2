import React, { useMemo, useState, useEffect } from "react";
import {  Link } from "react-router-dom";
import {  useAuth } from "../contexts/AuthContext";
import {  useData } from "../contexts/DataContext";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { 
  Clock, Wallet,
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
  ShoppingBag,
  Coffee,
  Utensils,
  Car,
  Home,
  Briefcase,
  Zap,
  Tag, FileText, Target
} from "lucide-react";
import {  formatCurrency } from "../lib/utils";
import {  motion } from "motion/react";
import {  BudgetSection } from "../components/BudgetSection";

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
  if (cat.includes("belanja") || cat.includes("shopping") || cat.includes("mall") || cat.includes("stok") || cat.includes("produk")) return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
  if (cat.includes("transport") || cat.includes("bensin") || cat.includes("ojek") || cat.includes("kendaraan")) return <Car className="w-5 h-5 text-blue-500" />;
  if (cat.includes("gaji") || cat.includes("salary") || cat.includes("karyawan") || cat.includes("jasa")) return <Briefcase className="w-5 h-5 text-teal-600" />;
  if (cat.includes("tagihan") || cat.includes("listrik") || cat.includes("air") || cat.includes("internet") || cat.includes("operasional")) return <Zap className="w-5 h-5 text-yellow-500" />;
  if (cat.includes("rumah") || cat.includes("sewa") || cat.includes("kost")) return <Home className="w-5 h-5 text-indigo-500" />;
  if (cat.includes("pemasaran") || cat.includes("marketing")) return <Target className="w-5 h-5 text-rose-500" />;
  if (cat.includes("pajak") || cat.includes("tax")) return <FileText className="w-5 h-5 text-slate-500" />;
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

  const { accounts, transactions, hideBalances, toggleHideBalances, activeWorkspace } = useData();
  const firstName = userProfile?.name?.split(" ")[0] || currentUser?.email?.split("@")[0] || "Teman";
  const displayName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis Anda") : (userProfile?.name || firstName);
  const displayFirstName = activeWorkspace === "business" ? (userProfile?.businessName || "Bisnis") : firstName;
  const userInitial = userProfile?.name?.charAt(0)?.toUpperCase() || firstName.charAt(0).toUpperCase() || "U";


  const themeClasses = activeWorkspace === 'business' 
    ? {
        gradientTop: 'from-cyan-400 via-[#0891b2] to-[#0e7490]',
        gradientMain: 'from-[#0891b2] via-[#0e7490] to-[#155e75]',
        borderLight: 'border-cyan-300/40',
        borderMain: 'border-cyan-500/30',
        textLight: 'text-cyan-100/90',
        textDark: 'text-cyan-900',
        shadowMain: 'shadow-cyan-950/40',
        textAccent: 'text-cyan-200/90',
        textAccentBright: 'text-cyan-200',
        textPrimary: 'text-cyan-600',
        textPrimaryDark: 'text-[#0891b2]',
        bgLight: 'bg-cyan-100',
        bgDark: 'dark:bg-cyan-950/50',
        textDarkPrimary: 'dark:text-cyan-400',
        hoverBorder: 'hover:border-cyan-200 dark:hover:border-cyan-900/50',
        hoverText: 'hover:text-cyan-700',
        iconBg: 'bg-cyan-50',
        plusText: 'text-cyan-200 hover:text-[#0891b2]'
      }
    : {
        gradientTop: 'from-emerald-400 via-[#10b981] to-[#059669]',
        gradientMain: 'from-[#059669] via-[#047857] to-[#046246]',
        borderLight: 'border-emerald-300/40',
        borderMain: 'border-emerald-500/30',
        textLight: 'text-emerald-100/90',
        textDark: 'text-emerald-900',
        shadowMain: 'shadow-emerald-950/40',
        textAccent: 'text-emerald-200/90',
        textAccentBright: 'text-emerald-200',
        textPrimary: 'text-emerald-600',
        textPrimaryDark: 'text-[#059669]',
        bgLight: 'bg-emerald-100',
        bgDark: 'dark:bg-emerald-950/50',
        textDarkPrimary: 'dark:text-emerald-400',
        hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-900/50',
        hoverText: 'hover:text-emerald-700',
        iconBg: 'bg-emerald-50',
        plusText: 'text-emerald-200 hover:text-[#059669]'
      };

  const { netWorth, totalBalance, totalDebt, totalAssets } = useMemo(() => {
    let liquid = 0;
    let debt = 0;
    let assets = 0;
    
    accounts.forEach(acc => {
      if (['bank', 'wallet', 'cash'].includes(acc.type)) liquid += acc.balance;
      else if (['credit', 'paylater'].includes(acc.type)) debt += Math.abs(acc.balance);
      else if (['asset', 'investment'].includes(acc.type)) assets += acc.balance;
    });
    
    const netWorth = liquid + assets - debt;
    return { netWorth, totalBalance: liquid, totalDebt: debt, totalAssets: assets };
  }, [accounts]);

  const { income, expense, payable, receivable } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let payable = 0;
    let receivable = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      if (tx.type === "expense") expense += tx.amount;
      if (tx.type === "payable") payable += tx.amount;
      if (tx.type === "receivable") receivable += tx.amount;
    });
    return { income, expense, payable, receivable };
  }, [transactions]);
  
  const netProfit = income - expense;
  // Calculate simple percentage based on income vs expense, or past vs current. For now, we can just show margin.
  const netProfitMargin = income > 0 ? (netProfit / income) * 100 : 0;
  

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

  const topBusinessCategories = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const catMap: { [key: string]: { name: string; amount: number } } = {};
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (
        tx.type === 'income' &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      ) {
        const key = tx.category || "Lainnya";
        if (!catMap[key]) {
          catMap[key] = { name: key, amount: 0 };
        }
        catMap[key].amount += tx.amount;
      }
    });

    const list = Object.values(catMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
      
    const maxAmount = list.length > 0 ? Math.max(...list.map(l => l.amount)) : 1;

    return { list, maxAmount };
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
    <>
      {/* MOBILE LAYOUT */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-7xl mx-auto lg:hidden"
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
        
      </motion.div>

      {/* Main Pocket / Wallet Card - Signature Emerald Gradient matching mockup */}
      <motion.div variants={itemVariants} className="relative pt-2">
        {/* Back Card peeking out from the pocket */}
        <div className={`mx-4 sm:mx-8 rounded-t-3xl sm:rounded-t-[2.2rem] bg-gradient-to-r ${themeClasses.gradientTop} pt-4 sm:pt-5 pb-8 sm:pb-9 px-5 sm:px-7 text-white flex items-center justify-between shadow-md border-t border-x ${themeClasses.borderLight} relative overflow-hidden`}>
          {/* Soft shine */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/20 blur-xl pointer-events-none" />
          
          <div className="space-y-0.5 relative z-10">
            <p className={`text-[11px] sm:text-xs font-bold ${themeClasses.textLight} leading-tight`}>
              {greeting},
            </p>
            <h3 className="text-base sm:text-xl font-black tracking-tight text-white drop-shadow-sm leading-tight truncate max-w-[200px] sm:max-w-none">
              {displayName}
            </h3>
          </div>

          {userProfile?.plan === 'pro' ? (
            <span className="relative z-10 text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow-sm bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm">
              PRO
            </span>
          ) : (
            <Link to="/dashboard/profile#pricing" className={`relative z-10 text-[10px] sm:text-xs font-black tracking-wider ${themeClasses.textDark} uppercase drop-shadow-sm bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 rounded-full border border-yellow-300 shadow-lg shadow-yellow-500/20 transition-all active:scale-95 flex items-center gap-1`}>
              <Zap className="w-3 h-3" /> Upgrade
            </Link>
          )}
        </div>

        {/* Front Pocket Flap */}
        <div className={`-mt-5 relative z-10 rounded-[2.3rem] sm:rounded-[2.6rem] bg-gradient-to-b ${themeClasses.gradientMain} p-5 sm:p-7 text-white shadow-2xl ${themeClasses.shadowMain} border ${themeClasses.borderMain} overflow-hidden`}>
          {/* Curved top scoop of the pocket with dashed stitch line */}
          <svg
            viewBox="0 0 400 36"
            preserveAspectRatio="none"
            className="absolute top-0 inset-x-0 w-full h-8 pointer-events-none z-10"
          >
            <defs>
              <linearGradient id="pocketSeamShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
            </defs>
            <path d="M0,0 Q200,30 400,0 L400,10 Q200,34 0,10 Z" fill="url(#pocketSeamShadow)" />
            <path
              d="M8,6 Q200,30 392,6"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
              strokeDasharray="6,5"
            />
          </svg>

          {/* Perimeter stitched line around the pocket pouch */}
          <div className="absolute inset-2 sm:inset-3 rounded-[1.9rem] sm:rounded-[2.2rem] border border-dashed border-white/25 pointer-events-none z-0" />

          {/* Balance & Delta Trend */}
          <div className="relative z-10 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className={`text-[11px] font-black uppercase tracking-widest ${themeClasses.textAccentBright}`}>
                KEKAYAAN BERSIH
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-base sm:text-xl font-black ${themeClasses.textAccentBright}`}>Rp</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                  {hideBalances ? "•••••••" : (netWorth).toLocaleString("id-ID")}
                </h2>
              </div>
            </div>
            
            {/* Delta Trend on the right */}
            <div className="flex flex-col items-end gap-2">
              <div className={`flex items-center gap-1.5 self-start sm:self-auto text-xs sm:text-sm font-bold ${themeClasses.textLight} drop-shadow-sm bg-black/10 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full`}>
                <span>{accounts.length} akun aktif</span>
              </div>
              {(totalAssets > 0 || totalDebt > 0) && (
                <div className="flex flex-col items-end text-xs font-medium text-white/80 gap-1 bg-black/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
                  <div className="flex gap-4">
                    <span>Kas: {hideBalances ? "•••" : formatCurrency(totalBalance)}</span>
                    {totalAssets > 0 && <span className="text-indigo-200">Aset: {hideBalances ? "•••" : formatCurrency(totalAssets)}</span>}
                  </div>
                  {totalDebt > 0 && <span className="text-rose-300">Hutang: {hideBalances ? "•••" : formatCurrency(totalDebt)}</span>}
                </div>
              )}
            </div>
          </div>
          
          

          {/* Pocket Action Buttons Row */}
          <div className="relative z-10 mt-6 flex items-center gap-3">
            <Link
              to="/dashboard/analytics"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md py-3.5 px-5 text-xs sm:text-sm font-black text-white shadow-md border border-white/25 transition-all active:scale-95 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-emerald-100" />
              <span>Lihat Laporan</span>
            </Link>
            
            <Link
              to="/dashboard/transactions"
              title="Riwayat Transaksi"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white shadow-md border border-white/25 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <History className="w-5 h-5 text-emerald-100" />
            </Link>
            
            <button
              onClick={toggleHideBalances}
              title={hideBalances ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white shadow-md border border-white/25 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {hideBalances ? <EyeOff className="w-5 h-5 text-emerald-100" /> : <Eye className="w-5 h-5 text-emerald-100" />}
            </button>
          </div>
        </div>
      </motion.div>
      {activeWorkspace === 'business' && (
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white dark:bg-slate-900">
            <div className="flex justify-between h-full flex-col">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pemasukan</div>
                  <h3 className="text-sm font-black text-cyan-600">{hideBalances ? "••••••" : formatCurrency(income)}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pengeluaran</div>
                  <h3 className="text-sm font-black text-rose-600">{hideBalances ? "••••••" : formatCurrency(expense)}</h3>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Laba Bersih</div>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{hideBalances ? "••••••" : formatCurrency(netProfit)}</h2>
                  <span className={`text-xs font-bold ${netProfitMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-center`}>
                    {netProfitMargin >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(netProfitMargin).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      
      {activeWorkspace === 'business' && (
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Aksi Cepat
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/dashboard/transactions" state={{ openAdd: true, defaultType: 'income' }} className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pemasukan</span>
            </Link>
            <Link to="/dashboard/transactions" state={{ openAdd: true, defaultType: 'expense' }} className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-rose-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pengeluaran</span>
            </Link>
            <Link to="/dashboard/invoice" className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-cyan-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Invoice</span>
            </Link>
            <Link to="/dashboard/transactions" state={{ openAdd: true, defaultType: 'transfer' }} className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Transaksi</span>
            </Link>
          </div>
        </motion.div>
      )}

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
                Aktivitas berdasarkan mutasi
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
                        style={{ width: `${percent}%` }}
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
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${
                            tx.type === "income"
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : tx.type === "expense"
                                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
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
                        className={`text-sm sm:text-base font-black ${
                          tx.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "expense"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-900 dark:text-slate-100"
                        }`}
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
          {activeWorkspace === 'business' && (
            <motion.div variants={itemVariants}>
              <Card className="rounded-[1.5rem] border-0 shadow-lg shadow-cyan-200/50 bg-white dark:bg-slate-900 border-t-4 border-t-cyan-500">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" /> Kinerja Kategori
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 pb-5">
                  <div className="space-y-4">
                    {topBusinessCategories.list.length > 0 ? (
                      topBusinessCategories.list.map((cat, idx) => {
                        const percent = Math.min(Math.round((cat.amount / topBusinessCategories.maxAmount) * 100), 100);
                        return (
                          <div key={cat.name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                              <span className="font-black text-slate-900 dark:text-white">{hideBalances ? "Rp •••" : formatCurrency(cat.amount)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-center font-semibold text-slate-400 py-2">Belum ada data pendapatan bulan ini</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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

    {/* DESKTOP LAYOUT */}
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="hidden lg:block max-w-7xl mx-auto relative z-10">
      {/* Green Header Background matching the image */}
      

      {/* Greeting Section */}
      <div className="flex items-start justify-between text-white mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold">{greeting}, {displayFirstName} 👋</h1>
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

      
      {activeWorkspace === 'business' && (
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Aksi Cepat
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/dashboard/transactions" state={{ openAdd: true, defaultType: 'income' }} className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pemasukan</span>
            </Link>
            <Link to="/dashboard/transactions" state={{ openAdd: true, defaultType: 'expense' }} className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-rose-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pengeluaran</span>
            </Link>
            <Link to="/dashboard/invoice" className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-cyan-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Invoice</span>
            </Link>
            <Link to="/dashboard/transactions" state={{ openAdd: true, defaultType: 'transfer' }} className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Transaksi</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Desktop Cards Grid */}
      {activeWorkspace === 'business' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white dark:bg-slate-900 border-t-4 border-t-cyan-500">
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Kas & Likuid</div>
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{hideBalances ? "••••••" : formatCurrency(totalBalance)}</h2>
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-4">Dari {accounts.length} akun aktif</p>
          </Card>

          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white dark:bg-slate-900">
            <div className="flex justify-between h-full flex-col">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pemasukan</div>
                  <h3 className="text-sm font-black text-cyan-600">{hideBalances ? "••••••" : formatCurrency(income)}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pengeluaran</div>
                  <h3 className="text-sm font-black text-rose-600">{hideBalances ? "••••••" : formatCurrency(expense)}</h3>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Laba Bersih</div>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{hideBalances ? "••••••" : formatCurrency(netProfit)}</h2>
                  <span className={`text-xs font-bold ${netProfitMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-center`}>
                    {netProfitMargin >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(netProfitMargin).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white dark:bg-slate-900">
             <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Piutang (Hutang Klien)</div>
             <div className="flex justify-between items-start">
               <h2 className="text-3xl font-black text-indigo-600">{hideBalances ? "••••••" : formatCurrency(receivable)}</h2>
               <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
               </div>
             </div>
             <p className="text-[11px] font-bold text-slate-400 mt-4">Uang masuk tertunda</p>
          </Card>
          
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white dark:bg-slate-900">
             <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Hutang Bisnis</div>
             <div className="flex justify-between items-start">
               <h2 className="text-3xl font-black text-amber-600">{hideBalances ? "••••••" : formatCurrency(payable)}</h2>
               <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-amber-500" />
               </div>
             </div>
             <p className="text-[11px] font-bold text-slate-400 mt-4">Kewajiban bayar</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5 mb-8">
          <Card className="rounded-[1.5rem] border-0 shadow-lg p-5 bg-white">
            <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Kas & Likuid</div>
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
      )}
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
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${tx.type === "income" ? "bg-emerald-100 text-emerald-600" : tx.type === "expense" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
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
                      <div className={`text-sm sm:text-base font-black ${tx.type === "income" ? "text-emerald-600" : tx.type === "expense" ? "text-rose-600" : "text-slate-900"}`}>
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
          {activeWorkspace === 'business' && (
            <Card className="rounded-[1.5rem] border-0 shadow-lg shadow-cyan-200/50 bg-white dark:bg-slate-900 border-t-4 border-t-cyan-500">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" /> Kinerja Kategori
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-5">
                <div className="space-y-4">
                  {topBusinessCategories.list.length > 0 ? (
                    topBusinessCategories.list.map((cat, idx) => {
                      const percent = Math.min(Math.round((cat.amount / topBusinessCategories.maxAmount) * 100), 100);
                      return (
                        <div key={cat.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                            <span className="font-black text-slate-900 dark:text-white">{hideBalances ? "Rp •••" : formatCurrency(cat.amount)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-center font-semibold text-slate-400 py-2">Belum ada data pendapatan bulan ini</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
  
    </>
  );}
