const fs = require('fs');

let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const statesToAdd = `
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
`;

profile = profile.replace(
  'const [passwordSuccess, setPasswordSuccess] = useState(false);',
  'const [passwordSuccess, setPasswordSuccess] = useState(false);\n' + statesToAdd
);

// We need Eye and EyeOff icons
if (!profile.includes('Eye,')) {
    profile = profile.replace('Check, DollarSign, Clock', 'Check, DollarSign, Clock, Eye, EyeOff');
}

const newPasswordInput = `
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
`;

profile = profile.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password Baru<\/label>\s*<Input\s*type="password"[\s\S]*?\/>\s*<\/div>/,
  newPasswordInput
);

const confirmPasswordInput = `
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
`;

profile = profile.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Konfirmasi Password<\/label>\s*<Input\s*type="password"[\s\S]*?\/>\s*<\/div>/,
  confirmPasswordInput
);

fs.writeFileSync('src/pages/Profile.tsx', profile);
