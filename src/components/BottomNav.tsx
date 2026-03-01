import React from 'react';
import { Home, BookOpen, Wallet, Headphones, User } from 'lucide-react';

interface BottomNavProps {
  view: string;
  setView: (view: any) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function BottomNav({ view, setView, setIsSidebarOpen }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <button 
        onClick={() => setView('home')}
        className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      
      <button 
        onClick={() => setView('add-money')}
        className={`flex flex-col items-center gap-1 ${view === 'add-money' ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] font-bold">Add Money</span>
      </button>

      <button 
        onClick={() => setView('my-orders')}
        className={`flex flex-col items-center gap-1 ${view === 'my-orders' ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-[10px] font-bold">My Orders</span>
      </button>

      <button 
        onClick={() => window.open('https://t.me/rrrtopup', '_blank')}
        className="flex flex-col items-center gap-1 text-slate-400"
      >
        <Headphones className="w-5 h-5" />
        <span className="text-[10px] font-bold">Support</span>
      </button>

      <button 
        onClick={() => setView('profile')}
        className={`flex flex-col items-center gap-1 ${view === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold">My Account</span>
      </button>
    </div>
  );
}
