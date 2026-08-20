const fs = require('fs');
let code = fs.readFileSync('src/pages/Accounts.tsx', 'utf8');

const oldModal = `<AnimatePresence>
          {showAddForm && createPortal(
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingId ? "Edit Akun" : "Tambah Akun Baru"}
                </h2>
                <button 
                  onClick={() => resetForm()}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>`;

const newModal = `{createPortal(
        <AnimatePresence>
          {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingId ? "Edit Akun" : "Tambah Akun Baru"}
                </h2>
                <button 
                  onClick={() => resetForm()}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>`;

if (code.includes('<AnimatePresence>\n          {showAddForm && createPortal(')) {
  code = code.replace(oldModal, newModal);
  
  // also replace the closing tags
  const oldClosing = `            </motion.div>
          </motion.div>,
          document.body
        )}
        </AnimatePresence>`;
        
  const newClosing = `            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
        )}`;
        
  code = code.replace(oldClosing, newClosing);
  
  fs.writeFileSync('src/pages/Accounts.tsx', code);
  console.log('Patched Accounts.tsx');
} else {
  console.log('Could not find modal block.');
}
