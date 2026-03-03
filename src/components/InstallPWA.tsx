import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Sparkles, CheckCircle } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay to not annoy immediately
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100]"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-indigo-600 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Smartphone className="w-24 h-24 rotate-12" />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg leading-tight">Install Our App</h3>
                  <p className="text-indigo-100 text-xs font-bold">Fast & Secure Access</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPrompt(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold">Instant Access from Home Screen</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold">Faster Loading & Data Saving</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold">Exclusive Mobile Notifications</span>
                </div>
              </div>

              <button
                onClick={handleInstall}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                INSTALL NOW
              </button>
              
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                Works on Android & iOS
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
