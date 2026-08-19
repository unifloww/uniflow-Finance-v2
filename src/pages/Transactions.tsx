import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/utils";
import {
  ArrowRightLeft,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  FileDown,
  X,
  Search,
  Wallet,
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "motion/react";

const EXPENSE_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Tagihan & Utilitas",
  "Hiburan",
  "Kesehatan",
  "Pendidikan",
  "Lainnya"
];

const INCOME_CATEGORIES = [
  "Gaji",
  "Bonus",
  "Investasi",
  "Pemberian",
  "Lainnya"
];

export function Transactions() {
  const { transactions, accounts, addTransaction, deleteTransaction } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Makanan & Minuman");
  const [accountId, setAccountId] = useState(
    accounts.length > 0 ? accounts[0].id : "",
  );
  const [filterPeriod, setFilterPeriod] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Open add form if navigated from FAB
    if (location.state?.openAdd) {
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Clear state so refresh doesn't trigger it again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category || !accountId) return;

    addTransaction({
      accountId,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString(),
    });

    setAmount("");
    setDescription("");
    setShowAddForm(false);
  };

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategory(newType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const lowerQuery = searchQuery.toLowerCase();

    return transactions.filter(tx => {
      // Text search
      if (searchQuery && !tx.description.toLowerCase().includes(lowerQuery)) {
        return false;
      }

      if (filterPeriod === "all") return true;
      const txDate = new Date(tx.date);
      if (filterPeriod === "daily") {
        return txDate.toDateString() === now.toDateString();
      }
      if (filterPeriod === "weekly") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= oneWeekAgo && txDate <= now;
      }
      if (filterPeriod === "monthly") {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterPeriod, searchQuery]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(tx => {
      if (tx.type === "income") income += tx.amount;
      if (tx.type === "expense") expense += tx.amount;
    });
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const exportToPDF = async () => {
    const doc = new jsPDF();
    
    // Add simple branding to header
    doc.setFillColor(5, 150, 105); // UniFlow green
    doc.rect(0, 0, 210, 30, "F");
    
    try {
      const response = await fetch("https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20White.png?alt=media&token=ed8e2972-f297-4861-9920-c8145506122d");
      const blob = await response.blob();
      const base64data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      doc.addImage(base64data, "PNG", 14, 8, 30, 12);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(`Laporan Transaksi - UniFlow Finance`, 50, 14);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode: ${filterPeriod.toUpperCase()} | Dicetak: ${new Date().toLocaleString('id-ID')}`, 50, 21);
    } catch (e) {
      doc.setFillColor(255, 255, 255);
      doc.circle(24, 15, 8, "F");
      doc.setTextColor(5, 150, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("UF", 20.5, 16.5);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(`Laporan Transaksi - UniFlow Finance`, 40, 14);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode: ${filterPeriod.toUpperCase()} | Dicetak: ${new Date().toLocaleString('id-ID')}`, 40, 21);
    }
    
    const tableData = filteredTransactions.map(tx => {
      const accName = accounts.find(a => a.id === tx.accountId)?.name || "Unknown";
      const dateStr = new Date(tx.date).toLocaleDateString("id-ID");
      const amountStr = `${tx.type === "income" ? "+" : "-"}${formatCurrency(tx.amount)}`;
      return [dateStr, tx.description, tx.category, accName, amountStr];
    });

    autoTable(doc, {
      head: [["Tanggal", "Keterangan", "Kategori", "Akun", "Jumlah"]],
      body: tableData,
      startY: 35,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [16, 124, 95], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    try {
      doc.save(`Uniflow_Transaksi_${new Date().getTime()}.pdf`);
    } catch (error) {
      // Fallback for iframe sandbox restrictions
      const pdfUrl = doc.output('bloburl');
      window.open(pdfUrl, '_blank');
    }
  };

  const exportToCSV = () => {
    const headers = ["Tanggal", "Keterangan", "Kategori", "Akun", "Jenis", "Jumlah"];
    
    const escapeCSV = (str: string) => {
      if (str === null || str === undefined) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = filteredTransactions.map(tx => {
      const accName = accounts.find(a => a.id === tx.accountId)?.name || "Unknown";
      const dateStr = new Date(tx.date).toLocaleDateString("id-ID");
      const typeStr = tx.type === "income" ? "Pemasukan" : "Pengeluaran";
      
      return [
        dateStr,
        escapeCSV(tx.description),
        escapeCSV(tx.category),
        escapeCSV(accName),
        typeStr,
        tx.amount.toString()
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Uniflow_Transaksi_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Transaksi
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Kelola riwayat pemasukan dan pengeluaran Anda.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={exportToCSV} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-bold transition-all"
          >
            <FileText className="mr-2 h-4 w-4 text-emerald-600" />
            CSV
          </Button>
          <Button 
            onClick={exportToPDF} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-bold transition-all"
          >
            <FileDown className="mr-2 h-4 w-4 text-emerald-600" />
            PDF
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-[#059669] to-teal-600 hover:from-[#047857] hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-500/20 transition-all border-0"
          >
            {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showAddForm ? "Batal" : "Tambah"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <Input
            type="text"
            placeholder="Cari transaksi berdasarkan catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-full h-11 w-full shadow-sm focus-visible:ring-2 focus-visible:ring-[#059669]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:pb-0 items-center">
          {["all", "daily", "weekly", "monthly"].map((period) => {
            const labels: Record<string, string> = {
              all: "Semua",
              daily: "Hari Ini",
              weekly: "7 Hari",
              monthly: "Bulan Ini"
            };
            const isSelected = filterPeriod === period;
            return (
              <Button 
                key={period}
                variant="outline"
                onClick={() => setFilterPeriod(period as any)}
                className={`rounded-full px-5 h-10 shrink-0 transition-all ${
                  isSelected 
                    ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                }`}
                size="sm"
              >
                {labels[period]}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="rounded-[1.5rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Pemasukan</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-200 line-clamp-1">{formatCurrency(totals.income)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[1.5rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
              <TrendingDown className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Pengeluaran</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-200 line-clamp-1">{formatCurrency(totals.expense)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[1.5rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${totals.net >= 0 ? 'bg-teal-50 dark:bg-teal-950/50' : 'bg-rose-50 dark:bg-rose-950/50'}`}>
              <Wallet className={`h-6 w-6 ${totals.net >= 0 ? 'text-teal-600' : 'text-rose-600'}`} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Sisa Bersih</p>
              <p className={`text-xl font-black line-clamp-1 ${totals.net >= 0 ? 'text-[#059669]' : 'text-rose-600'}`}>{formatCurrency(totals.net)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0, y: -20 }}>
            <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden mb-6">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50/50 border-b border-slate-50">
                <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Tambah Transaksi Baru</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jenis Transaksi</label>
                      <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800">
                        <button
                          type="button"
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                          onClick={() => handleTypeChange('expense')}
                        >
                          Pengeluaran
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                          onClick={() => handleTypeChange('income')}
                        >
                          Pemasukan
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Akun / Dompet</label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                        required
                      >
                        {accounts.length === 0 && <option value="" disabled>Belum ada akun, tambahkan di menu Akun</option>}
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({formatCurrency(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kategori</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                        required
                      >
                        {(type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jumlah (Rp)</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Contoh: 50000"
                        required
                        min="0"
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keterangan</label>
                      <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Contoh: Makan siang bareng teman"
                        required
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="rounded-xl font-medium"
                    >
                      Batal
                    </Button>
                    <Button type="submit" className="bg-[#059669] text-white hover:bg-[#047857] shadow-lg shadow-emerald-900/20 rounded-xl font-semibold px-6">
                      Simpan Transaksi
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="rounded-[2rem] border-0 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
                      key={tx.id}
                      className="flex items-center justify-between p-5 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${
                            tx.type === "income"
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600"
                              : "bg-rose-50 dark:bg-rose-950/50 text-rose-600"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <TrendingUp className="h-6 w-6" />
                          ) : (
                            <TrendingDown className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                            {tx.description}
                          </p>
                          <div className="flex items-center text-xs font-medium mt-1 gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wide text-[10px]">
                              {tx.category}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500">•</span>
                            <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">{account?.name || "Akun Dihapus"}</span>
                            <span className="text-slate-400 dark:text-slate-500">•</span>
                            <span className="text-slate-400 dark:text-slate-500">
                              {new Date(tx.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className={`text-base font-black ${
                            tx.type === "income"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {tx.type === "expense" ? "-" : "+"}
                          {formatCurrency(tx.amount)}
                        </div>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:bg-rose-950/50 rounded-full p-2 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                  <ArrowRightLeft className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Belum ada transaksi
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  Tidak ada transaksi yang cocok dengan filter yang dipilih.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
