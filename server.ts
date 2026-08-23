import express from "express";
import path from "path";
import cors from "cors";
import midtransClient from "midtrans-client";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";


dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Using environment variables for Midtrans keys
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const isProduction = !serverKey.includes("SB-");
  
  const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: serverKey,
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-dvk7Kr5qta3e3UHy",
  });

  app.post("/api/midtrans/token", async (req, res) => {
    try {
      const { orderId, grossAmount, customerName, customerEmail } = req.body;
      
      if (!serverKey) {
        return res.status(500).json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi di Environment Variables server." });
      }
      
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
      res.json({ token: transaction.token, redirect_url: transaction.redirect_url, isSandbox: !isProduction });
    } catch (error: any) {
      console.error("Midtrans Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { history, context, userApiKey } = req.body;
      const apiKeyToUse = userApiKey || process.env.GEMINI_API_KEY;

      if (!apiKeyToUse) {
        throw new Error("API Key tidak ditemukan. Silakan atur API Key Anda di pengaturan.");
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const contents = history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: contents,
        config: {
          systemInstruction: "Kamu adalah FIA (Finance Intelligence Assistant), asisten keuangan pintar, ramah, dan solutif dari Uniflow Finance. Berikan respon yang ringkas, jelas, dan menggunakan bahasa Indonesia yang baik. Berikut adalah konteks pengguna saat ini:\n\n" + context,
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      
      const errorMessage = error.message || "Gagal menghubungi AI";
      if (errorMessage.includes("429") || errorMessage.includes("depleted")) {
        res.status(429).json({ error: "Kuota API Gemini Anda telah habis. Silakan periksa pengaturan billing di Google AI Studio." });
      } else {
        res.status(500).json({ error: errorMessage });
      }
  
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
