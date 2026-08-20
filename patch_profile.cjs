const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// State
code = code.replace(
  'const [name, setName] = useState(userProfile?.name || "");\n  const [phone, setPhone] = useState(userProfile?.phone || "");',
  'const [name, setName] = useState(userProfile?.name || "");\n  const [phone, setPhone] = useState(userProfile?.phone || "");\n  const [businessName, setBusinessName] = useState(userProfile?.businessName || "");'
);

// handleSave
code = code.replace(
  'await updateProfile({ name, phone });',
  'await updateProfile({ name, phone, businessName });'
);

// UI field
const businessField = `                <div className="space-y-3">
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
                
                <div className="space-y-3 md:col-span-2">`;

code = code.replace(
  /<div className="space-y-3 md:col-span-2">\s*<label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">\s*<Mail className="h-4 w-4 text-slate-400" \/>/g,
  businessField.replace('<div className="space-y-3 md:col-span-2">', '<div className="space-y-3 md:col-span-2">\n                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">\n                    <Mail className="h-4 w-4 text-slate-400" />')
);

// Check if Briefcase is imported
if (!code.includes('Briefcase')) {
  code = code.replace(
    'import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Crown, ShieldAlert, Fingerprint, Upload, X, Check, FileText, Smartphone, LogOut } from "lucide-react";',
    'import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Crown, ShieldAlert, Fingerprint, Upload, X, Check, FileText, Smartphone, LogOut, Briefcase } from "lucide-react";'
  );
}

fs.writeFileSync('src/pages/Profile.tsx', code);
console.log("Patched Profile");
