import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, XCircle, Clock, Eye, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export function AdminUpgrades() {
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const fetchUpgrades = async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const q = query(collection(db, "upgrades"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      
      const data: any[] = [];
      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setUpgrades(data);
    } catch (error) {
      console.error("Error fetching upgrades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpgrades();
  }, []);


  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin MENGHAPUS data permintaan ini secara permanen?')) return;
    
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      await deleteDoc(doc(db, "upgrades", id));
      
      fetchUpgrades();
      alert('Data permintaan berhasil dihapus.');
    } catch (error) {
      console.error("Error deleting upgrade:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const handleAction = async (id: string, userId: string, action: 'approved' | 'rejected', planName: string) => {
    if (!confirm(`Apakah Anda yakin ingin \${action === 'approved' ? 'MENERIMA' : 'MENOLAK'} pembayaran ini?`)) return;
    
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      // Update upgrade status
      await updateDoc(doc(db, "upgrades", id), {
        status: action,
        updatedAt: new Date().toISOString()
      });
      
      // If approved, update user profile
      if (action === 'approved') {
        const userRef = doc(db, "users", userId);
        const now = new Date();
        let planEnd = null;
        let planType = 'pro';
        if (planName.toLowerCase().includes('selamanya')) {
          planType = 'lifetime';
        } else if (planName.includes('1 Bulan')) {
          planEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (planName.includes('1 Tahun')) {
          planEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        await updateDoc(userRef, {
          plan: planType,
          planName: planName,
          ...(planEnd && { planEnd })
        });
      }
      
      // Refresh list
      fetchUpgrades();
      alert(`Pembayaran berhasil \${action === 'approved' ? 'diterima dan akun di-upgrade' : 'ditolak'}.`);
    } catch (error) {
      console.error("Error updating upgrade:", error);
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Konfirmasi Pembayaran</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">Verifikasi bukti transfer pengguna untuk aktivasi paket PRO.</p>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold">Daftar Permintaan Upgrade</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Memuat data...</div>
          ) : upgrades.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
               <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
               <p>Belum ada permintaan upgrade saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Pengguna</th>
                    <th className="px-6 py-4">Paket</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Bukti Transfer</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {upgrades.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.userName}</p>
                        <p className="text-xs text-slate-500">{item.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#059669] dark:text-emerald-400">
                        {item.planName}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        Rp {item.price?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'pending' && <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit"><Clock className="w-3.5 h-3.5" /> Menunggu</span>}
                        {item.status === 'approved' && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> Diterima</span>}
                        {item.status === 'rejected' && <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedProof(item.proofUrl)} className="flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Lihat Bukti
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleAction(item.id, item.userId, 'approved', item.planName)} className="bg-[#059669] hover:bg-emerald-700 text-white">
                               Terima
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction(item.id, item.userId, 'rejected', item.planName)}>
                               Tolak
                            </Button>
                            <Button size="sm" variant="outline" className="text-rose-500 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                               <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-rose-500 border-rose-200 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                               Hapus
                            </Button>
                          </div>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Bukti Transfer */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProof(null)}>
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative max-w-2xl w-full"
             onClick={e => e.stopPropagation()}
           >
             <button onClick={() => setSelectedProof(null)} className="absolute -top-12 right-0 text-white hover:text-slate-300">
                <XCircle className="w-8 h-8" />
             </button>
             <img src={selectedProof} alt="Bukti Transfer" className="w-full rounded-2xl shadow-2xl" />
           </motion.div>
        </div>
      )}
    </div>
  );
}
