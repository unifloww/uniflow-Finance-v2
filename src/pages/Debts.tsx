import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Plus, ArrowDownRight, ArrowUpRight, CheckCircle2, Eye, EyeOff, Edit2, Trash2, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Debt {
  id: string;
  type: 'payable' | 'receivable'; // payable = utang (harus bayar), receivable = piutang (uang di orang)
  name: string;
  amount: number;
  status: 'active' | 'completed';
  createdAt: any;
}

export function Debts() {
  const { activeWorkspace } = useData();
  const { currentUser } = useAuth();
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAmounts, setShowAmounts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'payable' | 'receivable'>('payable');
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  
  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(collection(db, "debts"), where("user_id", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedDebts: Debt[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedDebts.push({
          id: docSnap.id,
          type: data.type,
          name: data.name,
          amount: data.amount,
          status: data.status,
          createdAt: data.createdAt,
        });
      });
      setDebts(loadedDebts.sort((a, b) => {
          // Sort active first, then completed
          if (a.status === 'active' && b.status === 'completed') return -1;
          if (a.status === 'completed' && b.status === 'active') return 1;
          return 0;
      }));
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  const totalPayable = debts.filter(d => d.type === 'payable' && d.status === 'active').reduce((sum, d) => sum + d.amount, 0);
  const totalReceivable = debts.filter(d => d.type === 'receivable' && d.status === 'active').reduce((sum, d) => sum + d.amount, 0);

  const formatAmount = (amount: number) => {
    if (!showAmounts) return 'Rp •••••••';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleOpenModal = (debt?: Debt) => {
    if (debt) {
      setEditingId(debt.id);
      setFormType(debt.type);
      setFormName(debt.name);
      setFormAmount(debt.amount.toString());
    } else {
      setEditingId(null);
      setFormType('payable');
      setFormName('');
      setFormAmount('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const amountVal = parseFloat(formAmount);
    if (!formName || isNaN(amountVal) || amountVal <= 0) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, "debts", editingId), {
          type: formType,
          name: formName,
          amount: amountVal,
        });
      } else {
        await addDoc(collection(db, "debts"), {
          user_id: currentUser.uid,
          type: formType,
          name: formName,
          amount: amountVal,
          status: 'active',
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving debt:", error);
      alert("Gagal menyimpan data.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "debts", id));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleToggleStatus = async (debt: Debt) => {
    try {
      const newStatus = debt.status === 'active' ? 'completed' : 'active';
      await updateDoc(doc(db, "debts", debt.id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (activeWorkspace !== 'personal') {
    return (
      <div className="p-8 text-center text-slate-500">
        Fitur Utang & Piutang hanya tersedia di mode Personal.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Utang & Piutang</h1>
          <p className="text-slate-500 dark:text-slate-400">Catat dan pantau pinjaman Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            title={showAmounts ? "Sembunyikan Nominal" : "Tampilkan Nominal"}
          >
            {showAmounts ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Catatan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/10 dark:to-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 flex items-center justify-center shadow-inner">
                <ArrowDownRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Utang Saya (Harus Dibayar)</p>
                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatAmount(totalPayable)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Piutang (Uang Saya di Orang)</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatAmount(totalReceivable)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daftar Catatan</h3>
          {debts.length === 0 ? (
             <div className="text-center p-12 text-slate-500 flex flex-col items-center gap-3">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                 <CheckCircle2 className="w-8 h-8" />
               </div>
               <p>Belum ada catatan utang atau piutang.<br/>Anda bebas dari tanggungan!</p>
             </div>
          ) : (
            <div className="space-y-3">
              {debts.map(debt => (
                <div key={debt.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${
                  debt.status === 'completed' 
                    ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-800/20 opacity-70' 
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                }`}>
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${debt.type === 'payable' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                      {debt.type === 'payable' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`font-bold ${debt.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {debt.name}
                      </h4>
                      <div className="flex gap-2 items-center mt-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          debt.type === 'payable' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        }`}>
                          {debt.type === 'payable' ? 'Utang' : 'Piutang'}
                        </span>
                        {debt.status === 'completed' && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">Lunas</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <span className={`font-black text-lg ${debt.type === 'payable' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'} ${debt.status === 'completed' ? 'line-through opacity-70 text-slate-400 dark:text-slate-500' : ''}`}>
                      {formatAmount(debt.amount)}
                    </span>
                    
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3 ml-1">
                      <button 
                        onClick={() => handleToggleStatus(debt)}
                        className={`p-2 rounded-full transition-colors ${
                          debt.status === 'completed' 
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-slate-200 dark:hover:bg-slate-700' 
                            : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                        }`} 
                        title={debt.status === 'completed' ? 'Batal Lunas' : 'Tandai Lunas'}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(debt)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors" 
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === debt.id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-300 transition-colors">Batal</button>
                          <button onClick={() => handleDelete(debt.id)} className="text-xs px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">Hapus</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteId(debt.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                  {editingId ? 'Edit Catatan' : 'Tambah Catatan'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Jenis
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormType('payable')}
                        className={`py-3 px-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                          formType === 'payable' 
                            ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' 
                            : 'border-slate-200 text-slate-500 dark:border-slate-700'
                        }`}
                      >
                        <ArrowDownRight className="w-4 h-4" /> Utang
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType('receivable')}
                        className={`py-3 px-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                          formType === 'receivable' 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                            : 'border-slate-200 text-slate-500 dark:border-slate-700'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4" /> Piutang
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Nama / Keterangan
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Pinjaman Bank, atau Nama Teman"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#059669] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Nominal (Rp)
                    </label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#059669] transition-colors"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
