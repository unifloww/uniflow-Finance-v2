import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Activity } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { formatCurrency } from "../lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

export function Analytics() {
  const { transactions, accounts, activeWorkspace } = useData();
  const { userProfile } = useAuth();
  const [reportPeriod, setReportPeriod] = useState<"this_month" | "last_month" | "this_year" | "all_time">("this_month");

  const { expensesByCategory, incomeVsExpense, history12Months, history6Months, healthScore, savingsRate, debtToIncomeRatio } = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    // Last 12 months history
    const historyMap = new Map<string, { month: string; income: number; expense: number }>();
    const now = new Date();
    
    // Initialize last 12 months in the map
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      historyMap.set(monthKey, { month: monthKey, income: 0, expense: 0 });
    }

    transactions.forEach((tx) => {
      // General totals
      if (tx.type === "expense") {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
      } else if (tx.type === "income") {
        totalIncome += tx.amount;
      }

      // History processing
      const txDate = new Date(tx.date);
      const monthKey = txDate.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      
      if (historyMap.has(monthKey)) {
        const current = historyMap.get(monthKey)!;
        if (tx.type === "income") current.income += tx.amount;
        if (tx.type === "expense") current.expense += tx.amount;
        historyMap.set(monthKey, current);
      }
    });

    const expensesByCategory = Object.keys(categoryMap)
      .map((key) => ({
        name: key,
        value: categoryMap[key],
      }))
      .sort((a, b) => b.value - a.value); // Sort highest first

    const incomeVsExpense = [
      { name: "Pemasukan", amount: totalIncome, fill: "#10b981" }, // emerald-500
      { name: "Pengeluaran", amount: totalExpense, fill: "#ef4444" }, // red-500
    ];

    const history12Months = Array.from(historyMap.values());
    const history6Months = history12Months.slice(-6);

    // Calculate Financial Health Score
    let totalDebt = 0;
    accounts.forEach(acc => {
      if (acc.type === 'credit' || acc.type === 'paylater') {
         totalDebt += acc.balance;
      }
    });

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const debtToIncomeRatio = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : (totalDebt > 0 ? 100 : 0);

    let savingsScore = 0;
    if (savingsRate >= 20) savingsScore = 50;
    else if (savingsRate >= 10) savingsScore = 40;
    else if (savingsRate > 0) savingsScore = 30;
    else savingsScore = 0;

    let debtScore = 0;
    if (debtToIncomeRatio === 0) debtScore = 50;
    else if (debtToIncomeRatio <= 20) debtScore = 40;
    else if (debtToIncomeRatio <= 40) debtScore = 30;
    else debtScore = 0;

    const healthScore = Math.max(0, Math.min(100, savingsScore + debtScore));

    return { expensesByCategory, incomeVsExpense, history12Months, history6Months, healthScore, savingsRate, debtToIncomeRatio };
  }, [transactions, accounts]);

  const COLORS = [
    "#0f766e",
    "#0ea5e9",
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#8b5cf6",
    "#14b8a6",
    "#f43f5e",
  ];

  
  
  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result as string), false);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Could not load image for PDF:", e);
      return null;
    }
  };

    const generateFinancialReportPDF = async () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    if (reportPeriod === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (reportPeriod === "last_month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (reportPeriod === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(0); // All time
    }

    const filteredTx = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= startDate && d <= endDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let periodIncome = 0;
    let periodExpense = 0;
    
    let mutasiCRCount = 0;
    let mutasiDBCount = 0;

    filteredTx.forEach(tx => {
      if (tx.type === "income" || tx.type === "payable") {
          periodIncome += tx.amount;
          mutasiCRCount++;
      }
      if (tx.type === "expense" || tx.type === "receivable") {
          periodExpense += tx.amount;
          mutasiDBCount++;
      }
    });

    const netProfit = periodIncome - periodExpense;

    let currentTotalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    let netChangeSinceStart = 0;
    const txSinceStart = transactions.filter(tx => new Date(tx.date) >= startDate);
    txSinceStart.forEach(tx => {
       if (tx.type === "income" || tx.type === "payable") netChangeSinceStart += tx.amount;
       if (tx.type === "expense" || tx.type === "receivable") netChangeSinceStart -= tx.amount;
    });
    
    let runningBalance = currentTotalBalance - netChangeSinceStart;
    const openingBalance = runningBalance;

    const currentTx = transactions.filter(tx => new Date(tx.date) <= endDate);
    let totalReceivable = 0;
    let totalPayable = 0;
    currentTx.forEach(tx => {
       if (tx.type === "receivable") totalReceivable += tx.amount;
       if (tx.type === "payable") totalPayable += tx.amount;
    });
    
    const closingBalance = openingBalance + periodIncome - periodExpense;
    const totalAssets = closingBalance + totalReceivable;
    const totalLiabilities = totalPayable;
    const equity = totalAssets - totalLiabilities;

    const periodStr = startDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" }).toUpperCase();
    
    const userName = userProfile?.businessName || userProfile?.name || "NAMA USAHA / BISNIS";
    const address = userProfile?.businessAddress || "ALAMAT BISNIS ANDA\nKOTA, KODE POS\nINDONESIA";
    const photoURL = userProfile?.photoURL || null;

    const formatCurrencyNoRp = (amount: number) => {
        return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    let logoB64: string | null = null;
    if (photoURL) {
        logoB64 = await getBase64ImageFromUrl(photoURL);
    }

    const drawHeader = (pageNumber: number) => {
        if (logoB64) {
            // Draw Watermark (Cap)
            const gState = new (doc as any).GState({ opacity: 0.1 });
            (doc as any).setGState(gState);
            doc.addImage(logoB64, 'JPEG', pageWidth / 2 - 150, pageHeight / 2 - 150, 300, 300);
            (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
            
            // Draw Logo on top left
            doc.addImage(logoB64, 'JPEG', 40, 20, 60, 60);
        } else {
            // Default BCA-like logo placeholder if no logo
            doc.setFontSize(24);
            doc.setFont("helvetica", "bolditalic");
            doc.setTextColor(0, 80, 160);
            doc.text("LOGO", 40, 55);
        }

        // Title
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("REKENING TAHAPAN USAHA", pageWidth / 2 + 50, 45, { align: "center" });

        // Subheader KCU
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("KCU PUSAT", 40, 95);

        // Draw left box (Address box)
        doc.setLineWidth(1);
        doc.setDrawColor(0, 0, 0);
        
        // BCA style corner frames: instead of drawing complex corners, we just draw standard rect
        // But with some margin to mimic the bracket box look
        doc.rect(40, 105, 260, 85);
        // Paint small white rects on corners to make them look cut (like brackets)
        doc.setFillColor(255, 255, 255);
        doc.rect(38, 103, 4, 4, 'F');
        doc.rect(298, 103, 4, 4, 'F');
        doc.rect(38, 188, 4, 4, 'F');
        doc.rect(298, 188, 4, 4, 'F');
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(userName.toUpperCase(), 48, 120);
        
        doc.setFont("helvetica", "bold");
        const addressLines = doc.splitTextToSize(address.toUpperCase(), 245);
        doc.text(addressLines, 48, 135);

        // Draw right box (Details box)
        doc.rect(320, 105, 235, 85);
        doc.rect(318, 103, 4, 4, 'F');
        doc.rect(553, 103, 4, 4, 'F');
        doc.rect(318, 188, 4, 4, 'F');
        doc.rect(553, 188, 4, 4, 'F');
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("NO. REKENING", 330, 120);
        doc.text(":", 420, 120);
        doc.text("UTAMA", 430, 120);
        
        doc.text("HALAMAN", 330, 135);
        doc.text(":", 420, 135);
        doc.text(pageNumber.toString() + "/1", 430, 135); // Assuming mostly 1 page
        
        doc.text("PERIODE", 330, 150);
        doc.text(":", 420, 150);
        doc.text(periodStr, 430, 150);
        
        doc.text("MATA UANG", 330, 165);
        doc.text(":", 420, 165);
        doc.text("IDR", 430, 165);

        // Catatan Box
        doc.rect(40, 205, 515, 60);
        doc.rect(38, 203, 4, 4, 'F');
        doc.rect(553, 203, 4, 4, 'F');
        doc.rect(38, 263, 4, 4, 'F');
        doc.rect(553, 263, 4, 4, 'F');
        
        doc.setFontSize(7);
        doc.text("CATATAN:", 45, 215);
        doc.setFont("helvetica", "normal");
        doc.text("• Apabila nasabah tidak melakukan sanggahan atas Laporan Mutasi Rekening ini, nasabah dianggap telah", 50, 230);
        doc.text("  menyetujui segala data yang tercantum pada Laporan Mutasi Rekening ini.", 50, 240);
        doc.text("• Sistem berhak setiap saat melakukan koreksi apabila ada kesalahan pada Laporan Mutasi Rekening.", 300, 230);
    };

    drawHeader(1);

    const mutasiBody = [];
    mutasiBody.push([
        "",
        "SALDO AWAL",
        "",
        "",
        formatCurrencyNoRp(openingBalance)
    ]);

    filteredTx.forEach(tx => {
      let mutasiVal = "";
      if (tx.type === "income" || tx.type === "payable") {
        mutasiVal = formatCurrencyNoRp(tx.amount); // CR (Credit)
        runningBalance += tx.amount;
      } else {
        mutasiVal = formatCurrencyNoRp(tx.amount) + " DB"; // DB (Debit)
        runningBalance -= tx.amount;
      }
      
      const dt = new Date(tx.date);
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      
      mutasiBody.push([
        `${day}/${month}`,
        tx.description.substring(0, 40) + (tx.description.length > 40 ? "..." : ""),
        tx.category.substring(0, 10).toUpperCase(),
        mutasiVal,
        formatCurrencyNoRp(runningBalance)
      ]);
    });

    autoTable(doc, {
      startY: 280,
      head: [["TANGGAL", "KETERANGAN", "CBG", "MUTASI", "SALDO"]],
      body: mutasiBody,
      theme: 'plain',
      styles: { fontSize: 7, font: "helvetica", textColor: [0, 0, 0], cellPadding: 3 },
      headStyles: { fontStyle: "bold", lineWidth: 1, lineColor: [0,0,0], fillColor: [255,255,255], halign: "center" },
      columnStyles: { 
          0: { cellWidth: 50, halign: 'center' },
          1: { cellWidth: 200 },
          2: { cellWidth: 40, halign: 'center' },
          3: { cellWidth: 110, halign: 'right' },
          4: { cellWidth: 100, halign: 'right' }
      },
      didDrawPage: (data) => {
          if (data.pageNumber > 1) {
              drawHeader(data.pageNumber);
              data.settings.margin.top = 280;
          }
      },
      margin: { top: 280, left: 40, right: 40 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 30;

    // Summary Section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("SALDO AWAL", 180, currentY);
    doc.text(":", 260, currentY);
    doc.text(formatCurrencyNoRp(openingBalance), 340, currentY, { align: "right" });
    
    currentY += 15;
    doc.text("MUTASI CR", 180, currentY);
    doc.text(":", 260, currentY);
    doc.text(formatCurrencyNoRp(periodIncome), 340, currentY, { align: "right" });
    doc.text(mutasiCRCount.toString(), 400, currentY);
    
    currentY += 15;
    doc.text("MUTASI DB", 180, currentY);
    doc.text(":", 260, currentY);
    doc.text(formatCurrencyNoRp(periodExpense), 340, currentY, { align: "right" });
    doc.text(mutasiDBCount.toString(), 400, currentY);

    currentY += 15;
    doc.text("SALDO AKHIR", 180, currentY);
    doc.text(":", 260, currentY);
    doc.text(formatCurrencyNoRp(closingBalance), 340, currentY, { align: "right" });

    // Next page for Neraca & Laba Rugi if needed or just add it
    // Usually these are kept in internal reports. Let's append them for completeness.
    doc.addPage();
    drawHeader((doc as any).internal.getNumberOfPages());
    currentY = 280;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN LABA RUGI", 40, currentY);

    autoTable(doc, {
      startY: currentY + 15,
      head: [["Keterangan", "Nominal"]],
      body: [
        ["Pendapatan Operasional (Pemasukan)", formatCurrencyNoRp(periodIncome)],
        ["Beban Operasional (Pengeluaran)", formatCurrencyNoRp(periodExpense)],
        ["", ""],
        ["LABA BERSIH (NET INCOME)", formatCurrencyNoRp(netProfit)],
      ],
      headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: "bold", lineWidth: 1, lineColor: [0,0,0] },
      theme: 'grid',
      styles: { fontSize: 8, textColor: [0,0,0] },
      columnStyles: { 1: { halign: 'right' } },
      didParseCell: function (data) {
        if (data.row.index === 3 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 40, right: 40 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 30;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("NERACA (BALANCE SHEET)", 40, currentY);

    autoTable(doc, {
      startY: currentY + 15,
      head: [["Aset", "Nominal", "Kewajiban & Ekuitas", "Nominal"]],
      body: [
        ["Kas & Bank", formatCurrencyNoRp(closingBalance), "Hutang Usaha (Liabilitas)", formatCurrencyNoRp(totalLiabilities)],
        ["Piutang Usaha", formatCurrencyNoRp(totalReceivable), "", ""],
        ["", "", "Modal & Laba Ditahan (Ekuitas)", formatCurrencyNoRp(equity)],
        ["", "", "", ""],
        ["TOTAL ASET", formatCurrencyNoRp(totalAssets), "TOTAL KEWAJIBAN & EKUITAS", formatCurrencyNoRp(totalAssets)],
      ],
      headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: "bold", lineWidth: 1, lineColor: [0,0,0] },
      theme: 'grid',
      styles: { fontSize: 8, textColor: [0,0,0] },
      columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } },
      didParseCell: function (data) {
        if (data.row.index === 4 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [245, 245, 245];
        }
      },
      margin: { left: 40, right: 40 }
    });

    const safeName = (userName || "Bisnis").replace(/\s+/g, "_");
    doc.save(`Laporan_Keuangan_${safeName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Analitik
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
          Visualisasi data pengeluaran dan pemasukan Anda.
        </p>
      </div>

            {activeWorkspace === 'business' && (
        <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden mb-6 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Mutasi Rekening & Laporan Keuangan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              Unduh Mutasi Bank terperinci beserta laporan Neraca & Laba Rugi otomatis dengan logo usaha Anda.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={reportPeriod} 
                onChange={(e) => setReportPeriod(e.target.value as any)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="this_month">Bulan Ini</option>
                <option value="last_month">Bulan Lalu</option>
                <option value="this_year">Tahun Ini</option>
                <option value="all_time">Semua Waktu</option>
              </select>
              <button 
                onClick={generateFinancialReportPDF}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Unduh PDF</span>
                <span className="sm:hidden">Unduh</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Cashflow Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {transactions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeVsExpense}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `Rp${val / 1000}k`}
                  />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {incomeVsExpense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Data belum cukup
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Pengeluaran Berdasarkan Kategori</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Belum ada pengeluaran
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900 md:col-span-2">
          <CardHeader>
            <CardTitle>Riwayat Cashflow (12 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {transactions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={history12Months}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(val) => `Rp${val / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Data belum cukup
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900 md:col-span-2">
          <CardHeader>
            <CardTitle>Tren Pemasukan vs Pengeluaran (6 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {transactions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history6Months}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(val) => `Rp${val / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                Data belum cukup
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
