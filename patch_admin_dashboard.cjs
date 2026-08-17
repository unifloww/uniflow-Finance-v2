const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const replacement = `
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        
        // Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnap.size);
        
        let allActivities = [];
        let allTxCount = 0;
        
        // Prepare chart data (last 30 days)
        const dateMap = new Map();
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          dateMap.set(dateStr, {
            date: dateStr,
            displayDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            users: 0,
            transactions: 0
          });
        }
        
        // Process each user to build chart data and activities
        // In a real large app we'd use aggregation queries or cloud functions
        usersSnap.forEach((doc) => {
           const u = doc.data();
           if (u.createdAt) {
              const uDate = u.createdAt.split('T')[0];
              if (dateMap.has(uDate)) {
                 dateMap.get(uDate).users += 1;
              }
           }
        });
        
        // We'll mock active sessions just for the UI as it requires presence tracking
        setActiveSessions(usersSnap.size > 0 ? Math.max(1, Math.floor(usersSnap.size * 0.3)) : 1);
        
        // Convert map to array
        setChartData(Array.from(dateMap.values()));
        setActivities([]); // Would require fetching all transactions or a specific activity collection
        
      } catch(e) { console.error(e); }
    };
    
    loadRealData();
  }, []);
`;

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?setChartData\(data\);\s*\}\, \[\]\);/, replacement);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
