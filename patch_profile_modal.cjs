const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

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
`;

code = code.replace(
  /<\/div>\s*<\/motion\.div>\s*<\/div>\s*\);\s*\}\s*$/,
  '      </div>\n      </motion.div>\n' + modalJsx + '\n    </div>\n  );\n}\n'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
