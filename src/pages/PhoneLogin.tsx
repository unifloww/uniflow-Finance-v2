import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { motion } from "motion/react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError("Recaptcha kedaluwarsa. Silakan muat ulang halaman.");
        }
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Format phone number to international format (e.g., +62...)
      let formattedPhone = phone;
      if (formattedPhone.startsWith("08")) {
        formattedPhone = "+628" + formattedPhone.substring(2);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
    } catch (err: any) {
      console.error(err);
      setError("Gagal mengirim kode OTP: " + err.message);
      // reset recaptcha if needed
      if (window.recaptchaVerifier) window.recaptchaVerifier.render().then((widgetId: any) => window.recaptchaVerifier.reset(widgetId));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setError("");
    setLoading(true);

    try {
      const userCredential = await confirmationResult.confirm(otp);
      
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      let role = 'user';
      if (!docSnap.exists()) {
        const newProfile = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || 'User HP',
          phone: userCredential.user.phoneNumber || phone,
          role: "user",
          status: "active",
          plan: "trial",
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
      } else {
        role = docSnap.data().role || 'user';
        if (userCredential.user.phoneNumber && !docSnap.data().phone) {
           await setDoc(docRef, { phone: userCredential.user.phoneNumber }, { merge: true });
        }
      }

      if (role === 'superadmin') {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error(err);
      setError("Kode OTP salah atau kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#059669] via-[#059669] to-[#064e3b] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="w-full bg-white dark:bg-slate-900/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border-0 overflow-hidden">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Login dengan Nomor HP
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {showOtpInput ? "Masukkan kode OTP yang dikirim ke HP Anda." : "Masukkan nomor HP Anda yang aktif."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div id="recaptcha-container"></div>
            
            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 font-medium text-center">
                    {error}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300">
                    Nomor HP (misal: 081234...)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-6"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#059669] hover:bg-[#047857] text-white shadow-lg rounded-xl py-6 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? "Mengirim OTP..." : "Kirim Kode OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 font-medium text-center">
                    {error}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300">
                    Kode OTP
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-6 text-center tracking-widest text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#059669] hover:bg-[#047857] text-white shadow-lg rounded-xl py-6 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
                </Button>
                <div className="text-center mt-2">
                   <button type="button" onClick={() => setShowOtpInput(false)} className="text-sm text-[#059669] hover:underline">
                      Kembali edit nomor HP
                   </button>
                </div>
              </form>
            )}
          </CardContent>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <Link to="/login" className="text-[#059669] font-bold hover:underline">
                Kembali ke Login Email
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
