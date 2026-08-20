const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  '  const [trialRemaining, setTrialRemaining] = useState<{days: number, hours: number} | null>(null);',
  '  const [trialRemaining, setTrialRemaining] = useState<{days: number, hours: number} | null>(null);\n  const [planRemaining, setPlanRemaining] = useState<{days: number, hours: number} | null>(null);'
);

const oldEffect = `  useEffect(() => {
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

const newEffect = `  useEffect(() => {
    let interval: any;
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
      interval = setInterval(updateTimer, 1000 * 60 * 60); // Update every hour
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
      interval = setInterval(updateTimer, 1000 * 60 * 60);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userProfile]);`;

if (code.includes('if (userProfile?.plan === \'trial\' && userProfile.createdAt) {')) {
  code = code.replace(oldEffect, newEffect);
} else {
  console.log("Could not find effect block");
}

fs.writeFileSync('src/pages/Profile.tsx', code);
console.log("Patched Profile.tsx properly.");
