const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUpgrades.tsx', 'utf8');
const oldBlock = `      if (action === 'approved') {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          plan: 'pro',
          planName: planName
        });
      }`;
const newBlock = `      if (action === 'approved') {
        const userRef = doc(db, "users", userId);
        const now = new Date();
        let planEnd = null;
        let planType = 'pro';
        if (planName.toLowerCase().includes('selamanya')) {
          planType = 'lifetime';
        } else if (planName.includes('1 Bulan')) {
          planEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (planName.includes('1 Tahun')) {
          planEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        await updateDoc(userRef, {
          plan: planType,
          planName: planName,
          ...(planEnd && { planEnd })
        });
      }`;
code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/AdminUpgrades.tsx', code);
console.log("Patched AdminUpgrades");
