import { createContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
  const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast]);
  const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 backdrop-blur-md border-emerald-500/20 text-emerald-800',
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-500/10 backdrop-blur-md border-rose-500/20 text-rose-800',
          icon: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 backdrop-blur-md border-amber-500/20 text-amber-800',
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
        };
      default:
        return {
          bg: 'bg-sky-500/10 backdrop-blur-md border-sky-500/20 text-sky-800',
          icon: <Info className="h-5 w-5 text-sky-600 flex-shrink-0" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info, showToast, dismissToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 w-full p-4 rounded-2xl border shadow-lg transition-all duration-300 animate-slide-in ${styles.bg}`}
            >
              {styles.icon}
              <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition flex-shrink-0 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Embedded Slide-in Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
