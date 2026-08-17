const fs = require('fs');

let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const changePasswordLogic = `
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
`;

profile = profile.replace(
  'const [isSaving, setIsSaving] = useState(false);',
  'const [isSaving, setIsSaving] = useState(false);\n' + changePasswordLogic
);

// We need to find where to put the password change UI.
// Let's put it after the form onSubmit={handleSave} 

const changePasswordUI = `
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
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Konfirmasi Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Tulis ulang password baru"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
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
`;

profile = profile.replace('</form>\n          </CardContent>', changePasswordUI + '\n          </CardContent>');

// Also let's put an id on the pricing section for anchor scrolling
profile = profile.replace(
  '<div className="mb-8 max-w-2xl">',
  '<div id="pricing" className="mb-8 max-w-2xl pt-8 scroll-mt-24">'
);

fs.writeFileSync('src/pages/Profile.tsx', profile);
