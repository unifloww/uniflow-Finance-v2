import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Edit2, Trash2, Shield, User, Search, AlertCircle, MailPlus, X, Sliders, Check } from "lucide-react";
import { UserProfile, useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface EnrichedUser extends UserProfile {
  totalBalance: number;
  highestExpense: number;
  totalTransactions: number;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_reports', label: 'Lihat Laporan', desc: 'Dapat melihat halaman pendapatan dan analitik keuangan' },
  { id: 'manage_users', label: 'Kelola Pengguna', desc: 'Dapat mengundang, mengedit, dan menghapus pengguna' },
  { id: 'manage_pricing', label: 'Harga & Paket', desc: 'Dapat mengubah harga paket langganan' },
  { id: 'edit_billing', label: 'Kelola Pembayaran', desc: 'Dapat mengelola upgrade dan pembayaran user' },
];

export function AdminUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Invite state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'superadmin'>("admin");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  // Permissions state
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<EnrichedUser | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionsSaving, setPermissionsSaving] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  
  const loadUsers = async () => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const querySnapshot = await getDocs(collection(db, "users"));
      const enrichedUsers: EnrichedUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const u = doc.data() as UserProfile;
        enrichedUsers.push({
          ...u,
          totalBalance: 0, // Mock for now to save reads, or calculate if needed
          highestExpense: 0,
          totalTransactions: 0
        });
      });
      setUsers(enrichedUsers);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        await deleteDoc(doc(db, "users", userToDelete));
        // Real deletion of user via auth is complex client-side, typically needs Cloud Function
        loadUsers();
      } catch (e) {
        console.error(e);
      }
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    // Cycle between user -> admin -> superadmin -> user
    let newRole = 'user';
    if (currentRole === 'user') newRole = 'admin';
    else if (currentRole === 'admin') newRole = 'superadmin';
    
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await updateDoc(doc(db, "users", userId), { role: newRole });
      loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviteLoading(true);
    setInviteMessage("");
    
    try {
      const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      // Check if user is already registered in the list we have
      const existingUser = users.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
      
      if (existingUser) {
        // Just update role
        await updateDoc(doc(db, "users", existingUser.id), { role: inviteRole });
        setInviteMessage(`Pengguna sudah terdaftar. Role berhasil diperbarui menjadi ${inviteRole}.`);
        loadUsers();
      } else {
        // Create invitation
        await addDoc(collection(db, "invitations"), {
          email: inviteEmail.toLowerCase(),
          role: inviteRole,
          status: 'pending',
          createdAt: new Date().toISOString(),
          invitedBy: currentUser?.email || 'admin'
        });

        // Send Email Invitation Link via Firebase Auth
        const { sendSignInLinkToEmail } = await import('firebase/auth');
        const { auth } = await import('../lib/firebase');
        
        const actionCodeSettings = {
          url: `${window.location.origin}/register?email=${encodeURIComponent(inviteEmail.toLowerCase())}`,
          handleCodeInApp: true,
        };
        
        await sendSignInLinkToEmail(auth, inviteEmail.toLowerCase(), actionCodeSettings);
        // We set the email in localStorage to help with sign in on the other end, 
        // though since it's a different browser, the other user will have to type it again or we extract it from URL.

        setInviteMessage(`Undangan berhasil dikirim ke ${inviteEmail}. Email undangan telah dikirimkan secara otomatis.`);
      }
      
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteEmail("");
        setInviteMessage("");
      }, 3000);
      
    } catch (error) {
      console.error("Error inviting admin:", error);
      setInviteMessage("Terjadi kesalahan saat mengundang admin.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleOpenPermissions = (user: EnrichedUser) => {
    setSelectedUserForPermissions(user);
    setSelectedPermissions(user.permissions || []);
    setIsPermissionsModalOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUserForPermissions) return;
    
    setPermissionsSaving(true);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      await updateDoc(doc(db, "users", selectedUserForPermissions.id), { 
        permissions: selectedPermissions 
      });
      
      setIsPermissionsModalOpen(false);
      loadUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setPermissionsSaving(false);
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Manajemen User
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">
            Kelola akses, edit, dan hapus pengguna aplikasi.
          </p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm transition-colors shadow-sm"
              placeholder="Cari user berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            <MailPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Undang Admin</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isInviteModalOpen && (
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
              className="w-full max-w-md"
            >
              <Card className="rounded-[2rem] shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-900 relative">
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="p-6 sm:p-8">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <MailPlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Undang Pengelola</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Kirim undangan untuk menjadi admin. Mereka akan otomatis mendapatkan hak akses saat mendaftar.
                  </p>

                  <form onSubmit={handleInvite} className="space-y-4">
                    {inviteMessage && (
                      <div className="p-3 text-sm rounded-xl font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {inviteMessage}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="email@contoh.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Hak Akses</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'superadmin')}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="admin">Admin Biasa</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 shadow-lg shadow-indigo-600/20"
                    >
                      {inviteLoading ? "Mengirim..." : "Kirim Undangan"}
                    </button>
                  </form>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <tr key={user.id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-base">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                        {user.phone && <div className="text-xs text-slate-400 mt-0.5">📞 {user.phone}</div>}
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
                        ) : user.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-blue-500" />
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
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <button
                          onClick={() => handleOpenPermissions(user)}
                          title="Atur Hak Akses"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleRole(user.id, user.role || 'user')}
                        title="Ubah Role"
                        disabled={user.id === currentUser?.uid}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                        title={user.status === 'active' ? 'Suspend' : 'Aktifkan'}
                        disabled={user.id === currentUser?.uid}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setUserToDelete(user.id)}
                        title="Hapus"
                        disabled={user.id === currentUser?.uid}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
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

      <AnimatePresence>
        {isPermissionsModalOpen && selectedUserForPermissions && (
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
              className="w-full max-w-md"
            >
              <Card className="rounded-[2rem] shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-900 relative">
                <button 
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="p-6 sm:p-8">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Sliders className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Atur Hak Akses</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Sesuaikan akses spesifik untuk admin <strong>{selectedUserForPermissions.name}</strong>.
                  </p>

                  <div className="space-y-3 mb-6">
                    {AVAILABLE_PERMISSIONS.map(permission => {
                      const isSelected = selectedPermissions.includes(permission.id);
                      return (
                        <div 
                          key={permission.id}
                          onClick={() => handleTogglePermission(permission.id)}
                          className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-colors ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20' 
                              : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>
                              {permission.label}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {permission.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSavePermissions}
                    disabled={permissionsSaving}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70 shadow-lg shadow-blue-600/20"
                  >
                    {permissionsSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
