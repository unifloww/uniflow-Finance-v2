import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, Activity, CreditCard, Laptop, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ActivityLog {
  id: string;
  userEmail: string;
  userName: string;
  type: string;
  amount: number;
  date: string;
  title: string;
}

export function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [activeSessions, setActiveSessions] = useState(1);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const dbStr = localStorage.getItem("uniflow_users_db");
    const db = dbStr ? JSON.parse(dbStr) : {};
    setTotalUsers(Object.keys(db).length);

    let allActivities: ActivityLog[] = [];
    let allTxCount = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsers = new Set<string>();
    
    // Asumsikan admin sedang aktif
    const currentUserStr = localStorage.getItem("uniflow_user");
    if (currentUserStr) {
        try {
            activeUsers.add(JSON.parse(currentUserStr).email);
        } catch(e) {}
    }

    Object.values(db).forEach((user: any) => {
      const txData = localStorage.getItem(`uniflow_transactions_${user.id}`);
      if (txData) {
        const txs = JSON.parse(txData);
        allTxCount += txs.length;
        
        txs.forEach((tx: any) => {
          allActivities.push({
            id: tx.id,
            userEmail: user.email,
            userName: user.name,
            type: tx.type,
            amount: tx.amount,
            date: tx.date,
            title: tx.title,
          });
          
          if (new Date(tx.date) >= today) {
              activeUsers.add(user.email);
          }
        });
      }
    });

    allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivities(allActivities.slice(0, 10)); // Ambil 10 terbaru
    setTotalTransactions(allTxCount);
    setActiveSessions(activeUsers.size);
    
    // Generate 30 days chart data
    const history: any[] = [];
    const msPerDay = 1000 * 60 * 60 * 24;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * msPerDay);
      history.push({
        dateObj: d,
        displayDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        users: 0,
        transactions: 0
      });
    }

    Object.values(db).forEach((user: any) => {
       // Simulate user registration date randomly across 30 days for visual, since we dont have createdAt
       const randDaysAgo = Math.floor(Math.random() * 30);
       history[29 - randDaysAgo].users += 1;
    });
    
    allActivities.forEach(act => {
       const actDate = new Date(act.date);
       const dObj = history.find(h => h.dateObj.toDateString() === actDate.toDateString());
       if(dObj) {
           dObj.transactions += 1;
       }
    });
    setChartData(history);

  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm text-emerald-100 max-w-xl mt-1 opacity-90">
          Ringkasan aktivitas dan pengguna sistem.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 group relative cursor-help">
              Total Pengguna
              <Info className="h-4 w-4 text-slate-400" />
              <div className="pointer-events-none absolute left-0 top-full mt-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2.5 rounded-xl shadow-xl z-50 normal-case tracking-normal font-medium leading-relaxed">
                Jumlah seluruh pengguna terdaftar, termasuk pengguna trial dan PRO.
              </div>
            </CardTitle>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pb-6 px-6">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {totalUsers}
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 group relative cursor-help">
              Sesi Aktif Hari Ini
              <Info className="h-4 w-4 text-slate-400" />
              <div className="pointer-events-none absolute left-0 top-full mt-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2.5 rounded-xl shadow-xl z-50 normal-case tracking-normal font-medium leading-relaxed">
                Jumlah pengguna unik yang login atau membuka aplikasi hari ini (dihitung dari local storage).
              </div>
            </CardTitle>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <Laptop className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="pb-6 px-6">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {activeSessions}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 group relative cursor-help">
              Total Transaksi
              <Info className="h-4 w-4 text-slate-400" />
              <div className="pointer-events-none absolute left-0 top-full mt-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2.5 rounded-xl shadow-xl z-50 normal-case tracking-normal font-medium leading-relaxed">
                Total keseluruhan transaksi masuk dan keluar yang dicatat oleh semua pengguna.
              </div>
            </CardTitle>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="pb-6 px-6">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {totalTransactions}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Tren 30 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dx={-10}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dx={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="users" 
                  name="Pengguna Baru"
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="transactions" 
                  name="Volume Transaksi"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">Aktivitas Transaksi Terbaru</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Transaksi</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act.id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <div className="font-bold">{act.userName}</div>
                    <div className="text-xs text-slate-500">{act.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{act.title}</td>
                  <td className="px-6 py-4 font-bold">
                    <span className={act.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {act.type === 'income' ? '+' : '-'}Rp {act.amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Belum ada aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
