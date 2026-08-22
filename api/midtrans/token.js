import midtransClient from "midtrans-client";

export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  
  // Validasi kunci server
  if (!serverKey) {
     return res.status(500).json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi di Environment Variables server/hosting Anda (seperti Vercel atau Cloud Run)." });
  }

  // Inisialisasi Snap Midtrans
  const snap = new midtransClient.Snap({
    isProduction: !serverKey.includes("SB-"),
    serverKey: serverKey,
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy",
  });

  try {
    const { orderId, grossAmount, customerName, customerEmail } = req.body;
    const parameter = {
      transaction_details: {
        order_id: orderId || `UNIFLOW-${Date.now()}`,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerName || "User",
        email: customerEmail || "user@example.com",
      },
    };
    
    // Buat transaksi
    const transaction = await snap.createTransaction(parameter);
    res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (error) {
    console.error("Midtrans Vercel API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
