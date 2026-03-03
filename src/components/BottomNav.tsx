import React from 'react';
import { Home, Wallet, History, Headphones, User } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  view: string;
  setView: (view: any) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function BottomNav({ view, setView, setIsSidebarOpen }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'add-money', label: 'Wallet', icon: Wallet },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'profile', label: 'Account', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-3 pb-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-1 transition-all duration-300"
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'text-indigo-600 opacity-100' : 'text-slate-400 opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
