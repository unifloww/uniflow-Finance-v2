import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import midtransClient from "midtrans-client";

// Midtrans client akan diinisialisasi secara lazy
let snapClient: any = null;

function getSnapClient() {
  if (!snapClient) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      throw new Error('MIDTRANS_SERVER_KEY environment variable is required');
    }
    
    snapClient = new midtransClient.Snap({
        isProduction: false,
        serverKey: serverKey,
        clientKey: process.env.MIDTRANS_CLIENT_KEY || 'Mid-client-dvk7Kr5qta3e3UHy'
    });
  }
  return snapClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/payment/token", async (req, res) => {
    try {
      const { order_id, gross_amount, customer_details, item_details } = req.body;
      
      const parameter = {
        transaction_details: {
          order_id: order_id || `ORDER-${new Date().getTime()}`,
          gross_amount: gross_amount
        },
        credit_card: {
          secure: true
        },
        customer_details: customer_details,
        item_details: item_details
      };

      const snap = getSnapClient();
      const transaction = await snap.createTransaction(parameter);
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
    } catch (e: any) {
      console.error("Midtrans Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
