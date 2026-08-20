const fs = require('fs');
let code = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

code = code.replace(
  '  }, [transactions, filterPeriod, searchQuery]);',
  '  }, [transactions, filterPeriod, searchQuery, customDateRange]);'
);

fs.writeFileSync('src/pages/Transactions.tsx', code);
console.log("Patched successfully.");
