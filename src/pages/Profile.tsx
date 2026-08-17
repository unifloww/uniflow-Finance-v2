import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { User, Phone, Mail, ShieldCheck, CheckCircle2, Crown, Star, ArrowRight, Check, DollarSign, Clock, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { userProfile, updateProfile } = useAuth();
  const { displayCurrency, setDisplayCurrency } = useData();
  const navigate = useNavigate();
  
  const [name, setName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Password tidak cocok.");
      return;
    }
    
    if (newPassword.length < 6) {
       setPasswordError("Password minimal 6 karakter.");
       return;
    }

    try {
      setIsSaving(true);
      const { updatePassword } = await import('firebase/auth');
      const { auth } = await import('../lib/firebase');
      
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError("Sesi telah berakhir, silakan login ulang.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
         setPasswordError("Silakan logout dan login ulang untuk mengubah password.");
      } else {
         setPasswordError("Gagal mengubah password: " + err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#pricing') {
      setTimeout(() => {
        const element = document.getElementById('pricing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [window.location.hash]);


  const [trialRemaining, setTrialRemaining] = useState<{days: number, hours: number} | null>(null);

  useEffect(() => {
    if (userProfile?.plan === 'trial' && userProfile.createdAt) {
      const trialDuration = 3 * 24 * 60 * 60 * 1000;
      const createdAt = new Date(userProfile.createdAt).getTime();
      const expiresAt = createdAt + trialDuration;
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = expiresAt - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTrialRemaining({ days, hours });
        } else {
          setTrialRemaining(null);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [userProfile]);


  useEffect(() => {
    const saved = localStorage.getItem('uniflow_pricing_plans');
    if (saved) {
       try {
         setPricingPlans(JSON.parse(saved));
       } catch (e) {}
    } else {
      setPricingPlans([
        {
          id: '1_month',
          title: 'Uniflow PRO (1 Bulan)',
          price: 23000,
          originalPrice: 45000,
          discountLabel: 'Promo Terbatas',
          periodLabel: '/ 1 bulan',
          features: [
            'Jumlah Akun Tak Terbatas', 'Perencanaan Anggaran',
            'Analisis Visual Dasar', 'Pencadangan Cloud'
          ]
        },
        {
          id: '1_year',
          title: 'Uniflow PRO (1 Tahun)',
          price: 85000,
          originalPrice: 850000,
          discountLabel: 'Hemat 90%',
          periodLabel: '/ 12 bulan',
          features: [
            'Jumlah Akun & Kategori Bebas', 'Perencanaan Anggaran Lengkap',
            'Manajemen Tabungan Premium', 'Analisis Visual Mendalam',
            'Kemampuan Ekspor Excel'
          ]
        },
        {
          id: 'lifetime',
          title: 'Uniflow PRO (Selamanya)',
          price: 150000,
          originalPrice: 1500000,
          discountLabel: 'Hemat 90%',
          periodLabel: 'Sekali Bayar',
          features: [
            'Semua Fitur Tanpa Batas', 'Akses Seumur Hidup',
            'Manajemen Tabungan Premium', 'Analisis Visual Mendalam',
            'Prioritas Update Sistem Baru'
          ]
        }
      ]);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(async () => {
      await updateProfile({ name, phone });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  const handleSubscribe = async (planId: string, price: number, planName: string) => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/payment/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          gross_amount: price,
          customer_details: {
            first_name: userProfile?.name || "User",
            email: userProfile?.email || "user@example.com",
            phone: userProfile?.phone || "081234567890"
          },
          item_details: [{
             id: `plan-${planId}`,
             price: price,
             quantity: 1,
             name: planName
          }]
        })
      });
      
      const data = await res.json();
      
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: async function() {
            await updateProfile({ plan: 'pro', planName: planName });
            alert("Pembayaran berhasil! Paket akun Anda telah di-upgrade.");
            window.location.reload();
          },
          onPending: function() {
            alert("Menunggu pembayaran Anda.");
          },
          onError: function() {
            alert("Pembayaran gagal!");
          },
          onClose: function() {
            alert("Anda menutup popup sebelum menyelesaikan pembayaran.");
          }
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Terjadi kesalahan sistem, silakan coba lagi nanti.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profil Pengguna</h1>
        <p className="text-sm text-emerald-100 mt-1">Atur informasi pribadi dan kelola paket berlangganan Anda.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-6 pt-8 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-[#059669] text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-emerald-900/20 shrink-0">
                {userProfile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">{userProfile?.name}</CardTitle>
                <CardDescription className="text-base text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <Mail className="h-4 w-4" /> {userProfile?.email}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" /> Akun Aktif
                  </span>
                  
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Crown className="h-4 w-4" /> 
                    {userProfile?.plan === 'trial' ? 'Uji Coba (Trial)' : (userProfile?.planName || 'PRO')}
                  </span>
                  {trialRemaining && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {trialRemaining.days} hari {trialRemaining.hours} jam
                     </span>
                  )}

                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSave} className="space-y-6">
              {showSuccess && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Profil berhasil diperbarui.
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#059669]" /> Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-6 px-4 text-base focus:border-[#059669]"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#059669]" /> Nomor Handphone
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-6 px-4 text-base focus:border-[#059669]"
                  />
                </div>
                
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" /> Email (Tidak dapat diubah)
                  </label>
                  <Input
                    type="email"
                    value={userProfile?.email || ""}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl py-6 px-4 text-base text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-[#059669] hover:bg-[#047857] text-white py-6 px-8 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all w-full md:w-auto"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            
            </form>
            
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Keamanan Akun</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tambahkan atau ubah password untuk akun Anda (berguna jika Anda login dengan Google).</p>
               
               <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                 {passwordSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      Password berhasil diperbarui.
                    </motion.div>
                  )}
                  {passwordError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 font-medium text-sm">
                      {passwordError}
                    </motion.div>
                  )}
                 
                 
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password Baru</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#059669] transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Konfirmasi Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Tulis ulang password baru"
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#059669] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving || !newPassword || !confirmPassword}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-xl shadow-md"
                  >
                    Simpan Password Baru
                  </Button>
               </form>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* Pengaturan Preferensi */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden mt-6 mb-12">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-6 px-8">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#059669]" /> Preferensi Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Mata Uang Utama</h3>
                <p className="text-sm text-slate-500 mt-1">Ubah tampilan mata uang di seluruh grafik dan saldo kartu.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setDisplayCurrency('IDR')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    displayCurrency === 'IDR'
                      ? 'bg-white dark:bg-slate-700 text-[#059669] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  IDR (Rp)
                </button>
                <button
                  onClick={() => setDisplayCurrency('USD')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    displayCurrency === 'USD'
                      ? 'bg-white dark:bg-slate-700 text-[#059669] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-400" /> 
            Upgrade Paket Anda
          </h2>
          <p className="text-sm text-emerald-100 mt-1">Dapatkan akses tak terbatas dan kendali penuh atas keuangan Anda.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, idx) => (
            <Card key={idx} className={`rounded-[2rem] border-0 overflow-hidden relative ${plan.id === '1_year' ? 'bg-slate-900 shadow-2xl scale-100 md:scale-105 z-10' : 'bg-white dark:bg-slate-900 shadow-lg'}`}>
              {plan.id === '1_year' && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 text-center">
                  Paling Populer
                </div>
              )}
              <CardHeader className={`p-6 ${plan.id === '1_year' ? 'pt-10' : 'pt-8'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`font-bold text-lg ${plan.id === '1_year' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                    {plan.title}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {plan.discountLabel}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className={`text-3xl font-black ${plan.id === '1_year' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    Rp {plan.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 line-through font-medium">Rp {plan.originalPrice.toLocaleString('id-ID')}</span>
                  <span className="text-sm font-bold text-emerald-500">{plan.periodLabel}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <Button 
                  onClick={() => handleSubscribe(plan.id, plan.price, plan.title)}
                  disabled={isProcessing}
                  className={`w-full py-6 rounded-xl font-bold shadow-lg transition-all ${
                    plan.id === '1_year' 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-900/20' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  Pilih Paket Ini
                </Button>
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {plan.features.map((feature: string, fIdx: number) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-1 bg-emerald-100 dark:bg-emerald-900/30 text-[#059669] shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className={`text-sm font-medium ${plan.id === '1_year' ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
