import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0C381E]/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="relative bg-white border border-emerald-200 w-full max-w-sm overflow-hidden flex flex-col shadow-2xl rounded-3xl z-10 p-6 text-center"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100 shadow-inner">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-black uppercase tracking-tight text-[#0C381E] mb-1">{title}</h3>
            <p className="text-xs text-gray-500 font-medium mb-6 px-2">{message}</p>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 rounded-xl text-xs uppercase transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs uppercase transition-all active:scale-95 shadow-md shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
