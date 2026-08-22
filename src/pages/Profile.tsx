import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { User, Phone, Mail, ShieldCheck, CheckCircle2, Crown, Star, ArrowRight, Check, DollarSign, Clock, Eye, EyeOff, Upload, X, LogOut, Briefcase, Copy } from "lucide-react";
import { motion } from "motion/react";
import { isWebAuthnSupported, registerBiometric } from "../lib/webauthn";
import { Fingerprint } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Note: Ensure midtrans snap script is loaded or we load it dynamically

export function Profile() {
  const { userProfile, updateProfile, currentUser, logout } = useAuth();
  const { displayCurrency, setDisplayCurrency } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error", error);
    }
  };
  
  const [name, setName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [businessName, setBusinessName] = useState(userProfile?.businessName || "");
  const [businessAddress, setBusinessAddress] = useState(userProfile?.businessAddress || "");
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || "");
  const [isSaving, setIsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isProcessingMidtrans, setIsProcessingMidtrans] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(!!localStorage.getItem("saved_biometric_pass"));
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricPasswordPrompt, setBiometricPasswordPrompt] = useState("");


  
  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      localStorage.removeItem("saved_biometric_email");
      localStorage.removeItem("saved_biometric_pass");
      setBiometricEnabled(false);
      // alert("Login biometrik telah dinonaktifkan.");
    } else {
      setShowBiometricPrompt(true);
    }
  };

  const submitBiometricSetup = async () => {
    if (!biometricPasswordPrompt) return;
    try {
      await registerBiometric(userProfile?.email || '');
      localStorage.setItem("saved_biometric_email", userProfile?.email || '');
      localStorage.setItem("saved_biometric_pass", btoa(biometricPasswordPrompt));
      setBiometricEnabled(true);
      setShowBiometricPrompt(false);
      setBiometricPasswordPrompt("");
    } catch (err) {
      console.error(err);
      // alert("Gagal mengaktifkan biometrik.");
    }
  };

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

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [hasPendingUpgrade, setHasPendingUpgrade] = useState(false);
  const [uploadError, setUploadError] = useState("");


  
  useEffect(() => {
    const checkPending = async () => {
      if (!currentUser) return;
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const q = query(collection(db, "upgrades"), where("userId", "==", currentUser.uid), where("status", "==", "pending"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setHasPendingUpgrade(true);
        }
      } catch (e) {
        console.error("Error checking pending upgrades:", e);
      }
    };
    checkPending();
  }, [currentUser]);

  useEffect(() => {
    if (location.hash === '#pricing') {
      setTimeout(() => {
        const element = document.getElementById('pricing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location.hash]);


  const [trialRemaining, setTrialRemaining] = useState<{days: number, hours: number} | null>(null);
  const [planRemaining, setPlanRemaining] = useState<{days: number, hours: number} | null>(null);

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
      await updateProfile({ name, phone, businessName, businessAddress, photoURL });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  
  const handleSubscribe = (planId: string, price: number, planName: string) => {
    if (hasPendingUpgrade) {
       alert("Anda sudah memiliki permintaan upgrade yang sedang diproses. Mohon tunggu konfirmasi dari Admin.");
       return;
    }
    setSelectedPlan({ planId, price, planName });
    setPaymentModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 5MB");
      return;
    }
    
    setUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
           scaleSize = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress
        setProofImage(dataUrl);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("9010008499594218352");
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleMidtransPayment = async () => {
    if (!selectedPlan || !currentUser) return;
    setIsProcessingMidtrans(true);
    try {
      const response = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `UPGRADE-${currentUser.uid}-${Date.now()}`,
          grossAmount: selectedPlan.price,
          customerName: userProfile?.name || "User",
          customerEmail: userProfile?.email || currentUser.email || "user@example.com"
        })
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error("Non-JSON response from server:", text.substring(0, 200));
        throw new Error("Server tidak mengembalikan format data yang valid. (Cek log console)");
      }
      
      if (!response.ok || !data.token) {
        throw new Error(data.error || "Gagal mengambil token pembayaran dari server (Cek Konfigurasi Midtrans)");
      }

      // Ensure snap is available (we need to inject the script if not present)
      const loadSnapScript = (isSandboxEnvironment) => {
        return new Promise((resolve) => {
          // Selalu muat ulang script jika env berbeda, tapi untuk kesederhanaan kita asumsikan bersih
          const existingScript = document.getElementById('midtrans-script');
          if (existingScript) {
             existingScript.remove();
          }
          if ((window as any).snap) {
            // Hapus cache snap object jika ada agar tidak bentrok
            delete (window as any).snap;
          }

          const script = document.createElement('script');
          script.id = 'midtrans-script';
          const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy";
          
          // Gunakan isSandbox dari backend karena lebih akurat (berdasarkan Server Key)
          script.src = isSandboxEnvironment ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js";
          script.setAttribute('data-client-key', clientKey);
          script.onload = () => resolve(true);
          document.body.appendChild(script);
        });
      };

      await loadSnapScript(data.isSandbox);

      (window as any).snap.pay(data.token, {
        onSuccess: async function(result: any) {
          console.log("Midtrans payment success:", result);
          await updateProfile({ plan: selectedPlan.planId });
          setPaymentModalOpen(false);
          alert("Pembayaran berhasil! Akun Anda telah di-upgrade.");
        },
        onPending: function(result: any) {
          console.log("Midtrans payment pending:", result);
          alert("Pembayaran tertunda. Harap selesaikan pembayaran Anda.");
        },
        onError: function(result: any) {
          console.log("Midtrans payment error:", result);
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function() {
          console.log('Customer closed the popup without finishing the payment');
          setIsProcessingMidtrans(false);
        }
      });
    } catch (error) {
      console.error(error);
      alert(`Terjadi kesalahan pembayaran: ${error.message || "Gagal terhubung ke server"}`);
      setIsProcessingMidtrans(false);
    }
  };

  const submitManualPayment = async () => {
    console.log("Submitting manual payment...", { proofImage: !!proofImage, selectedPlan, currentUser: !!currentUser });
    if (!proofImage || !selectedPlan || !currentUser) {
       setUploadError("Harap unggah bukti transfer.");
       return;
    }
    
    try {
       setIsProcessing(true);
       const { collection, addDoc } = await import('firebase/firestore');
       const { db } = await import('../lib/firebase');
       
       await addDoc(collection(db, "upgrades"), {
         userId: currentUser.uid,
         userEmail: userProfile?.email || currentUser.email,
         userName: userProfile?.name || "User",
         planId: selectedPlan.planId,
         planName: selectedPlan.planName,
         price: selectedPlan.price,
         proofUrl: proofImage,
         status: 'pending',
         createdAt: new Date().toISOString()
       });
       
       setHasPendingUpgrade(true);
       setPaymentModalOpen(false);
       setProofImage(null);
       alert("Bukti transfer berhasil dikirim! SuperAdmin akan memverifikasi pembayaran Anda segera.");
    } catch (e) {
       console.error("Payment error:", e);
       alert("Terjadi kesalahan sistem, silakan coba lagi nanti.");
    } finally {
       setIsProcessing(false);
    }
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Profil Pengguna</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Atur informasi pribadi dan kelola paket berlangganan Anda.</p>
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
                  {planRemaining && userProfile?.plan === 'pro' && !userProfile?.planName?.toLowerCase().includes('selamanya') && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {planRemaining.days} hari {planRemaining.hours} jam
                     </span>
                  )}
                  {planRemaining && userProfile?.plan === 'pro' && !userProfile?.planName?.toLowerCase().includes('selamanya') && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {planRemaining.days} hari {planRemaining.hours} jam
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
                
                                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#059669]" /> Nama Bisnis / Usaha
                  </label>
                  <Input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Toko Kopi Uniflow"
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

               {isWebAuthnSupported() && (
                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Login Cepat (Biometrik)</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Login lebih cepat dan aman menggunakan Sidik Jari atau FaceID perangkat Anda.</p>
                   
                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                         <Fingerprint className="h-6 w-6" />
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 dark:text-slate-200">Sidik Jari / FaceID</p>
                         <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                           {biometricEnabled ? "Aktif di perangkat ini" : "Tidak aktif"}
                         </p>
                       </div>
                     </div>
                     <button
                       type="button"
                       onClick={handleToggleBiometric}
                       className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${biometricEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                     >
                       <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${biometricEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                   </div>
                   
                   {showBiometricPrompt && (
                     <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                       <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">Masukkan password Anda untuk mengaktifkan biometrik:</p>
                       <div className="flex gap-2">
                         <Input 
                           type="password" 
                           value={biometricPasswordPrompt}
                           onChange={(e) => setBiometricPasswordPrompt(e.target.value)}
                           className="bg-white dark:bg-slate-800"
                           placeholder="Password"
                         />
                         <Button onClick={submitBiometricSetup} className="bg-emerald-600 hover:bg-emerald-700 text-white">Simpan</Button>
                         <Button onClick={() => setShowBiometricPrompt(false)} variant="outline">Batal</Button>
                       </div>
                     </div>
                   )}
                 </div>
               )}

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
      <motion.div id="pricing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-400" /> 
            Upgrade Paket Anda
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Dapatkan akses tak terbatas dan kendali penuh atas keuangan Anda.</p>
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

      {/* Logout Mobile Only */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:hidden mt-6">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full py-6 rounded-2xl text-rose-500 font-bold border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-500 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Keluar dari Akun
        </Button>
      </motion.div>

      {paymentModalOpen && selectedPlan && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative"
          >
            <button 
              onClick={() => { setPaymentModalOpen(false); setProofImage(null); setUploadError(""); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Konfirmasi Pembayaran</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Selesaikan pembayaran untuk mengaktifkan paket <strong className="text-[#059669] dark:text-emerald-400">{selectedPlan.planName}</strong>.</p>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 mb-6 border border-emerald-100 dark:border-emerald-800/50">
                 <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Transfer Ke Rekening Berikut</p>
                 <div className="space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">BANK NEO COMMERCE</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">PT LIFIE KARYA NUSANTARA</p>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                      <p className="text-lg font-black text-[#059669] tracking-widest">9010 0084 9959 4218 352</p>
                      <button 
                        onClick={handleCopyAccount}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-semibold text-sm hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                      >
                        {copiedAccount ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedAccount ? "Disalin!" : "Salin"}
                      </button>
                    </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Tagihan:</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-white">Rp {selectedPlan.price.toLocaleString('id-ID')}</span>
                 </div>
              </div>
              
              <div className="mb-6">
                 <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pilih Metode Pembayaran</p>
                 
                 <Button 
                   onClick={handleMidtransPayment} 
                   disabled={isProcessingMidtrans}
                   className="w-full py-6 rounded-xl font-bold bg-[#0891b2] hover:bg-cyan-600 text-white shadow-lg text-lg mb-4"
                 >
                   {isProcessingMidtrans ? "Memproses..." : "Bayar Otomatis (Instan)"}
                 </Button>

                 <div className="relative flex py-2 items-center mb-4">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Atau manual transfer</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                 </div>

                 <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Unggah Bukti Transfer</p>
                 {!proofImage ? (
                   <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Klik untuk memilih gambar</p>
                          <p className="text-xs text-slate-400 mt-1">Maks. 5MB (JPG/PNG)</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                   </label>
                 ) : (
                   <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={proofImage} alt="Bukti Transfer" className="w-full h-40 object-cover" />
                      <button 
                        onClick={() => setProofImage(null)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-rose-500 text-white rounded-full p-1.5 transition-colors"
                      >
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                 )}
                 {uploadError && <p className="text-rose-500 text-sm mt-2">{uploadError}</p>}
              </div>
              
              <Button 
                onClick={submitManualPayment} 
                disabled={isProcessing || !proofImage}
                className="w-full py-6 rounded-xl font-bold bg-[#059669] hover:bg-emerald-700 text-white shadow-lg text-lg"
              >
                {isProcessing ? "Memproses..." : "Kirim Konfirmasi Pembayaran"}
              </Button>
            </div>
          </motion.div>
        </div>
      , document.body)}

    </div>
  );
}
