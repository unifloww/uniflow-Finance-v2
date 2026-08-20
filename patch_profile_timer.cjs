const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const oldEffect = `  const [trialRemaining, setTrialRemaining] = useState<{days: number, hours: number} | null>(null);

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
      const interval = setInterval(updateTimer, 1000 * 60 * 60); // Update every hour
      return () => clearInterval(interval);
    }
  }, [userProfile]);`;

const newEffect = `  const [trialRemaining, setTrialRemaining] = useState<{days: number, hours: number} | null>(null);
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
      const interval = setInterval(updateTimer, 1000 * 60 * 60); // Update every hour
      return () => clearInterval(interval);
    } else if (userProfile?.plan === 'pro' && userProfile.planEnd) {
      const expiresAt = new Date(userProfile.planEnd).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = expiresAt - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setPlanRemaining({ days, hours });
        } else {
          setPlanRemaining(null);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000 * 60 * 60);
      return () => clearInterval(interval);
    }
  }, [userProfile]);`;

code = code.replace(oldEffect, newEffect);

const oldUI = `                  {trialRemaining && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {trialRemaining.days} hari {trialRemaining.hours} jam
                     </span>
                  )}`;

const newUI = `                  {trialRemaining && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {trialRemaining.days} hari {trialRemaining.hours} jam
                     </span>
                  )}
                  {planRemaining && userProfile?.plan === 'pro' && !userProfile?.planName?.toLowerCase().includes('selamanya') && (
                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                       <Clock className="h-4 w-4" /> Sisa: {planRemaining.days} hari {planRemaining.hours} jam
                     </span>
                  )}`;

code = code.replace(oldUI, newUI);

fs.writeFileSync('src/pages/Profile.tsx', code);
console.log("Patched Profile.tsx");
