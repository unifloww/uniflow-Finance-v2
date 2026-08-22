import React, { useState } from 'react';
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
  Search,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { useData } from '../contexts/DataContext';

export function AdminLayout() {
  const { userProfile, logout } = useAuth();
  const [globalSearch, setGlobalSearch] = useState("");

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/admin/users?q=${encodeURIComponent(globalSearch)}`);
      setGlobalSearch("");
    }
  };
  const { syncStatus } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manajemen User", path: "/admin/users", icon: User },
    { name: "Harga & Paket", path: "/admin/pricing", icon: CreditCard },
    { name: "Penghasilan", path: "/admin/revenue", icon: DollarSign },
    { name: "Pembayaran", path: "/admin/upgrades", icon: CreditCard },
    { name: "Profil Admin", path: "/admin/profile", icon: User },
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
            <button
              onClick={handleLogout}
              className={`flex w-full items-center rounded-full py-3 text-sm font-semibold text-emerald-50 hover:bg-rose-50 dark:bg-rose-950/50 hover:text-white transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-5'}`}
            >
              <LogOut className="h-5 w-5" />
              {!isSidebarCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex h-28 items-center justify-between border-b border-[#10b981] bg-[#059669] px-4 py-2 lg:hidden">
          <div className="flex items-center">
            <img src="https://firebasestorage.googleapis.com/v0/b/uniflow/o/Uniflow%20White.png?alt=media&token=ed8e2972-f297-4861-9920-c8145506122d" alt="UniFlow" className="h-20 w-auto max-w-[180px] object-contain drop-shadow-md" />
          </div>
          <div className="flex items-center space-x-2">
            {renderSyncIndicator(true)}
            <ThemeToggle />
                             <Link to="/admin/dashboard" className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
              <span className="text-white text-xs font-bold">
                {userProfile?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </Link>
            <button onClick={handleLogout} className="text-emerald-100 hover:text-rose-400 p-2 rounded-full hover:bg-white/10 transition-colors">
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
           
           {/* Global Search Bar */}
           <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md mx-4 relative hidden sm:block">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-emerald-100" />
             </div>
             <input
               type="text"
               value={globalSearch}
               onChange={(e) => setGlobalSearch(e.target.value)}
               className="block w-full pl-10 pr-3 py-2 border border-[#10b981] rounded-full leading-5 bg-[#059669] text-white placeholder-emerald-100 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:border-white sm:text-sm transition-colors shadow-sm"
               placeholder="Cari user berdasarkan nama atau email..."
             />
           </form>
           <div className="flex items-center gap-3">
           {renderSyncIndicator(false)}
           <ThemeToggle />
           <Link to="/admin/dashboard" className="text-sm font-bold text-white bg-[#059669] px-4 py-2 rounded-full shadow-sm border border-[#10b981] hover:bg-white dark:bg-slate-900 hover:text-[#059669] transition-colors flex items-center gap-2">
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
          if (item.name === 'Analitik') return null; // Sembunyikan analitik di mobile agar muat 5 icon
          
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-[20%] h-full pt-1 ${
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
              <span className={`text-[10px] font-bold ${isActive ? 'text-white drop-shadow-md' : 'text-emerald-200/80'}`}>
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
        onClick={() => navigate('/admin/users')}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 h-14 w-14 bg-emerald-100 hover:bg-white text-[#047857] rounded-full shadow-xl shadow-emerald-900/40 flex items-center justify-center z-50 transition-colors"
      >
        <Plus className="h-6 w-6 font-bold" />
      </motion.button>
    </div>
  );
}
