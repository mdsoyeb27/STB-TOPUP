import React, { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  isBottomSheet?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  maxWidth = 'max-w-md',
  isBottomSheet = true 
}) => {
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[100] flex ${isBottomSheet ? 'items-end md:items-center' : 'items-center'} justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm`}>
          {/* Backdrop for closing */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={isBottomSheet ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            animate={isBottomSheet ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isBottomSheet ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag={isBottomSheet ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className={`relative bg-white w-full ${maxWidth} ${isBottomSheet ? 'rounded-t-[2.5rem] md:rounded-[2.5rem]' : 'rounded-[2.5rem] mx-4'} shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]`}
          >
            {/* Drag Handle for Mobile */}
            {isBottomSheet && (
              <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />
            )}

            {/* Header */}
            <div className="px-8 pt-6 pb-2 flex items-center justify-between shrink-0">
              {title && <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>}
              <button 
                onClick={onClose}
                className="p-3 md:p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 ml-auto"
                aria-label="Close"
              >
                <X className="w-6 h-6 md:w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 pb-10 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
