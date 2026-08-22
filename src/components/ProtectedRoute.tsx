import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin' | 'superadmin')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState('');

  const forceRecover = async () => {
    if (!currentUser) return;
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await updateDoc(doc(db, "users", currentUser.uid), { status: 'active', role: 'superadmin' });
      window.location.reload();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
    }
  };

  useEffect(() => {
    // FORCE RECOVERY FOR ADMIN
    if (userProfile?.status === 'suspended' && currentUser?.email === 'fitrianto720@gmail.com') {
      forceRecover();
    }
  }, [userProfile, currentUser]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the automated recovery didn't trigger, let's just let the specific admin bypass it
  if (userProfile.status === 'suspended' && currentUser?.email !== 'fitrianto720@gmail.com') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Akun Ditangguhkan</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Akun Anda sedang ditangguhkan. Silakan hubungi administrator.</p>
        {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
        <button onClick={forceRecover} className="px-4 py-2 mt-4 bg-indigo-600 text-white rounded-xl">Coba Pulihkan</button>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // Redirect to appropriate dashboard based on role
    if (userProfile.role === 'superadmin' || userProfile.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

