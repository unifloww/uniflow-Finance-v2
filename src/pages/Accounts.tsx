import React, { useState } from "react";
import { useData, Account } from "../contexts/DataContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { formatCurrency } from "../lib/utils";
import { Wallet, Plus, CreditCard, Landmark, Banknote, X, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PROVIDERS = [
  // BUMN Banks
  { id: "mandiri", name: "Mandiri", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_of_Bank_Mandiri.svg" },
  { id: "bri", name: "BRI", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/BRI_2020.svg" },
  { id: "bni", name: "BNI", logo: "https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg" },
  { id: "btn", name: "BTN", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Bank_BTN_logo.svg" },
  { id: "bsi", name: "BSI", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Logo_BSI.svg" },
  
  // Private Banks
  { id: "bca", name: "BCA", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" },
  { id: "cimb", name: "CIMB Niaga", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/CIMB_Niaga_logo.svg" },
  { id: "permata", name: "PermataBank", logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/PermataBank_logo.svg" },
  { id: "danamon", name: "Danamon", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Bank_Danamon_logo.svg" },
  { id: "panin", name: "PaninBank", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/PaninBank_logo.svg" },
  { id: "mega", name: "Bank Mega", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Bank_Mega_logo.svg" },
  
  // Digital Banks
  { id: "jenius", name: "Jenius", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Jenius_logo.svg" },
  { id: "seabank", name: "SeaBank", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/SeaBank_logo.svg" },
  { id: "jago", name: "Bank Jago", logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/Bank_Jago_logo.svg" },
  { id: "blu", name: "blu", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Blu_by_BCA_Digital_logo.svg" },

  // E-Wallets
  { id: "gopay", name: "GoPay", logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg" },
  { id: "ovo", name: "OVO", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_OVO.svg" },
  { id: "dana", name: "DANA", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" },
  { id: "shopeepay", name: "ShopeePay", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee_Pay_logo.svg" },
  { id: "linkaja", name: "LinkAja", logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja_logo.svg" },
  
  { id: "other", name: "Lainnya / Uang Tunai", logo: null }
];

export function Accounts() {
  const { accounts, addAccount, editAccount, deleteAccount, hideBalances, toggleHideBalances } = useData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [type, setType] = useState<"bank" | "wallet" | "cash">("bank");
  const [provider, setProvider] = useState("other");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#059669");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setType("bank");
    setProvider("other");
    setBalance("");
    setColor("#059669");
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEditClick = (acc: Account) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setProvider(acc.provider || "other");
    setBalance(acc.balance.toString());
    setColor(acc.color || "#059669");
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    if (editingId) {
      editAccount(editingId, {
        name,
        type,
        provider: provider !== "other" ? provider : null,
        balance: parseFloat(balance),
        color,
      });
    } else {
      addAccount({
        name,
        type,
        provider: provider !== "other" ? provider : null,
        balance: parseFloat(balance),
        color,
      });
    }

    resetForm();
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Akun & Dompet
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Kelola rekening bank, e-wallet, dan uang tunai Anda.
          </p>
        </div>
        <Button
          onClick={() => {
            if (showAddForm) resetForm();
            else {
              resetForm();
              setShowAddForm(true);
            }
          }}
          className="bg-gradient-to-r from-[#059669] to-teal-600 hover:from-[#047857] hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-500/20 transition-all border-0"
        >
          {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showAddForm ? "Batal" : "Tambah Akun"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-4">
          <Card className="rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Saldo Seluruh Akun
                  </h2>
                  <button onClick={toggleHideBalances} className="text-slate-500 dark:text-slate-400 hover:text-[#059669] transition-colors">
                    {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {hideBalances ? "Rp •••••••" : formatCurrency(totalBalance)}
                </div>
              </div>
              <div className="hidden sm:flex h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 items-center justify-center shadow-inner border border-emerald-100 dark:border-emerald-900">
                <Wallet className="h-10 w-10 text-[#059669]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} className="md:col-span-4 origin-top">
              <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden mb-2">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50/50 border-b border-slate-50">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">{editingId ? "Edit Akun" : "Tambah Akun Baru"}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Penyedia Layanan (Bank/E-Wallet)</label>
                        <select
                          value={provider}
                          onChange={(e) => {
                            setProvider(e.target.value);
                            // Auto-set type and name hint based on provider
                            const p = PROVIDERS.find(x => x.id === e.target.value);
                            if (p && p.id !== "other") {
                              if (["bca", "mandiri", "bri", "bni", "btn", "bsi", "cimb", "permata", "danamon", "panin", "mega", "jenius", "seabank", "jago", "blu"].includes(p.id)) {
                                setType("bank");
                              } else {
                                setType("wallet");
                              }
                              if (!name || name === PROVIDERS.find(oldP => oldP.id === provider)?.name) setName(p.name);
                            }
                          }}
                          className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                        >
                          <optgroup label="Bank BUMN">
                            <option value="mandiri">Mandiri</option>
                            <option value="bri">BRI</option>
                            <option value="bni">BNI</option>
                            <option value="btn">BTN</option>
                            <option value="bsi">BSI (Bank Syariah Indonesia)</option>
                          </optgroup>
                          <optgroup label="Bank Swasta">
                            <option value="bca">BCA</option>
                            <option value="cimb">CIMB Niaga</option>
                            <option value="permata">PermataBank</option>
                            <option value="danamon">Danamon</option>
                            <option value="panin">PaninBank</option>
                            <option value="mega">Bank Mega</option>
                          </optgroup>
                          <optgroup label="Bank Digital">
                            <option value="jenius">Jenius</option>
                            <option value="seabank">SeaBank</option>
                            <option value="jago">Bank Jago</option>
                            <option value="blu">blu by BCA Digital</option>
                          </optgroup>
                          <optgroup label="E-Wallet">
                            <option value="gopay">GoPay</option>
                            <option value="ovo">OVO</option>
                            <option value="dana">DANA</option>
                            <option value="shopeepay">ShopeePay</option>
                            <option value="linkaja">LinkAja</option>
                          </optgroup>
                          <optgroup label="Lainnya">
                            <option value="other">Lainnya / Uang Tunai</option>
                          </optgroup>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Akun Pribadi</label>
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Contoh: BCA Utama, Dana Darurat"
                          required
                          className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jenis Akun</label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value as any)}
                          className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                        >
                          <option value="bank">Rekening Bank</option>
                          <option value="wallet">E-Wallet</option>
                          <option value="cash">Uang Tunai</option>
                        </select>
                      </div>

                      
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Warna Dompet</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {['#059669', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setColor(c)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent hover:scale-110'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <div className="relative">
                            <input 
                              type="color" 
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden appearance-none"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Saldo {editingId ? "Saat Ini (Rp)" : "Awal (Rp)"}
                        </label>
                        <Input
                          type="number"
                          value={balance}
                          onChange={(e) => setBalance(e.target.value)}
                          placeholder="0"
                          required
                          min="0"
                          className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="rounded-xl font-medium"
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#059669] to-teal-500 text-white hover:from-[#047857] hover:to-teal-600 shadow-xl shadow-emerald-500/30 rounded-xl font-bold px-8"
                      >
                        {editingId ? "Simpan Perubahan" : "Simpan Akun"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {accounts.map((acc, i) => {
          const providerInfo = PROVIDERS.find(p => p.id === acc.provider);

          return (
            <motion.div key={acc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="md:col-span-1 sm:col-span-2">
              <Card
                className="rounded-[2rem] border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 h-full relative group overflow-hidden"
                style={{
                  background: acc.color 
                    ? `linear-gradient(135deg, ${acc.color}dd, ${acc.color})` 
                    : 'linear-gradient(135deg, #059669dd, #046a4e)',
                  color: 'white'
                }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />
                
                {confirmDeleteId === acc.id && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md px-4">
                    <p className="text-sm font-bold text-white text-center mb-4">Hapus akun ini?</p>
                    <div className="flex gap-2 w-full justify-center">
                      <Button size="sm" variant="outline" className="rounded-xl border-white/20 text-slate-800 hover:text-slate-900 bg-white" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
                      <Button size="sm" className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-0" onClick={() => { deleteAccount(acc.id); setConfirmDeleteId(null); }}>Hapus</Button>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:text-emerald-100 hover:bg-black/20 rounded-full bg-black/10 backdrop-blur-sm shadow-sm border border-white/10"
                    onClick={() => handleEditClick(acc)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:text-rose-200 hover:bg-black/20 rounded-full bg-black/10 backdrop-blur-sm shadow-sm border border-white/10"
                    onClick={() => setConfirmDeleteId(acc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-6">
                  {providerInfo?.logo ? (
                     <div className="h-8 w-16 bg-white/20 backdrop-blur-sm rounded-lg p-1.5 flex items-center justify-center border border-white/30 shadow-sm">
                       <img src={providerInfo.logo} alt={providerInfo.name} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.parentElement) { e.currentTarget.parentElement.innerHTML = '<span class="text-xs font-bold text-slate-500 dark:text-slate-400">' + providerInfo.name.substring(0,3).toUpperCase() + '</span>' } }} />
                     </div>
                  ) : (
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-white/20 backdrop-blur-sm border border-white/30">
                      {acc.type === "bank" ? (
                        <Landmark className="h-5 w-5" />
                      ) : acc.type === "wallet" ? (
                        <CreditCard className="h-5 w-5" />
                      ) : (
                        <Banknote className="h-5 w-5" />
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-4 pb-6">
                  <CardTitle className="text-base font-bold text-white line-clamp-1 mb-1 pr-10 drop-shadow-sm">
                    {acc.name}
                  </CardTitle>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-wide mb-3">
                    {acc.type}
                  </p>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {hideBalances ? "Rp •••••••" : formatCurrency(acc.balance)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
