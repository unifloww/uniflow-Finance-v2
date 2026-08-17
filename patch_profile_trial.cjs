const fs = require('fs');

let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const trialLogic = `
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
`;

profile = profile.replace(
  'const [isProcessing, setIsProcessing] = useState(false);',
  'const [isProcessing, setIsProcessing] = useState(false);\n' + trialLogic
);

const badgeHtml = `
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Crown className="h-4 w-4" /> 
                    {userProfile?.plan === 'trial' ? 'Uji Coba (Trial)' : (userProfile?.planName || 'PRO')}
                  </span>
                  {trialRemaining && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {trialRemaining.days} hari {trialRemaining.hours} jam
                     </span>
                  )}
`;

profile = profile.replace(
  /<span className="inline-flex items-center gap-1 px-3 py-1\.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900\/30 dark:text-amber-400">[\s\S]*?<\/span>/,
  badgeHtml
);

// Add Clock import if not present
if (!profile.includes('Clock,')) {
    profile = profile.replace('Crown, Star, ArrowRight, Check, DollarSign', 'Crown, Star, ArrowRight, Check, DollarSign, Clock');
}

fs.writeFileSync('src/pages/Profile.tsx', profile);
