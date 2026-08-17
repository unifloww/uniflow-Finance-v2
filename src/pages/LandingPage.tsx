import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, ArrowRight, Activity, PieChart, Database, 
  ShieldCheck, ArrowLeftRight, Download, ChevronLeft, ChevronRight,
  Plus, Minus, Calculator, Wallet, LineChart
} from "lucide-react";

declare global {
  interface Window {
    snap: any;
  }
}

export function LandingPage() {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Simulation State
  const [simIncome, setSimIncome] = useState(15000000);
  const [simFixed, setSimFixed] = useState(4000000);
  const [simVariable, setSimVariable] = useState(5000000);

  const simBalance = simIncome - simFixed - simVariable;
  const simSavingsYearly = simBalance * 12;
  const simRatio = simIncome > 0 ? ((simBalance / simIncome) * 100).toFixed(1) : "0";

  const defaultPlans = [
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
  ];

  const [pricingPlans, setPricingPlans] = useState(defaultPlans);

  useEffect(() => {
    const loadPricing = () => {
      const saved = localStorage.getItem('uniflow_pricing_plans');
      if (saved) {
         try {
           setPricingPlans(JSON.parse(saved));
         } catch (e) {
           console.error("Gagal memuat paket harga", e);
         }
      }
    };
    
    loadPricing();
    window.addEventListener('storage', loadPricing);
    return () => window.removeEventListener('storage', loadPricing);
  }, []);

  if (loading) return null;
  
  if (currentUser && userProfile) {
    if (userProfile.role === 'superadmin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const testimonials = [
    {
      name: "Indah Permata",
      role: "Pengusaha Retail",
      text: "Sejak beralih ke Uniflow Finance, arus kas bisnis dan keuangan pribadi saya menjadi jauh lebih rapi. Laporannya sangat mudah dipahami dan analitiknya benar-benar membantu keputusan finansial saya.",
      avatar: "https://i.pravatar.cc/150?img=32"
    },
    {
      name: "Budi Santoso",
      role: "Freelance Designer",
      text: "Sangat fleksibel untuk kebutuhan freelancer seperti saya yang pemasukannya tidak tetap. Fitur anggaran di paket PRO mengubah cara saya mengelola penghasilan setiap bulannya.",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      name: "Sarah Wijaya",
      role: "Manajer Pemasaran",
      text: "Saya sangat menyukai antarmukanya yang bersih dan tidak membingungkan. Sinkronisasi datanya juga sangat cepat. Tidak pernah menyesal beralih ke Uniflow!",
      avatar: "https://i.pravatar.cc/150?img=5"
    }
  ];

  const faqs = [
    {
      q: "Apakah Uniflow Finance gratis digunakan?",
      a: "Uniflow Finance menyediakan versi uji coba (trial) gratis selama 3 hari dengan akses ke fitur esensial. Setelah masa trial berakhir, Anda dapat melanjutkan penggunaan aplikasi dengan berlangganan paket PRO untuk menikmati fungsionalitas tanpa batas."
    },
    {
      q: "Bagaimana cara beralih ke paket PRO?",
      a: "Sangat mudah! Pilih paket yang sesuai di bagian Harga, lalu selesaikan pembayaran. Kami mendukung berbagai metode seperti QRIS, E-Wallet (GoPay, OVO, DANA), hingga Transfer Bank."
    },
    {
      q: "Apakah keamanan data saya terjamin?",
      a: "Tentu. Uniflow menggunakan enkripsi berlapis dan standar keamanan industri untuk memastikan data finansial Anda tetap privat dan aman di server cloud kami."
    },
    {
      q: "Dapatkah saya mengakses Uniflow dari berbagai perangkat?",
      a: "Bisa. Platform kami dirancang responsif sehingga Anda bisa memantau keuangan baik dari laptop saat bekerja maupun dari ponsel saat bepergian."
    }
  ];

  const handleSubscribe = async (planId: string, price: number, planName: string) => {
    if (!currentUser) {
      navigate('/register');
      return;
    }
    try {
      setIsProcessing(true);
      const res = await fetch("/api/payment/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_id: `UNIFLOW-PRO-${planId.toUpperCase()}-${new Date().getTime()}`,
          gross_amount: price,
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
          onSuccess: function() {
            alert("Pembayaran berhasil! Silakan daftar atau login ke akun Anda untuk menikmati fitur PRO Uniflow.");
            navigate('/register');
          },
          onPending: function() {
            alert("Menunggu pembayaran Anda.");
          },
          onError: function() {
            alert("Pembayaran gagal!");
          },
          onClose: function() {
            console.log('User menutup popup tanpa menyelesaikan pembayaran');
          }
        });
      } else {
         alert("Gagal memproses pembayaran. Coba lagi.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan pada sistem pembayaran.");
    } finally {
      setIsProcessing(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#059669]/30 overflow-x-hidden pt-20">
      {/* Navbar - Sticky & Fixed */}
      <nav className="fixed w-full top-0 left-0 right-0 z-50 px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center w-auto lg:w-1/4">
             <img 
               src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20Finace.jpg?alt=media&token=6151287b-2c30-471d-a051-cefa0ad6ae58" 
               alt="Uniflow Finance Logo" 
               className="h-10 md:h-14 lg:h-16 w-auto object-contain mix-blend-multiply dark:mix-blend-normal bg-transparent" 
             />
          </div>
          <div className="hidden lg:flex items-center justify-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-300 flex-1">
             <a href="#cara-kerja" className="hover:text-[#059669] transition-colors">Cara Kerja</a>
             <a href="#simulasi" className="hover:text-[#059669] transition-colors">Simulasi</a>
             <a href="#fitur" className="hover:text-[#059669] transition-colors">Fitur</a>
             <a href="#harga" className="hover:text-[#059669] transition-colors">Harga</a>
          </div>
          <div className="flex items-center justify-end gap-4 w-auto lg:w-1/4">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:block text-sm font-bold hover:text-[#059669] transition-colors">Masuk</Link>
            <Link to="/register" className="text-sm font-bold bg-[#059669] text-white px-5 py-2.5 rounded-full hover:bg-[#047857] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">Coba Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <motion.div 
          className="flex-1 space-y-8"
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold border border-emerald-100 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            #1 Aplikasi Keuangan Terpercaya
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Kelola Keuangan <br/><span className="text-[#059669]">Pribadi Jadi Mudah & Cerdas</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
            Integrasikan seluruh pencatatan, anggaran, dan analisis kekayaan Anda dalam satu ruang kerja finansial yang elegan dan modern.
          </motion.p>
          <motion.ul variants={staggerContainer} className="space-y-3">
            {['Analisis pintar untuk setiap transaksi', 'Kemudahan pelacakan lintas perangkat', 'Keamanan data setara standar perbankan'].map((item, i) => (
              <motion.li variants={fadeUp} key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <span className="font-medium">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div variants={fadeUp} className="flex items-center gap-4 pt-4">
            <Link to="/register" className="bg-[#059669] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#047857] transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5">
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#fitur" className="px-8 py-3.5 rounded-full font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
              Jelajahi Fitur <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex-1 relative w-full max-w-2xl"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
           <div className="absolute inset-0 bg-gradient-to-bl from-emerald-400/20 to-teal-300/20 blur-3xl rounded-full" />
           <div className="relative rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 transform hover:scale-[1.02] transition-transform duration-500">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Device.webp?alt=media&token=d016bcde-5287-4f40-a38b-a38966e9fee4" 
                alt="Uniflow Finance Dashboard" 
                className="w-full h-auto object-cover opacity-95"
              />
           </div>
        </motion.div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-24 bg-white dark:bg-slate-950 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <motion.div 
               initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
               className="flex-1 space-y-8"
            >
               <motion.div variants={fadeUp} className="text-[#059669] text-xs font-bold uppercase tracking-widest">Cara Kerja</motion.div>
               <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black">Kelola Keuangan Cerdas dalam <br/><span className="text-[#059669]">3 Langkah Mudah</span></motion.h2>
               <motion.div variants={staggerContainer} className="space-y-8 pt-4">
                  <motion.div variants={fadeUp} className="flex gap-4">
                     <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center font-black text-[#059669] shrink-0 border border-emerald-100 dark:border-emerald-800">1</div>
                     <div>
                        <h4 className="text-xl font-bold mb-1">Daftar & Atur Dompet</h4>
                        <p className="text-slate-500">Buat akun secara gratis, lalu tambahkan semua sumber dana yang Anda miliki (rekening bank, e-wallet, uang tunai).</p>
                     </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="flex gap-4">
                     <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center font-black text-[#059669] shrink-0 border border-emerald-100 dark:border-emerald-800">2</div>
                     <div>
                        <h4 className="text-xl font-bold mb-1">Catat Rutin Transaksi</h4>
                        <p className="text-slate-500">Rekam pemasukan dan pengeluaran harian Anda, atau atur batasan anggaran pada kategori tertentu.</p>
                     </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="flex gap-4">
                     <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center font-black text-[#059669] shrink-0 border border-emerald-100 dark:border-emerald-800">3</div>
                     <div>
                        <h4 className="text-xl font-bold mb-1">Analisis Wawasan Finansial</h4>
                        <p className="text-slate-500">Sistem otomatis menerjemahkan data Anda menjadi grafik visual untuk membantu Anda membuat keputusan finansial yang tepat.</p>
                     </div>
                  </motion.div>
               </motion.div>
            </motion.div>
            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="flex-1 w-full"
            >
               <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Imguniflow2.webp?alt=media&token=4da11bff-4e0b-447d-94c9-0f392f2ca4c6" alt="Cara Kerja Uniflow" className="w-full rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 object-cover" />
            </motion.div>
         </div>
      </section>

      {/* Simulasi Section */}
      <section id="simulasi" className="py-24 bg-[#F8FAFC] dark:bg-slate-900 px-6 border-y border-slate-200 dark:border-slate-800">
         <div className="max-w-6xl mx-auto">
            <motion.div 
               initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
               className="text-center mb-16"
            >
               <motion.div variants={fadeUp} className="inline-flex items-center justify-center gap-2 text-[#059669] text-xs font-bold uppercase tracking-widest mb-3">
                  <Calculator className="w-4 h-4" /> Simulasi Interaktif
               </motion.div>
               <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-4">Seberapa Sehat <span className="text-[#059669]">Keuangan Anda?</span></motion.h2>
               <motion.p variants={fadeUp} className="text-slate-500 max-w-2xl mx-auto">Gunakan kalkulator di bawah ini untuk memproyeksikan tabungan bulanan dan tahunan Anda berdasarkan rasio penghasilan dan pengeluaran.</motion.p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 flex flex-col lg:flex-row gap-12"
            >
               {/* Inputs */}
               <div className="flex-1 space-y-10">
                  <div>
                     <div className="flex justify-between items-end mb-4">
                        <div>
                           <label className="font-bold text-slate-700 dark:text-slate-300 block">Total Pemasukan Bulanan</label>
                           <span className="text-xs text-slate-500">Gaji, Bisnis, Hasil Investasi</span>
                        </div>
                        <span className="text-2xl font-black text-[#059669]">Rp {simIncome.toLocaleString('id-ID')}</span>
                     </div>
                     <input type="range" min="1000000" max="100000000" step="500000" value={simIncome} onChange={(e) => setSimIncome(Number(e.target.value))} className="w-full h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg appearance-none cursor-pointer accent-[#059669]" />
                  </div>
                  <div>
                     <div className="flex justify-between items-end mb-4">
                        <div>
                           <label className="font-bold text-slate-700 dark:text-slate-300 block">Pengeluaran Tetap</label>
                           <span className="text-xs text-slate-500">Cicilan Rumah/Motor, Tagihan, Asuransi</span>
                        </div>
                        <span className="text-2xl font-black text-rose-500">Rp {simFixed.toLocaleString('id-ID')}</span>
                     </div>
                     <input type="range" min="0" max="50000000" step="100000" value={simFixed} onChange={(e) => setSimFixed(Number(e.target.value))} className="w-full h-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                  </div>
                  <div>
                     <div className="flex justify-between items-end mb-4">
                        <div>
                           <label className="font-bold text-slate-700 dark:text-slate-300 block">Pengeluaran Harian/Variabel</label>
                           <span className="text-xs text-slate-500">Makan, Bensin, Hiburan, Belanja</span>
                        </div>
                        <span className="text-2xl font-black text-rose-500">Rp {simVariable.toLocaleString('id-ID')}</span>
                     </div>
                     <input type="range" min="0" max="30000000" step="100000" value={simVariable} onChange={(e) => setSimVariable(Number(e.target.value))} className="w-full h-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                  </div>
               </div>

               {/* Outputs */}
               <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                     <Activity className="w-48 h-48" />
                  </div>
                  
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Hasil Proyeksi Anda</h3>
                  
                  <div className="mb-8 relative z-10">
                     <div className="text-slate-500 text-sm font-medium mb-1">Potensi Tabungan Bulanan</div>
                     <div className={`text-4xl md:text-5xl font-black ${simBalance >= 0 ? 'text-[#059669]' : 'text-rose-500'}`}>
                        {simBalance >= 0 ? '' : '-'}Rp {Math.abs(simBalance).toLocaleString('id-ID')}
                     </div>
                  </div>
                  
                  <div className="mb-10 relative z-10">
                     <div className="text-slate-500 text-sm font-medium mb-1">Proyeksi Tabungan dalam 1 Tahun</div>
                     <div className={`text-3xl md:text-4xl font-black ${simSavingsYearly >= 0 ? 'text-[#059669]' : 'text-rose-500'}`}>
                        {simSavingsYearly >= 0 ? '' : '-'}Rp {Math.abs(simSavingsYearly).toLocaleString('id-ID')}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-200 dark:border-slate-700 relative z-10">
                     <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Rasio Tabungan (Sisa / Pendapatan)</span>
                        <span className={`font-black text-xl ${simBalance < 0 ? 'text-rose-500' : Number(simRatio) >= 20 ? 'text-[#059669]' : 'text-amber-500'}`}>
                           {simBalance < 0 ? '0' : simRatio}%
                        </span>
                     </div>
                     <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                        {simIncome > 0 && (
                           <>
                              <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${Math.min(((simFixed + simVariable) / simIncome) * 100, 100)}%` }}></div>
                              <div className="h-full bg-[#059669] transition-all duration-300" style={{ width: `${Math.max(0, (simBalance / simIncome) * 100)}%` }}></div>
                           </>
                        )}
                     </div>
                     <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-sm font-medium leading-relaxed flex gap-3">
                           {simBalance < 0 ? (
                              <><span className="text-rose-500">⚠️</span> <span className="text-slate-600 dark:text-slate-400">Peringatan: Pengeluaran Anda melebihi pemasukan. Segera evaluasi anggaran harian Anda!</span></>
                           ) : Number(simRatio) >= 20 ? (
                              <><span className="text-[#059669]">🎉</span> <span className="text-slate-600 dark:text-slate-400">Sangat Sehat! Anda memiliki rasio tabungan di atas standar ideal (20%). Pertahankan konsistensi ini!</span></>
                           ) : (
                              <><span className="text-amber-500">💡</span> <span className="text-slate-600 dark:text-slate-400">Tabungan Anda positif, namun usahakan menekan pengeluaran untuk mencapai rasio ideal 20% agar finansial Anda lebih kuat.</span></>
                           )}
                        </p>
                     </div>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Features Section (Centered Header & Colorful Icons) */}
      <section id="fitur" className="py-24 bg-white dark:bg-slate-950 px-6">
         <div className="max-w-7xl mx-auto">
            <motion.div 
               initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
               className="text-center mb-16"
            >
               <motion.div variants={fadeUp} className="text-[#059669] text-xs font-bold uppercase tracking-widest mb-3">Kemampuan Platform</motion.div>
               <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-4">Dirancang untuk <br/><span className="text-[#059669]">Efisiensi Maksimal</span></motion.h2>
               <motion.p variants={fadeUp} className="text-slate-500 max-w-2xl mx-auto">Gabungan fleksibilitas dan presisi. Kenali fitur andalan kami yang siap mengubah cara Anda berinteraksi dengan uang.</motion.p>
            </motion.div>
            
            <motion.div 
               initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
               className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
               {[
                 { icon: Wallet, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/40", title: "Multi-Akun Fleksibel", desc: "Satu dasbor utama untuk mengawasi berbagai rekening bank dan dompet digital Anda.", pro: false },
                 { icon: PieChart, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/40", title: "Alokasi Anggaran Cerdas", desc: "Buat batasan dana per kategori untuk menjaga pengeluaran bulanan tetap dalam kendali.", pro: true },
                 { icon: Database, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/40", title: "Peta Perjalanan Tabungan", desc: "Visualisasikan target keuangan Anda dari nol hingga mencapai tujuan dengan mudah.", pro: true },
                 { icon: ArrowLeftRight, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/40", title: "Manajemen Utang Piutang", desc: "Catat dan pantau siapa yang berutang pada Anda atau sebaliknya, tanpa rumit.", pro: true },
                 { icon: LineChart, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/40", title: "Wawasan Finansial", desc: "Laporan grafik yang mudah dibaca untuk memantau performa keuangan bersih Anda.", pro: false },
                 { icon: Download, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/40", title: "Laporan Ekspor Siap Pakai", desc: "Tarik data finansial ke format Excel untuk rekonsiliasi atau analisis pribadi lanjutan.", pro: false }
               ].map((f, i) => (
                 <motion.div variants={fadeUp} key={i} className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-1 transition-all relative group cursor-default">
                    {f.pro && <span className="absolute top-6 right-6 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full z-10">PRO</span>}
                    <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                       <f.icon className={`w-7 h-7 ${f.color}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* Testimonial Section (Centered Layout) */}
      <section id="testimoni" className="py-24 bg-[#F8FAFC] dark:bg-slate-900 px-6">
         <div className="max-w-4xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
               <motion.div variants={fadeUp} className="text-[#059669] text-xs font-bold uppercase tracking-widest mb-3">★ Cerita Pengguna</motion.div>
               <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-6">Dipercaya oleh <span className="text-[#059669]">Ribuan Pengguna</span></motion.h2>
               <motion.p variants={fadeUp} className="text-slate-500 mb-12 max-w-2xl mx-auto">Kami bangga menjadi bagian dari perjalanan finansial mereka yang mencari kestabilan dan pertumbuhan melalui Uniflow Finance.</motion.p>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="w-full bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl shadow-xl relative text-center border border-slate-100 dark:border-slate-800"
            >
               <div className="text-6xl text-emerald-100 dark:text-emerald-900/30 absolute top-6 left-1/2 -translate-x-1/2 font-serif">"</div>
               <AnimatePresence mode="wait">
                  <motion.p 
                     key={activeTestimonial}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.3 }}
                     className="text-xl font-medium italic mb-8 relative z-10 leading-relaxed min-h-[140px] md:min-h-[120px] pt-8"
                  >
                    {testimonials[activeTestimonial].text}
                  </motion.p>
               </AnimatePresence>
               <div className="flex flex-col items-center gap-4">
                  <motion.img 
                     key={`img-${activeTestimonial}`}
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     src={testimonials[activeTestimonial].avatar} alt="" className="w-16 h-16 rounded-full bg-slate-200 object-cover shadow-md" 
                  />
                  <div>
                     <div className="font-bold text-lg">{testimonials[activeTestimonial].name}</div>
                     <div className="text-sm text-slate-500">{testimonials[activeTestimonial].role}</div>
                  </div>
               </div>
               <div className="flex justify-center items-center gap-4 mt-8">
                  <button onClick={() => setActiveTestimonial((prev) => prev === 0 ? testimonials.length - 1 : prev - 1)} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                     <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 px-2">
                    {testimonials.map((_, i) => (
                      <button key={i} onClick={() => setActiveTestimonial(i)} className={`h-2 rounded-full transition-all ${activeTestimonial === i ? 'w-8 bg-[#059669]' : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`} />
                    ))}
                  </div>
                  <button onClick={() => setActiveTestimonial((prev) => prev === testimonials.length - 1 ? 0 : prev + 1)} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                     <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Pricing Section (3 Columns) */}
      <section id="harga" className="py-24 bg-white dark:bg-slate-950 px-6">
         <div className="max-w-7xl mx-auto">
            <motion.div 
               initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}
               className="text-center mb-16"
            >
               <motion.div variants={fadeUp} className="text-[#059669] text-xs font-bold uppercase tracking-widest mb-3">Investasi Terjangkau</motion.div>
               <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-4">Pilih Kapasitas <span className="text-[#059669]">Finansial Anda</span></motion.h2>
               <motion.p variants={fadeUp} className="text-slate-500 max-w-xl mx-auto">Buka semua fitur premium tanpa batas untuk memaksimalkan potensi pengelolaan kekayaan Anda secara profesional.</motion.p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 items-stretch mb-16">
               {pricingPlans.map((plan, index) => (
                  <motion.div 
                     key={plan.id}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.5, delay: index * 0.2 }}
                     className={`p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl relative flex flex-col ${index === 1 ? 'border-2 border-[#059669] shadow-emerald-900/10 md:-translate-y-4' : 'border border-slate-200 dark:border-slate-800'}`}
                  >
                     {index === 1 && <div className="absolute top-0 right-0 bg-[#059669] text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded-bl-xl rounded-tr-[2rem] z-10">★ Populer</div>}
                     <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 mt-2">{plan.id === '1_month' ? 'Bulanan' : plan.id === '1_year' ? 'Tahunan' : 'Sekali Bayar'}</div>
                     <h3 className="text-xl font-bold mb-4">{plan.title}</h3>
                     <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl lg:text-4xl font-black">Rp {plan.price.toLocaleString('id-ID')}</span>
                     </div>
                     {plan.originalPrice > plan.price && (
                        <div className="text-slate-400 line-through text-sm mb-1">Rp {plan.originalPrice.toLocaleString('id-ID')}</div>
                     )}
                     <div className="flex flex-wrap items-center gap-2 mb-8 mt-2">
                        {plan.discountLabel && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{plan.discountLabel}</span>}
                        <span className="text-sm text-slate-500">{plan.periodLabel}</span>
                     </div>
                     
                     <button 
                       disabled={isProcessing}
                       onClick={() => handleSubscribe(plan.id, plan.price, plan.title)}
                       className="w-full py-3.5 bg-[#059669] text-white font-bold rounded-xl hover:bg-[#047857] transition-all mb-4 flex justify-center items-center gap-2 hover:-translate-y-0.5 shadow-md"
                     >
                       {isProcessing ? 'Memproses...' : index === 0 ? 'Mulai Bulanan' : index === 1 ? 'Mulai Tahunan' : 'Beli Selamanya'} <ArrowRight className="w-4 h-4" />
                     </button>
                     <p className="text-xs text-center text-slate-400 mb-8 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3"/> Pembayaran terenkripsi & aman.
                     </p>
                     
                     <div className="space-y-4 flex-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Yang Anda Dapatkan</div>
                        {plan.features.map((f: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                             <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" /> <span>{f}</span>
                          </div>
                        ))}
                     </div>
                  </motion.div>
               ))}
            </div>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center"
            >
               <p className="text-sm font-bold text-slate-500 mb-6">Jalur Pembayaran yang Didukung (Otomatis)</p>
               <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-400">
                  <span className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">QRIS (Semua Bank)</span>
                  <span className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">Virtual Account</span>
                  <span className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">GoPay</span>
                  <span className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">OVO</span>
                  <span className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">ShopeePay</span>
               </div>
            </motion.div>
         </div>
      </section>

      {/* FAQ Section (Centered Layout) */}
      <section id="faq" className="py-24 bg-white dark:bg-slate-950 px-6 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
               <motion.div variants={fadeUp} className="text-[#059669] text-xs font-bold uppercase tracking-widest mb-3">Pusat Bantuan</motion.div>
               <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black leading-tight mb-6">Pertanyaan yang <br/>Sering Diajukan</motion.h2>
               <motion.p variants={fadeUp} className="text-slate-500 mb-12">Tidak menemukan apa yang Anda cari? Jangan ragu untuk menghubungi dukungan kami di <a href="mailto:csldnagency@gmail.com" className="text-[#059669] font-medium hover:underline">csldnagency@gmail.com</a>.</motion.p>
            </motion.div>
            
            <div className="space-y-4 text-left">
               {faqs.map((faq, i) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all hover:border-emerald-200 dark:hover:border-emerald-800"
                 >
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left font-bold"
                    >
                       <span className="text-lg pr-8">{faq.q}</span>
                       <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === i ? 'bg-[#059669] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                       </span>
                    </button>
                    <AnimatePresence>
                       {openFaq === i && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           transition={{ duration: 0.3 }}
                         >
                            <div className="px-6 pb-6 text-slate-500 leading-relaxed pt-2">
                              {faq.a}
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Upgrade CTA Section */}
      <section className="py-12 bg-white dark:bg-slate-950 px-6">
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 bg-[#F8FAFC] dark:bg-slate-900 rounded-[2.5rem] overflow-hidden p-8 md:p-12 items-center shadow-sm border border-slate-100 dark:border-slate-800"
         >
            <div className="flex-1 relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800">
               <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/uniflowlaptop.webp?alt=media&token=0d9d0f51-fc5b-4fa4-9c33-56d726453213" alt="Finance Setup" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                 <div className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                   Bergabunglah Bersama Kami
                 </div>
                 <div className="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center text-white">
                   <Activity className="w-4 h-4" />
                 </div>
               </div>
            </div>
            <div className="flex-1 space-y-6">
               <div className="text-[#059669] text-xs font-bold uppercase tracking-widest">Waktunya Beralih</div>
               <h2 className="text-3xl md:text-4xl font-black">Mulai Perjalanan <br/>Finansial Anda!</h2>
               <p className="text-slate-500 leading-relaxed">
                 Jangan biarkan pengeluaran tak terduga mengacaukan rencana Anda. Pegang kendali penuh hari ini bersama Uniflow Finance.
               </p>
               <ul className="space-y-3">
                 {['Tanpa iklan yang mengganggu', 'Alat produktivitas murni', 'Bebas batasan platform'].map((f, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm font-medium">
                     <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                     </div>
                     {f}
                   </li>
                 ))}
               </ul>
               <div className="pt-6 flex flex-col sm:flex-row gap-4">
                 <button onClick={() => handleSubscribe('lifetime', 150000, 'Uniflow PRO (Selamanya)')} disabled={isProcessing} className="bg-[#059669] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#047857] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                   Upgrade ke Akses PRO <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
            </div>
         </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1 space-y-4">
               <div className="flex items-center gap-2 mb-4">
                  <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20Finace.jpg?alt=media&token=6151287b-2c30-471d-a051-cefa0ad6ae58" alt="Uniflow Finance" className="h-14 lg:h-16 object-contain mix-blend-multiply dark:mix-blend-normal bg-transparent" />
               </div>
               <p className="text-sm text-slate-500 leading-relaxed">
                 Aplikasi modern dan andal untuk mengatur, melacak, serta merencanakan masa depan keuangan pribadi dengan sangat mudah.
               </p>
            </div>
            <div>
               <h4 className="font-bold text-xs tracking-widest uppercase text-slate-400 mb-6">Jelajahi</h4>
               <ul className="space-y-4 text-sm font-medium">
                  <li><a href="#cara-kerja" className="hover:text-[#059669] transition-colors">Cara Kerja</a></li>
                  <li><a href="#simulasi" className="hover:text-[#059669] transition-colors">Simulasi Keuangan</a></li>
                  <li><a href="#harga" className="hover:text-[#059669] transition-colors">Paket Harga</a></li>
                  <li><a href="#testimoni" className="hover:text-[#059669] transition-colors">Ulasan</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-xs tracking-widest uppercase text-slate-400 mb-6">Pusat Informasi</h4>
               <ul className="space-y-4 text-sm font-medium">
                  <li><Link to="/login" className="hover:text-[#059669] transition-colors">Mulai Aplikasi</Link></li>
                  <li><Link to="/register" className="hover:text-[#059669] transition-colors">Daftar Akun</Link></li>
                  <li><a href="#" className="hover:text-[#059669] transition-colors">Artikel Finansial</a></li>
                  <li><a href="#" className="hover:text-[#059669] transition-colors">Status Layanan</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-xs tracking-widest uppercase text-slate-400 mb-6">Hubungi Kami</h4>
               <ul className="space-y-4 text-sm font-medium text-slate-500">
                  <li className="flex gap-2">
                     <span className="shrink-0 mt-0.5"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></span>
                     csldnagency@gmail.com
                  </li>
                  <li className="flex gap-2">
                     <span className="shrink-0 mt-0.5"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></span>
                     Palembang, Indonesia
                  </li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
            <p>© 2026 PT LIFIE KARYA NUSANTARA. Seluruh Hak Cipta Dilindungi.</p>
            <div className="flex gap-4">
              <span>SISTEM BERJALAN NORMAL</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

