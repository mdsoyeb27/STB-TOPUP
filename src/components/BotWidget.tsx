import React, { useState, useEffect, useRef } from 'react';
import { useBot } from '../context/BotContext';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BotWidget = () => {
  const { messages, clearMessages } = useBot();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastReadCount = useRef(0);

  useEffect(() => {
    if (messages.length > lastReadCount.current) {
      if (!isOpen) {
        setUnreadCount(messages.length - lastReadCount.current);
      } else {
        lastReadCount.current = messages.length;
      }
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      lastReadCount.current = messages.length;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertOctagon className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px]"
          >
            <div className="bg-slate-900 p-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-white">Admin Bot Live Feed</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={clearMessages}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-sm">
                  No new notifications.
                  <br />
                  Bot is listening...
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex gap-3"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getIcon(msg.type)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-snug">{msg.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleOpen}
        className="relative bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default BotWidget;
