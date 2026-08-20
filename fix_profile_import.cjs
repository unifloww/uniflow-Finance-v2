const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  'import { User, Phone, Mail, ShieldCheck, CheckCircle2, Crown, Star, ArrowRight, Check, DollarSign, Clock, Eye, EyeOff, Upload, X, LogOut } from "lucide-react";',
  'import { User, Phone, Mail, ShieldCheck, CheckCircle2, Crown, Star, ArrowRight, Check, DollarSign, Clock, Eye, EyeOff, Upload, X, LogOut, Briefcase } from "lucide-react";'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
