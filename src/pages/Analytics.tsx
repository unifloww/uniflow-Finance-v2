import React, { useMemo } from "react";
import { useData } from "../contexts/DataContext";
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
} from "recharts";

export function Analytics() {
  const { transactions } = useData();

  const { expensesByCategory, incomeVsExpense, history12Months } = useMemo(() => {
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

    return { expensesByCategory, incomeVsExpense, history12Months };
  }, [transactions]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Analitik
        </h1>
        <p className="text-sm text-emerald-100">
          Visualisasi data pengeluaran dan pemasukan Anda.
        </p>
      </div>

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
      </div>
    </div>
  );
}
