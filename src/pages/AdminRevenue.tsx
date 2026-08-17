import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, DollarSign, CreditCard, Users, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', pendapatan: 4500000, transaksi: 30 },
  { name: 'Feb', pendapatan: 5200000, transaksi: 42 },
  { name: 'Mar', pendapatan: 7800000, transaksi: 58 },
  { name: 'Apr', pendapatan: 6100000, transaksi: 48 },
  { name: 'Mei', pendapatan: 8900000, transaksi: 72 },
  { name: 'Jun', pendapatan: 12500000, transaksi: 95 },
];

export function AdminRevenue() {
  const [period, setPeriod] = useState("6bulan");

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Penghasilan</h1>
          <p className="text-sm text-emerald-100 max-w-xl mt-1 opacity-90">Pantau pertumbuhan pendapatan dan analisis transaksi dari paket langganan.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 px-4 py-2.5 rounded-xl font-bold focus:outline-none focus:border-[#059669]"
          >
            <option value="1bulan">1 Bulan Terakhir</option>
            <option value="6bulan">6 Bulan Terakhir</option>
            <option value="1tahun">1 Tahun Terakhir</option>
          </select>
          <button className="bg-white text-[#059669] p-2.5 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
             <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg rounded-[2rem] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
               <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[#059669]">
                  <DollarSign className="w-7 h-7" />
               </div>
               <span className="text-sm font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">+12.5%</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white">Rp 45.000.000</h3>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg rounded-[2rem] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
               <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                  <CreditCard className="w-7 h-7" />
               </div>
               <span className="text-sm font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">+8.2%</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Transaksi PRO</p>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white">345</h3>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg rounded-[2rem] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
               <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600">
                  <Users className="w-7 h-7" />
               </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pengguna Aktif PRO</p>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white">280</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg rounded-[2.5rem] overflow-hidden">
         <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-bold">Grafik Pertumbuhan Pendapatan</CardTitle>
         </CardHeader>
         <CardContent className="p-8 h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `Rp ${val/1000000}Jt`} dx={-10} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                     formatter={(value: any, name: string) => {
                        if (name === 'pendapatan') return [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan'];
                        return [value, 'Transaksi'];
                     }}
                  />
                  <Area type="monotone" dataKey="pendapatan" stroke="#059669" strokeWidth={4} fillOpacity={1} fill="url(#colorPendapatan)" />
               </AreaChart>
            </ResponsiveContainer>
         </CardContent>
      </Card>
    </div>
  )
}
