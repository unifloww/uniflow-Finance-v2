const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Add specific lucide-react imports if missing (X, Upload)
if (!code.includes('Upload')) {
  code = code.replace('Eye, EyeOff } from "lucide-react";', 'Eye, EyeOff, Upload, X } from "lucide-react";');
}

// 1. Add states for Manual Payment Modal
const newStates = `
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [hasPendingUpgrade, setHasPendingUpgrade] = useState(false);
  const [uploadError, setUploadError] = useState("");
`;

code = code.replace(
  'const [isProcessing, setIsProcessing] = useState(false);',
  'const [isProcessing, setIsProcessing] = useState(false);\n' + newStates
);

// 2. Add useEffect to check pending upgrades
const checkPendingUpgrade = `
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
`;

code = code.replace(
  'useEffect(() => {',
  checkPendingUpgrade + '\n  useEffect(() => {'
);

// 3. Replace handleSubscribe
const newHandleSubscribe = `
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

  const submitManualPayment = async () => {
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
`;

code = code.replace(
  /const handleSubscribe = async \([\s\S]*?setIsProcessing\(false\);\s*\}\s*\};/,
  newHandleSubscribe
);

// 4. Add the Modal JSX at the end of the return statement
const modalJsx = `
      {paymentModalOpen && selectedPlan && (
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
                    <p className="text-lg font-black text-[#059669] mt-2 tracking-widest">9010 0084 9959 4218 352</p>
                 </div>
                 <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Tagihan:</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-white">Rp {selectedPlan.price.toLocaleString('id-ID')}</span>
                 </div>
              </div>
              
              <div className="mb-6">
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
      )}
    </div>
  );
`;

code = code.replace(/<\/div>\s*<\/div>\s*\)\s*\}\s*$/, modalJsx + '\n}\n');

// 5. Update UI for pending status
code = code.replace(
  '<h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Pilih Paket Langganan</h3>',
  '<div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold text-slate-800 dark:text-white">Pilih Paket Langganan</h3>{hasPendingUpgrade && <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">Menunggu Konfirmasi Admin</span>}</div>'
);

// Ensure the outer return is correct, if regex failed. We can also just replace `    </div>\n  );\n}`
fs.writeFileSync('src/pages/Profile.tsx', code);
