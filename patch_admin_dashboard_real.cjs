const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const newEffect = `
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        
        // Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnap.size);
        
        // We'll mock active sessions just for the UI as it requires presence tracking
        setActiveSessions(usersSnap.size > 0 ? Math.max(1, Math.floor(usersSnap.size * 0.3)) : 1);
        
        // Prepare a user map to get emails/names easily
        const userMap = new Map();
        usersSnap.forEach((doc) => {
           const u = doc.data();
           userMap.set(u.id || doc.id, u);
        });

        // Fetch transactions for recent activities and volume
        const txSnap = await getDocs(collection(db, "transactions"));
        setTotalTransactions(txSnap.size);

        let allActivities = [];
        
        // Prepare chart data (last 30 days)
        const dateMap = new Map();
        const now = new Date();
        now.setHours(0,0,0,0);
        
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          dateMap.set(dateStr, {
            dateStr: dateStr,
            displayDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            users: 0,
            transactions: 0
          });
        }
        
        // Count users per day (using createdAt)
        usersSnap.forEach((doc) => {
           const u = doc.data();
           if (u.createdAt) {
              const uDate = new Date(u.createdAt).toISOString().split('T')[0];
              if (dateMap.has(uDate)) {
                 dateMap.get(uDate).users += 1;
              }
           }
        });

        // Map transactions to activities and chart
        txSnap.forEach(doc => {
           const tx = doc.data();
           const user = userMap.get(tx.user_id) || { name: 'Unknown', email: 'unknown@example.com' };
           
           allActivities.push({
            id: doc.id,
            userEmail: user.email,
            userName: user.name,
            type: tx.type,
            amount: tx.amount,
            date: tx.date,
            title: tx.title,
           });

           if (tx.date) {
               // tx.date usually in YYYY-MM-DD
               const tDate = tx.date.split('T')[0];
               if (dateMap.has(tDate)) {
                   dateMap.get(tDate).transactions += 1;
               }
           }
        });
        
        // Convert map to array
        setChartData(Array.from(dateMap.values()));
        
        allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(allActivities.slice(0, 10));
        
      } catch(e) { console.error(e); }
    };
    
    loadRealData();
  }, []);
`;

// Replace the entire useEffect
code = code.replace(/useEffect\(\(\) => \{[\s\S]*?setChartData\(history\);\s*\}\, \[\]\);/, newEffect);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
