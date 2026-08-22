import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { auth, db } from "../lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Shield, Lock, Key } from "lucide-react";

export function AdminProfile() {
  const { currentUser, userProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const hasPasswordProvider = auth.currentUser?.providerData.some(p => p.providerId === 'password');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password baru dan konfirmasi tidak cocok." });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru harus minimal 6 karakter." });
      return;
    }

    if (!auth.currentUser || !currentUser?.email) return;

    setLoading(true);
    try {
      if (hasPasswordProvider) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      
      await updatePassword(auth.currentUser, newPassword);
      
      setMessage({ type: "success", text: "Password berhasil diperbarui. Anda sekarang dapat login menggunakan email dan password ini." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setMessage({ type: "error", text: "Password saat ini salah." });
      } else if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: "error", text: "Sesi Anda telah kadaluarsa. Silakan logout dan login kembali menggunakan Google, lalu coba atur password lagi." });
      } else {
        setMessage({ type: "error", text: "Terjadi kesalahan saat memperbarui password." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Profil Admin & Keamanan
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">
          Kelola kredensial dan pengaturan keamanan akun administrator Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[2rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Informasi Akun</CardTitle>
                <CardDescription>Detail akun admin yang sedang login</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama</label>
              <div className="font-medium text-slate-900 dark:text-slate-100">{userProfile?.name || "Admin"}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
              <div className="font-medium text-slate-900 dark:text-slate-100">{currentUser?.email}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Hak Akses (Role)</label>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wider">
                {userProfile?.role}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Ganti Password</CardTitle>
                <CardDescription>Perbarui password akun Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {message.text && (
                <div className={`p-3 text-sm rounded-xl font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                  {message.text}
                </div>
              )}

              {!hasPasswordProvider && (
                <div className="p-3 text-sm rounded-xl font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  Anda login menggunakan Google dan belum memiliki password. Silakan atur password baru di bawah ini untuk mengaktifkan login dengan Email/Password.
                </div>
              )}
              
              {hasPasswordProvider && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password Saat Ini</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
              >
                {loading ? "Menyimpan..." : "Simpan Password"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
