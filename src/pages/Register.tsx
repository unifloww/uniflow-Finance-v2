import React, { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const newProfile = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || 'User',
          phone: userCredential.user.phoneNumber || '',
          role: email === "fitopatner@gmail.com" ? "superadmin" : "user",
          status: "active",
          plan: "trial",
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
      } else {
        if (userCredential.user.phoneNumber && !docSnap.data().phone) {
           await setDoc(docRef, { phone: userCredential.user.phoneNumber }, { merge: true });
        }
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Gagal mendaftar dengan Google: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Register logic with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user profile in Firestore
      const newProfile = {
        id: userCredential.user.uid,
        email: email,
        name: name,
        phone: phone,
        role: userCredential.user.email === "fitopatner@gmail.com" ? "superadmin" : "user",
          status: "active",
        plan: "trial",
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email ini sudah terdaftar. Silakan gunakan email lain atau login.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password terlalu lemah, minimal 6 karakter.");
      } else {
        setError("Gagal mendaftar: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#059669] via-[#059669] to-[#064e3b] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-300/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center mb-8 z-10"
      >
        <img
          src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20White.png?alt=media&token=ed8e2972-f297-4861-9920-c8145506122d"
          alt="UniFlow"
          className="h-32 sm:h-40 w-auto object-contain drop-shadow-2xl"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md z-10"
      >
        <Card className="w-full bg-white dark:bg-slate-900/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border-0 overflow-hidden">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Buat Akun Baru
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Mulai perjalanan finansial Anda bersama UniFlow
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 font-medium text-center">
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300"
                >
                  Nama Lengkap
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-6"
                />
              </div>

              
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300"
                >
                  Nomor HP/WhatsApp
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-6"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-6"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-6 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#059669] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-900/20 rounded-xl py-6 text-base font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                    Atau lanjutkan dengan
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Google
                </Button>
                <Link to="/phone-login" className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Nomor HP
                  </Button>
                </Link>
              </div>

            </form>
          </CardContent>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-[#059669] font-bold hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
