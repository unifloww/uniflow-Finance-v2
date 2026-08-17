import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { Button } from './ui/button';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone || 
                             document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return;
    }

    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Standard PWA install event for Android/Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt if not already dismissed in this session
      if (!sessionStorage.getItem('installPromptDismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we just show a custom banner after a short delay since it doesn't fire beforeinstallprompt
    if (isIOSDevice && !sessionStorage.getItem('installPromptDismissed')) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
        >
          <button 
            onClick={dismissPrompt}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#059669] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/20">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pasang Aplikasi UniFlow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {isIOS 
                  ? "Akses lebih cepat! Tap ikon Share lalu pilih 'Add to Home Screen'."
                  : "Pasang aplikasi UniFlow di perangkat Anda untuk akses lebih cepat dan pengalaman layar penuh tanpa browser."}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            {!isIOS ? (
              <Button onClick={handleInstallClick} className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2 h-auto rounded-lg shadow-md">
                Instal Sekarang
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-lg w-full">
                <Share className="h-4 w-4" /> Share &gt; <PlusSquare className="h-4 w-4" /> Add to Home Screen
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
