import express from "express";
import path from "path";
import cors from "cors";
import midtransClient from "midtrans-client";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Using environment variables for Midtrans keys
  const snap = new midtransClient.Snap({
    isProduction: true,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || "",
  });

  app.post("/api/midtrans/token", async (req, res) => {
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

      const transaction = await snap.createTransaction(parameter);
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
    } catch (error: any) {
      console.error("Midtrans Error:", error);
      res.status(500).json({ error: error.message });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
