import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/utils";
import { Target, Plus, CheckCircle2, Edit2, Trash2, X } from "lucide-react";
import { motion } from "motion/react";

export function Goals() {
  const { goals, addGoal, editGoal, deleteGoal } = useData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [deadline, setDeadline] = useState("");

  const resetForm = () => {
    setName("");
    setTarget("");
    setCurrent("0");
    setDeadline("");
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEditClick = (goal: any) => {
    setEditingId(goal.id);
    setName(goal.name);
    setTarget(goal.target.toString());
    setCurrent(goal.current.toString());
    setDeadline(goal.deadline);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !deadline) return;

    if (editingId) {
      editGoal(editingId, {
        name,
        target: parseFloat(target),
        current: parseFloat(current) || 0,
        deadline,
      });
    } else {
      addGoal({
        name,
        target: parseFloat(target),
        current: parseFloat(current) || 0,
        deadline,
      });
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Impian & Tujuan
          </h1>
          <p className="text-sm text-emerald-100">
            Pantau progres keuangan untuk mencapai impian Anda.
          </p>
        </div>
        <Button
          onClick={() => {
            if (showAddForm) resetForm();
            else {
              resetForm();
              setShowAddForm(true);
            }
          }}
          className="bg-white dark:bg-slate-900 text-[#059669] hover:bg-slate-50 dark:bg-slate-800/50 font-semibold shadow-md"
        >
          {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddForm ? "Batal" : "Tambah Impian"}
        </Button>
      </div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50/50 border-b border-slate-50">
              <CardTitle className="text-lg text-slate-800 dark:text-slate-200">{editingId ? "Edit Impian" : "Tambah Impian Baru"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Impian</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Beli Rumah, Liburan"
                      required
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Dana (Rp)</label>
                    <Input
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="Contoh: 50000000"
                      required
                      min="1"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Terkumpul Saat Ini (Rp)</label>
                    <Input
                      type="number"
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Tanggal</label>
                    <Input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="rounded-xl font-medium"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="bg-[#059669] text-white hover:bg-[#047857] shadow-lg shadow-emerald-900/20 rounded-xl font-semibold">
                    {editingId ? "Simpan Perubahan" : "Simpan Impian"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = Math.min(
            100,
            Math.round((goal.current / goal.target) * 100),
          );
          const isCompleted = progress >= 100;

          return (
            <motion.div key={goal.id} whileHover={{ scale: 1.01 }}>
              <Card
                className={`overflow-hidden rounded-[2rem] border-0 shadow-lg ${isCompleted ? "bg-emerald-50 dark:bg-emerald-950/50" : "bg-white dark:bg-slate-900"}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        {goal.name}
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-[#059669]" />
                        )}
                      </h3>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
                        Target:{" "}
                        {new Date(goal.deadline).toLocaleDateString("id-ID", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-3xl font-black text-[#059669] tracking-tight">
                        {progress}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-[#059669] hover:bg-teal-50 dark:bg-teal-950/50 rounded-full"
                          onClick={() => handleEditClick(goal)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:bg-rose-950/50 rounded-full"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 shadow-inner">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? "bg-[#059669]" : "bg-teal-400"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm font-bold">
                    <div className="text-slate-800 dark:text-slate-200">
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">
                        Terkumpul
                      </span>
                      {formatCurrency(goal.current)}
                    </div>
                    <div className="text-right text-slate-800 dark:text-slate-200">
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">
                        Target Total
                      </span>
                      {formatCurrency(goal.target)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {goals.length === 0 && !showAddForm && (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/20 bg-white dark:bg-slate-900/5 rounded-[2rem]">
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Belum ada target impian
            </h3>
            <p className="text-emerald-100">
              Mulai rencanakan masa depan keuangan Anda sekarang.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
