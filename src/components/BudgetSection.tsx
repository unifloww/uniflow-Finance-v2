import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { formatCurrency } from '../lib/utils';
import { Plus, X, Edit2, Trash2, Target, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export function BudgetSection() {
  const { budgets, transactions, addBudget, editBudget, deleteBudget, activeWorkspace } = useData();
  const expenseCategories = activeWorkspace === 'business' ? ['Pembelian Stok/Bahan', 'Gaji Karyawan', 'Operasional', 'Pemasaran', 'Sewa Tempat', 'Pajak', 'Lainnya'] : ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan & Utilitas', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'];
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('Makanan & Minuman');
  useEffect(() => { setCategory(expenseCategories[0]); }, [activeWorkspace]);
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentMonthPeriod = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const currentMonthBudgets = useMemo(() => {
    return budgets.filter(b => b.period === currentMonthPeriod);
  }, [budgets, currentMonthPeriod]);

  // Hitung pengeluaran per kategori untuk bulan ini
  const expensesByCategory = useMemo(() => {
    const expenses: Record<string, number> = {};
    const now = new Date();
    
    transactions.forEach(tx => {
      if (tx.type !== 'expense') return;
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth()) {
        expenses[tx.category] = (expenses[tx.category] || 0) + tx.amount;
      }
    });
    return expenses;
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    const budgetAmount = parseFloat(amount);
    
    if (editingId) {
      editBudget(editingId, { category, amount: budgetAmount });
    } else {
      // Periksa apakah kategori sudah ada anggarannya bulan ini
      const existing = currentMonthBudgets.find(b => b.category === category);
      if (existing) {
        editBudget(existing.id, { amount: budgetAmount });
      } else {
        addBudget({
          category,
          amount: budgetAmount,
          period: currentMonthPeriod
        });
      }
    }
    resetForm();
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setAmount("");
    setCategory(expenseCategories[0]);
  };

  return (
    <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden h-full">
      <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Anggaran Bulanan</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="text-xs h-8 px-3 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
        >
          {showForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showForm ? "Batal" : "Set Anggaran"}
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Kategori</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    >
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Batas Pengeluaran (Rp)</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 dark:border-slate-700 focus-visible:ring-[#059669]"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="bg-[#059669] hover:bg-[#047857] text-white rounded-xl h-9 text-sm px-6">
                    Simpan Anggaran
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {currentMonthBudgets.length > 0 ? (
          <div className="space-y-6">
            {currentMonthBudgets.map(budget => {
              const spent = expensesByCategory[budget.category] || 0;
              const percentage = Math.min((spent / budget.amount) * 100, 100);
              const isOverBudget = spent >= budget.amount;
              const isWarning = percentage >= 80 && !isOverBudget;
              
              return (
                <div key={budget.id} className="group relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{budget.category}</h4>
                      <p className="text-xs font-medium text-slate-500">
                        {formatCurrency(spent)} dari {formatCurrency(budget.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <span className="flex items-center text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md">
                          <AlertCircle className="w-3 h-3 mr-1" /> Over Budget
                        </span>
                      )}
                      {!isOverBudget && isWarning && (
                        <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                          Hampir Habis
                        </span>
                      )}
                      
                      {/* Action buttons appear on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 ml-2">
                        <button onClick={() => handleEdit(budget)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
                        <button onClick={() => deleteBudget(budget.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        isOverBudget 
                          ? 'bg-rose-500' 
                          : isWarning 
                            ? 'bg-amber-500' 
                            : 'bg-[#059669]'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Target className="w-6 h-6 text-slate-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Anggaran</h4>
            <p className="text-xs text-slate-500 mt-1 mb-3 max-w-xs">
              Buat batasan pengeluaran bulanan Anda untuk setiap kategori agar keuangan tetap terkontrol.
            </p>
            <Button 
              size="sm"
              onClick={() => setShowForm(true)}
              className="text-xs h-8 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full transition-colors"
            >
              Buat Anggaran Baru
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
