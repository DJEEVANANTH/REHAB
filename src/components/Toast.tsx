import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => toast('success', msg), [toast]);
  const error = useCallback((msg: string) => toast('error', msg), [toast]);
  const info = useCallback((msg: string) => toast('info', msg), [toast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {toasts.map(t => {
            let icon = <Info className="w-5 h-5 text-blue-500" />;
            let borderStyle = 'border-blue-500/20 bg-blue-500/10 text-blue-100';

            if (t.type === 'success') {
              icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
              borderStyle = 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100';
            } else if (t.type === 'error') {
              icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
              borderStyle = 'border-rose-500/20 bg-rose-500/10 text-rose-100';
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl pointer-events-auto ${borderStyle}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-grow text-xs font-semibold leading-relaxed">{t.message}</div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
