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
import { isWebAuthnSupported, registerBiometric, loginBiometric } from "../lib/webauthn";
import { Fingerprint } from "lucide-react";

import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { setDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);
  const savedBiometricEmail = localStorage.getItem("saved_biometric_email");
  const savedBiometricPass = localStorage.getItem("saved_biometric_pass");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in firestore
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      let role = 'user';
      if (!docSnap.exists()) {
        // Create new user profile if first time
        const newProfile = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userCredential.user.displayName || 'User',
          phone: userCredential.user.phoneNumber || '',
          role: userCredential.user.email === "fitopatner@gmail.com" ? "superadmin" : "user",
          status: "active",
          plan: "trial",
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
      } else {
        role = docSnap.data().role || 'user';
        // Ensure phone number is updated if it wasn't there but we have it now
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
      setError("Gagal login dengan Google: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await loginBiometric();
      const email = localStorage.getItem("saved_biometric_email");
      const pass = atob(localStorage.getItem("saved_biometric_pass") || "");
      if (email && pass) {
        await signInWithEmailAndPassword(auth, email, pass);
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError("Autentikasi biometrik gagal atau dibatalkan.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get role
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      
      let role = 'user';
      if (docSnap.exists()) {
        role = docSnap.data().role;
        // Auto-upgrade if it's the owner's email but not superadmin yet
        if (email === "fitopatner@gmail.com" && role !== "superadmin") {
          role = "superadmin";
          await setDoc(docRef, { role: "superadmin" }, { merge: true });
        }
      }

      if (role === 'superadmin') {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Email atau password salah. Pastikan Anda sudah mendaftar.");
      } else {
        setError("Terjadi kesalahan saat login: " + err.message);
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
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Atur Dana, Capai Impian. Silakan login ke akun Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 font-medium text-center">
                  {error}
                </motion.div>
              )}
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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold leading-none text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              </div>

              {isWebAuthnSupported() && !savedBiometricPass && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useBiometric"
                    checked={useBiometric}
                    onChange={(e) => setUseBiometric(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="useBiometric" className="text-sm text-slate-600 dark:text-slate-400">
                    Gunakan Sidik Jari/FaceID untuk login berikutnya
                  </label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-900/20 rounded-xl py-6 text-base font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Masuk ke Dashboard"}
              </Button>

              {savedBiometricPass && (
                <Button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-emerald-900/50 dark:hover:bg-emerald-900/80 text-white shadow-lg rounded-xl py-6 text-base font-semibold transition-all hover:-translate-y-0.5 mt-4"
                  disabled={loading}
                >
                  <Fingerprint className="w-6 h-6 mr-2" />
                  {loading ? "Memverifikasi..." : "Login dengan Biometrik"}
                </Button>
              )}

            
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
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-[#059669] font-bold hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
