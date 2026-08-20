import { createPortal } from "react-dom";
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
  FileText,
  Camera,
  Loader2
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "motion/react";

const expenseCategories = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Tagihan & Utilitas",
  "Hiburan",
  "Kesehatan",
  "Pendidikan",
  "Lainnya"
];

const incomeCategories = [
  "Gaji",
  "Bonus",
  "Investasi",
  "Pemberian",
  "Lainnya"
];

export function Transactions() {
  const { transactions, accounts, addTransaction, deleteTransaction, activeWorkspace } = useData();
  const expenseCategories = activeWorkspace === 'business' ? ['Pembelian Stok/Bahan', 'Gaji Karyawan', 'Operasional', 'Pemasaran', 'Sewa Tempat', 'Pajak', 'Lainnya'] : ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan & Utilitas', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'];
  const incomeCategories = activeWorkspace === 'business' ? ['Penjualan Produk', 'Pendapatan Jasa', 'Pendapatan Lainnya'] : ['Gaji', 'Bonus', 'Investasi', 'Pemberian', 'Lainnya'];
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState("Makanan & Minuman");
  const [accountId, setAccountId] = useState(
    accounts.length > 0 ? accounts[0].id : "",
  );
  const [filterPeriod, setFilterPeriod] = useState<"all" | "daily" | "weekly" | "monthly" | "custom">("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  useEffect(() => {
    setCategory(type === "expense" ? expenseCategories[0] : incomeCategories[0]);
  }, [type, activeWorkspace]);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
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

  const handleScanReceipt = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsScanning(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = reader.result;
          
          const res = await fetch('/api/ai/receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 })
          });
          
          if (!res.ok) throw new Error("Gagal membaca struk");
          
          const data = await res.json();
          let jsonString = data.result;
          if (jsonString.startsWith('```')) {
            jsonString = jsonString.replace(/^\s*```[a-z]*\n/i, '').replace(/\n```\s*$/i, '');
          }
          
          try {
            const parsed = JSON.parse(jsonString);
            if (parsed.amount) setAmount(parsed.amount.toString());
            if (parsed.date) setDate(parsed.date);
            if (parsed.description) setDescription(parsed.description);
            setType('expense');
          } catch (e) {
            console.error("Failed to parse JSON:", jsonString);
            alert("Gagal membaca format JSON dari AI.");
          }
        };
      } catch (err) {
        console.error("Scan error:", err);
        alert("Gagal membaca struk secara otomatis.");
      } finally {
        setIsScanning(false);
      }
    };
    input.click();
  };

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
    
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const lowerQuery = searchQuery.toLowerCase();

    return transactions.filter(tx => {
      // Text search
      if (searchQuery && !tx.description.toLowerCase().includes(lowerQuery) && !tx.category.toLowerCase().includes(lowerQuery)) {
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
      if (filterPeriod === "custom" && customDateRange.start && customDateRange.end) {
        const txDateStr = txDate.toISOString().split("T")[0];
        return txDateStr >= customDateRange.start && txDateStr <= customDateRange.end;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterPeriod, searchQuery, customDateRange]);

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
            <FileText className="mr-2 h-4 w-4 ${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'}" />
            CSV
          </Button>
          <Button 
            onClick={exportToPDF} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-bold transition-all"
          >
            <FileDown className="mr-2 h-4 w-4 ${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'}" />
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
            placeholder="Cari catatan atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-full h-11 w-full shadow-sm focus-visible:ring-2 ${activeWorkspace === 'business' ? 'focus-visible:ring-cyan-600' : 'focus-visible:ring-[#059669]'}"
          />
        </div>
        <div className="flex flex-wrap gap-2 pb-2 md:pb-0 items-center">
          {["all", "daily", "weekly", "monthly", "custom"].map((period) => {
            const labels: Record<string, string> = {
              all: "Semua",
              daily: "Hari Ini",
              weekly: "7 Hari",
              monthly: "Bulan Ini",
              custom: (customDateRange.start && customDateRange.end && filterPeriod === "custom") ? `${new Date(customDateRange.start).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} - ${new Date(customDateRange.end).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}` : "Pilih Tanggal 📅"
            };
            const isSelected = filterPeriod === period;
            
            // Hide "monthly" (Bulan Ini) on mobile
            const displayClass = period === "monthly" ? "hidden sm:inline-flex" : "inline-flex";

            return (
              <div key={period} className={`relative shrink-0 ${displayClass}`}>
                {period === "custom" ? (
                  <Button 
                    variant="outline"
                    onClick={() => setShowDatePickerModal(true)}
                    className={`relative rounded-full px-5 h-10 w-full transition-all ${
                      isSelected 
                        ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                    }`}
                    size="sm"
                  >
                    {labels[period]}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setFilterPeriod(period as any)}
                    className={`rounded-full px-5 h-10 w-full transition-all ${
                      isSelected 
                        ? "bg-gradient-to-r from-[#059669] to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20 font-bold" 
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-sm"
                    }`}
                    size="sm"
                  >
                    {labels[period]}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="rounded-[1.5rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 ${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'}" />
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

            {createPortal(
        <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingId ? "Edit Transaksi" : "Tambah Transaksi Baru"}
                </h2>
                <div className="flex items-center gap-2">
                  {!editingId && (
                    <button
                      type="button"
                      onClick={handleScanReceipt}
                      disabled={isScanning}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      <span className="hidden sm:inline">{isScanning ? "Memindai..." : "Scan Struk (AI)"}</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { setShowAddForm(false); setEditingId(null); }}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jenis Transaksi</label>
                      <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800">
                        <button
                          type="button"
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                          onClick={() => setType('expense')}
                        >
                          Pengeluaran
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? `bg-white dark:bg-slate-900 ${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'} shadow-sm` : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                          onClick={() => setType('income')}
                        >
                          Pemasukan
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal</label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Akun / Dompet</label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className={`w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${activeWorkspace === 'business' ? 'focus-visible:ring-cyan-600' : 'focus-visible:ring-[#059669]'}`}
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
                        className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${activeWorkspace === 'business' ? 'focus-visible:ring-cyan-600' : 'focus-visible:ring-[#059669]'}"
                        required
                      >
                        {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jumlah (Rp)</label>
                      <Input
                        type="number"
                        placeholder="Contoh: 50000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                        required
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keterangan</label>
                      <Input
                        type="text"
                        placeholder="Contoh: Makan siang bareng teman"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => { setShowAddForm(false); setEditingId(null); }}>Batal</Button>
                    <Button type="submit" className={`flex-1 h-12 rounded-xl text-white font-bold shadow-lg transition-all ${type === 'expense' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' : 'bg-[#059669] hover:bg-[#047857] shadow-emerald-500/30'}`}>
                      {editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
                    </Button>
                  </div>

                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body
      )}

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
                      className="flex items-center justify-between p-3 sm:p-5 transition-colors gap-2"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl shadow-sm ${
                            tx.type === "income"
                              ? "bg-emerald-50 dark:bg-emerald-950/50 ${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'}"
                              : "bg-rose-50 dark:bg-rose-950/50 text-rose-600"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                          ) : (
                            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 truncate">
                            {tx.description}
                          </p>
                          <div className="flex items-center text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1 gap-1.5 overflow-x-auto scrollbar-hide whitespace-nowrap">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
                              {tx.category}
                            </span>
                            <span className="text-slate-400 shrink-0">•</span>
                            <span className="text-slate-500 shrink-0 truncate max-w-[70px] sm:max-w-none">{account?.name || "Akun Dihapus"}</span>
                            <span className="text-slate-400 shrink-0">•</span>
                            <span className="text-slate-400 shrink-0">
                              {new Date(tx.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-1">
                        <div
                          className={`text-xs sm:text-base font-black whitespace-nowrap ${
                            tx.type === "income"
                              ? "${activeWorkspace === 'business' ? 'text-cyan-600' : 'text-emerald-600'}"
                              : "text-rose-600"
                          }`}
                        >
                          {tx.type === "expense" ? "-" : "+"}
                          {formatCurrency(tx.amount)}
                        </div>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:bg-rose-950/50 rounded-full p-2 shrink-0 transition-all"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
}