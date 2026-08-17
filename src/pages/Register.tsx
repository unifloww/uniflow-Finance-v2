import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUser = {
        id: email, // Use email as mock ID
        email: email,
        name: name,
        role: "user" as const,
        status: "active" as const,
        plan: "trial" as const,
        createdAt: new Date().toISOString(),
      };
      
      const dbStr = localStorage.getItem("uniflow_users_db");
      const db = dbStr ? JSON.parse(dbStr) : {};
      db[email] = mockUser;
      localStorage.setItem("uniflow_users_db", JSON.stringify(db));

      localStorage.setItem("uniflow_user", JSON.stringify(mockUser));
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError("Gagal mendaftar. Silakan coba lagi.");
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
              Daftar Akun Baru
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Buat akun untuk mulai mengatur keuangan Anda.
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
              </div>
              <Button
                type="submit"
                className="w-full bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-900/20 rounded-xl py-6 text-base font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </form>
          </CardContent>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
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
