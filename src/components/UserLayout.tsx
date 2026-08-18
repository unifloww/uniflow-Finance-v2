import React, { useState, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Target, 
  PieChart, 
  LogOut,
  User,
  Plus,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  Menu,
  Lock,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { useData } from '../contexts/DataContext';

export function UserLayout() {
  const { userProfile, logout, updateProfile } = useAuth();
  const { syncStatus } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isTrialExpired = useMemo(() => {
    if (userProfile?.role === 'superadmin') return false;
    if (userProfile?.plan === 'trial' && userProfile?.createdAt) {
      const createdAt = new Date(userProfile.createdAt).getTime();
      const now = new Date().getTime();
      const diffDays = (now - createdAt) / (1000 * 3600 * 24);
      return diffDays > 3;
    }
    // For users without createdAt/plan, mock that they are active for now or handle appropriately
    return false;
  }, [userProfile]);

  const trialRemaining = useMemo(() => {
    if (userProfile?.role === 'superadmin') return null;
    if (userProfile?.plan === 'trial' && userProfile?.createdAt && !isTrialExpired) {
      const createdAt = new Date(userProfile.createdAt).getTime();
      const now = new Date().getTime();
      const trialDuration = 3 * 24 * 3600 * 1000; // 3 days
      const endsAt = createdAt + trialDuration;
      const diffMs = endsAt - now;
      if (diffMs <= 0) return null;
      
      const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 3600 * 24)) / (1000 * 3600));
      return { days: diffDays, hours: diffHours };
    }
    return null;
  }, [userProfile, isTrialExpired]);

  const handleUpgrade = () => {
    navigate('/dashboard/profile#pricing');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/dashboard/transactions', icon: ArrowRightLeft },
    { name: 'Akun', path: '/dashboard/accounts', icon: Wallet },
    { name: 'Impian', path: '/dashboard/goals', icon: Target },
    { name: 'Analitik', path: '/dashboard/analytics', icon: PieChart },
    { name: 'Profil', path: '/dashboard/profile', icon: User },
  ];

  const renderSyncIndicator = (isMobile = false) => {
    if (syncStatus === 'syncing') {
      return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-100 lg:bg-amber-500/10 lg:text-amber-600 lg:dark:text-amber-400 border border-amber-500/30 lg:border-amber-500/20 text-[10px] font-bold tracking-wide uppercase`}>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className={isMobile ? "hidden" : "hidden sm:inline"}>Menyinkronkan</span>
        </div>
      );
    }
    if (syncStatus === 'offline') {
      return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-100 lg:bg-rose-500/10 lg:text-rose-600 lg:dark:text-rose-400 border border-rose-500/30 lg:border-rose-500/20 text-[10px] font-bold tracking-wide uppercase`}>
          <CloudOff className="h-3 w-3" />
          <span className={isMobile ? "hidden" : "hidden sm:inline"}>Lokal</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-100 lg:bg-[#059669]/10 lg:text-[#059669] lg:dark:text-emerald-400 border border-emerald-500/30 lg:border-[#059669]/20 text-[10px] font-bold tracking-wide uppercase`}>
        <CheckCircle2 className="h-3 w-3" />
        <span className={isMobile ? "hidden" : "hidden sm:inline"}>Tersinkronisasi</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#059669] pb-16 lg:pb-0">
      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-[#10b981] lg:bg-[#059669] transition-all duration-300 z-30 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className={`flex h-32 items-center justify-center border-b border-[#10b981] ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20White.png?alt=media&token=ed8e2972-f297-4861-9920-c8145506122d" alt="UniFlow" className={`w-auto object-contain drop-shadow-xl hover:scale-105 transition-all cursor-pointer ${isSidebarCollapsed ? 'h-10 sm:h-12' : 'h-24 sm:h-28'}`} />
          
        </div>
        
        <div className="flex h-[calc(100vh-8rem)] flex-col justify-between p-4">
          <nav className="space-y-2 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center rounded-full py-3.5 text-sm font-semibold transition-all ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-5'} ${
                    isActive 
                      ? 'text-[#059669]' 
                      : 'text-emerald-50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-full shadow-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center ${isSidebarCollapsed ? 'space-x-0' : 'space-x-3'}`}>
                    <Icon className="h-5 w-5" />
                    {!isSidebarCollapsed && <span>{item.name}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>
          
          <div className="border-t border-[#10b981] pt-4">
            {!isSidebarCollapsed && (
              <div className="mb-4 px-4 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userProfile?.name}</p>
              </div>
            )}
            
            {!isSidebarCollapsed && trialRemaining && (
              <div className="mb-4 px-4">
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <div className="text-[10px] text-emerald-100 mb-2 font-medium leading-relaxed">
                     Sisa Trial: <span className="font-bold text-white text-xs">{trialRemaining.days} hr {trialRemaining.hours} jm</span>
                  </div>
                  <button 
                     onClick={handleUpgrade}
                     className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] uppercase tracking-wider font-bold rounded-lg shadow-md transition-colors"
                  >
                     Upgrade PRO
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`flex w-full items-center rounded-full py-3 text-sm font-bold text-white bg-rose-500/10 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-5'}`}
            >
              <LogOut className="h-5 w-5" />
              {!isSidebarCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-20 lg:pt-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Mobile Header */}
        <header className="fixed top-0 inset-x-0 z-50 flex h-20 items-center justify-between border-b border-[#10b981] bg-[#059669] px-4 py-2 lg:hidden shadow-md">
          <div className="flex items-center">
            <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20White.png?alt=media&token=ed8e2972-f297-4861-9920-c8145506122d" alt="UniFlow" className="h-16 w-auto max-w-[200px] object-contain drop-shadow-md scale-125 origin-left ml-2" />
          </div>
          <div className="flex items-center space-x-2">
            {renderSyncIndicator(true)}
            <ThemeToggle />
                             <Link to="/dashboard/profile" className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
              <span className="text-white text-xs font-bold">
                {userProfile?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </Link>
            <button onClick={(e) => { e.preventDefault(); handleLogout(); }} className="text-white bg-rose-500 hover:bg-rose-600 p-2 rounded-full shadow-md transition-colors z-50 relative cursor-pointer">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-10 h-16 items-center justify-between bg-transparent px-8 mt-2">
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center bg-[#059669] shadow-sm border border-[#10b981]"
           >
             <Menu className="h-5 w-5" />
           </button>
           <div className="flex items-center gap-3">
           {renderSyncIndicator(false)}
           <ThemeToggle />
           <Link to="/dashboard/profile" className="text-sm font-bold text-white bg-[#059669] px-4 py-2 rounded-full shadow-sm border border-[#10b981] hover:bg-white dark:bg-slate-900 hover:text-[#059669] transition-colors flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white dark:bg-slate-900 text-[#059669] flex items-center justify-center text-xs font-bold">
                {userProfile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              Halo, {userProfile?.name}
           </Link>
           </div>
        </header>

        

        <div className="flex-1 p-4 sm:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#10b981] bg-[#059669] shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] lg:hidden px-1 pb-safe">
        {navItems.map((item) => {
          // Now showing all 6 icons
          
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full pt-1 ${
                isActive ? 'text-white' : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute top-0 w-12 h-1 bg-white rounded-b-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`flex items-center justify-center p-1.5 rounded-full ${isActive ? 'bg-black/10' : ''} transition-colors`}>
                <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-white drop-shadow-md' : 'text-emerald-200/80'}`} />
              </div>
              <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-white drop-shadow-md' : 'text-emerald-200/80'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard/transactions', { state: { openAdd: true } })}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 h-14 w-14 bg-emerald-100 hover:bg-white text-[#047857] rounded-full shadow-xl shadow-emerald-900/40 flex items-center justify-center z-50 transition-colors"
      >
        <Plus className="h-6 w-6 font-bold" />
      </motion.button>

      {/* Trial Expired Overlay */}
      {isTrialExpired && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[2rem] p-8 shadow-2xl text-center relative overflow-hidden"
          >
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Waktu Uji Coba Habis</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Masa trial 3 hari Anda telah berakhir. Untuk terus menikmati semua fitur cerdas dari Uniflow, silakan upgrade ke akun PRO.
            </p>
            <div className="space-y-3">
              <Button onClick={handleUpgrade} className="w-full bg-[#059669] hover:bg-[#047857] text-white py-6 rounded-xl text-base font-bold shadow-lg shadow-emerald-900/20">
                Upgrade ke PRO Sekarang
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full py-6 rounded-xl text-slate-500 font-bold border-slate-200 dark:border-slate-800">
                Keluar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
