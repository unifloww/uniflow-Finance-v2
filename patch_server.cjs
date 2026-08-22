const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const snap = new midtransClient.Snap({',
  `const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const isProduction = !serverKey.includes("SB-");
  
  const snap = new midtransClient.Snap({`
);

code = code.replace(
  'isProduction: true,',
  'isProduction: isProduction,'
);

code = code.replace(
  'serverKey: process.env.MIDTRANS_SERVER_KEY || "",',
  'serverKey: serverKey,'
);

code = code.replace(
  'const { orderId, grossAmount, customerName, customerEmail } = req.body;',
  `const { orderId, grossAmount, customerName, customerEmail } = req.body;
      
      if (!serverKey) {
        return res.status(500).json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi di Environment Variables server." });
      }`
);

fs.writeFileSync('server.ts', code);
