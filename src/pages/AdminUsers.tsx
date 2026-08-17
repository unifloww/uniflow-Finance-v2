import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Edit2, Trash2, Shield, User, Search, AlertCircle } from "lucide-react";
import { UserProfile } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface EnrichedUser extends UserProfile {
  totalBalance: number;
  highestExpense: number;
  totalTransactions: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const loadUsers = () => {
    const dbStr = localStorage.getItem("uniflow_users_db");
    const db = dbStr ? JSON.parse(dbStr) : {};
    
    const enrichedUsers: EnrichedUser[] = Object.values(db).map((u: any) => {
       const txData = localStorage.getItem(`uniflow_transactions_${u.id}`);
       const txs = txData ? JSON.parse(txData) : [];
       
       let totalBalance = 0;
       let highestExpense = 0;
       
       txs.forEach((tx: any) => {
         if (tx.type === 'income') {
            totalBalance += tx.amount;
         } else if (tx.type === 'expense') {
            totalBalance -= tx.amount;
            if (tx.amount > highestExpense) {
               highestExpense = tx.amount;
            }
         }
       });
       
       return {
         ...u,
         totalBalance,
         highestExpense,
         totalTransactions: txs.length
       };
    });
    
    setUsers(enrichedUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const confirmDelete = () => {
    if (userToDelete) {
      const dbStr = localStorage.getItem("uniflow_users_db");
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const user = db[userToDelete];
        if (user) {
           localStorage.removeItem(`uniflow_transactions_${user.id}`);
        }
        delete db[userToDelete];
        localStorage.setItem("uniflow_users_db", JSON.stringify(db));
        loadUsers();
      }
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = (email: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const dbStr = localStorage.getItem("uniflow_users_db");
    if (dbStr) {
      const db = JSON.parse(dbStr);
      if (db[email]) {
        db[email].status = newStatus;
        localStorage.setItem("uniflow_users_db", JSON.stringify(db));
        loadUsers();
      }
    }
  };

  const handleToggleRole = (email: string, currentRole: string) => {
    const newRole = currentRole === 'user' ? 'superadmin' : 'user';
    const dbStr = localStorage.getItem("uniflow_users_db");
    if (dbStr) {
      const db = JSON.parse(dbStr);
      if (db[email]) {
        db[email].role = newRole;
        localStorage.setItem("uniflow_users_db", JSON.stringify(db));
        loadUsers();
      }
    }
  };

  const filteredUsers = users.filter(u => 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {userToDelete && (
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
             >
               <Card className="w-full max-w-sm rounded-[2rem] shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-900">
                 <div className="p-6 text-center">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 border-[8px] border-rose-50 dark:border-rose-900/10">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Hapus Pengguna?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                      Aksi ini akan menghapus akun <strong>{userToDelete}</strong> beserta seluruh riwayat transaksi secara permanen.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setUserToDelete(null)}
                        className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30"
                      >
                        Hapus Permanen
                      </button>
                    </div>
                 </div>
               </Card>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Manajemen User
          </h1>
          <p className="text-sm text-emerald-100 max-w-xl mt-1 opacity-90">
            Kelola akses, edit, dan hapus pengguna aplikasi.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-xl leading-5 bg-white/10 text-emerald-50 placeholder-emerald-100/50 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 sm:text-sm transition-colors shadow-inner"
            placeholder="Cari user berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="rounded-[2rem] border-0 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-5 rounded-tl-[2rem]">Nama & Email</th>
                <th scope="col" className="px-6 py-5">Status & Role</th>
                <th scope="col" className="px-6 py-5">Total Saldo</th>
                <th scope="col" className="px-6 py-5">Pengeluaran Tertinggi</th>
                <th scope="col" className="px-6 py-5 text-right rounded-tr-[2rem]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.email} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-base">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'active' 
                           ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                           : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {user.status || 'active'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        {user.role === 'superadmin' ? (
                          <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="capitalize font-semibold text-slate-600 dark:text-slate-300">
                          {user.role || 'user'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      Rp {user.totalBalance.toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{user.totalTransactions} Transaksi</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-rose-600 dark:text-rose-400 text-base">
                      Rp {user.highestExpense.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(user.email, user.role || 'user')}
                        title="Ubah Role"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.email, user.status || 'active')}
                        title={user.status === 'active' ? 'Suspend' : 'Aktifkan'}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setUserToDelete(user.email)}
                        title="Hapus"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <p>Tidak ada pengguna yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
