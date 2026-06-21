import { createContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'Are you sure?',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: false,
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    setModalState({
      isOpen: true,
      title: options.title || 'Are you sure?',
      message: options.message || '',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      isDestructive: options.isDestructive || false,
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    if (resolverRef.current) {
      resolverRef.current(true);
    }
    closeModal();
  };

  const handleCancel = () => {
    if (resolverRef.current) {
      resolverRef.current(false);
    }
    closeModal();
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    resolverRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {/* Confirmation Modal Render */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={handleCancel}
          />
          
          {/* Dialog Container */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all animate-zoom-in text-slate-900">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                modalState.isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {modalState.isDestructive ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <HelpCircle className="h-6 w-6" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-950">{modalState.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {modalState.message}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {modalState.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition cursor-pointer shadow-xs ${
                  modalState.isDestructive 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-zoom-in {
          animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ConfirmContext.Provider>
  );
};
