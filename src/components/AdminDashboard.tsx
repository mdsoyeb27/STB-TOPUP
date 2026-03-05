import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, Clock, Zap, Copy, Search, Trash2, Edit, Plus, 
  Wallet, CheckCircle, X, AlertCircle, ChevronRight, 
  Sparkles, Hash, LayoutDashboard, Settings, Users, 
  Gamepad2, Package as PackageIcon, LogOut, Save,
  MessageCircle, Smartphone, Globe, Youtube, CreditCard,
  Image as ImageIcon, FileText, Link as LinkIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Types (copied from App.tsx to avoid circular dependency issues if I imported from there, 
// though ideally should be in a types.ts file)
interface Game { id: string; name: string; image: string; category: string; description?: string; isPremium?: boolean; }
interface Package { 
  id: string; 
  gameId: string; 
  name: string; 
  amount: string; 
  price: number; 
  bonus?: string; 
  inStock?: boolean; 
  stock?: number;
  category?: string;
}
interface Order { 
  id: string; userId: string; userEmail: string; uid: string; accountType: string; 
  gameName: string; packageName: string; paymentMethod: string; transactionId: string; 
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled'; timestamp: number;
  price: number;
  phoneNumber?: string;
}
interface SiteSettings {
  notice: string;
  whatsapp: string;
  telegram: string;
  appLink?: string;
  youtube: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  upayNumber: string;
  sliderImages: { id: string; url: string; link?: string }[];
  sliderInterval: number;
  bkashLogo: string;
  nagadLogo: string;
  rocketLogo: string;
  upayLogo: string;
  siteName: string;
  siteLogo: string;
  selectedPackageColor?: string;
  stockOutColor?: string;
  priceColor?: string;
  premiumThreshold?: number;
  loyaltyRules?: string;
  categorySort?: string[];
  homeBanners?: string[];
  noticeColor?: string;
  noticeTextColor?: string;
  developerName?: string;
  developerImage?: string;
  developerDescription?: string;
  developerLink?: string;
}
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
  totalSpent: number;
  totalOrders: number;
  isVerified: boolean;
  supportPin: string;
}

interface AdminDashboardProps {
  games: Game[];
  packages: Package[];
  orders: Order[];
  users: UserProfile[];
  siteSettings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  onAddGame: (game: any) => void;
  onUpdateGame: (game: any) => void;
  onDeleteGame: (id: string) => void;
  onAddPackage: (pkg: any) => void;
  onUpdatePackage: (pkg: any) => void;
  onDeletePackage: (id: string) => void;
  onUpdateOrderStatus: (order: Order, status: string) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateUser: (userId: string, data: any) => void;
  onLogout: () => void;
  seedInitialData: () => void;
}

export default function AdminDashboard({
  games, packages, orders, users, siteSettings,
  onUpdateSettings, onAddGame, onUpdateGame, onDeleteGame,
  onAddPackage, onUpdatePackage, onDeletePackage,
  onUpdateOrderStatus, onDeleteOrder, onUpdateUser,
  onLogout, seedInitialData
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'games' | 'packages' | 'settings' | 'users' | 'ai'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedGameForPackages, setSelectedGameForPackages] = useState<string>('');
  
  // Edit States
  const [editGame, setEditGame] = useState<Partial<Game> | null>(null);
  const [editPkg, setEditPkg] = useState<Partial<Package> | null>(null);
  
  // AI State
  const [aiSearchTrxId, setAiSearchTrxId] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<Order | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Initialize selected game for packages
  useEffect(() => {
    if (games.length > 0 && !selectedGameForPackages) {
      setSelectedGameForPackages(games[0].id);
    }
  }, [games]);

  const generateGameDescription = async () => {
    if (!editGame?.name) {
      alert("Please enter a game name first");
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [{ parts: [{ text: `Write a short, exciting description for the mobile game "${editGame.name}". Max 2 sentences.` }] }]
      });
      const text = response.text;
      if (text) {
        setEditGame(prev => ({ ...prev, description: text }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate description");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const filteredPackages = packages.filter(p => p.gameId === selectedGameForPackages);

  const navItems = [
    { id: 'orders', label: 'Orders', icon: History },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'packages', label: 'Packages', icon: PackageIcon },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar Navigation */}
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-6 fixed h-full z-20">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
              A
            </div>
            <div>
              <h1 className="font-black text-indigo-950 text-lg">Admin Panel</h1>
              <p className="text-xs font-bold text-slate-400">Control Center</p>
            </div>
          </div>
          
          <div className="space-y-2 flex-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-2">
            <button onClick={seedInitialData} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all">
              <Save className="w-5 h-5" /> Seed Data
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        {/* Mobile Header & Nav */}
        <div className="md:hidden">
          <div className="bg-white p-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-30">
            <div className="font-black text-indigo-950">Admin Panel</div>
            <button onClick={onLogout} className="p-2 bg-red-50 text-red-500 rounded-lg"><LogOut className="w-4 h-4" /></button>
          </div>
          <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar sticky top-[60px] z-20">
            <div className="flex p-2 gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === item.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 p-4 md:p-10 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-indigo-950">Order Management</h2>
                      <p className="text-slate-400 font-bold text-sm">Track and manage customer orders</p>
                    </div>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search orders..." 
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:border-indigo-600 outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Orders', value: orders.length, color: 'bg-blue-500' },
                      { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: 'bg-orange-500' },
                      { label: 'Completed', value: orders.filter(o => o.status === 'Completed').length, color: 'bg-green-500' },
                      { label: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length, color: 'bg-red-500' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
                        <div className="text-2xl font-black text-indigo-950">{stat.value}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">Order ID</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">User</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">Item</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">Payment</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">Status</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {orders.filter(o => 
                            o.id.includes(orderSearch) || 
                            o.userEmail.includes(orderSearch) ||
                            o.transactionId.includes(orderSearch) ||
                            o.uid.includes(orderSearch)
                          ).map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50">
                              <td className="p-4">
                                <div className="font-mono text-xs font-bold text-indigo-950">#{order.id.slice(-6)}</div>
                                <div className="text-[10px] text-slate-400">{new Date(order.timestamp).toLocaleDateString()}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm font-bold text-indigo-950">{order.userEmail.split('@')[0]}</div>
                                <div className="text-[10px] text-slate-400">{order.userEmail}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm font-bold text-indigo-950">{order.packageName}</div>
                                <div className="text-[10px] text-slate-400">{order.gameName} • {order.uid}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm font-bold text-indigo-950">৳{order.price}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{order.transactionId}</div>
                              </td>
                              <td className="p-4">
                                <select 
                                  value={order.status}
                                  onChange={(e) => onUpdateOrderStatus(order, e.target.value)}
                                  className={`text-xs font-bold px-2 py-1 rounded-lg border-2 outline-none ${
                                    order.status === 'Completed' ? 'border-green-100 bg-green-50 text-green-600' :
                                    order.status === 'Pending' ? 'border-orange-100 bg-orange-50 text-orange-600' :
                                    'border-red-100 bg-red-50 text-red-600'
                                  }`}
                                >
                                  <option>Pending</option>
                                  <option>Processing</option>
                                  <option>Completed</option>
                                  <option>Cancelled</option>
                                </select>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => onDeleteOrder(order.id)}
                                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* GAMES TAB */}
              {activeTab === 'games' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-indigo-950">Game Catalog</h2>
                      <p className="text-slate-400 font-bold text-sm">Manage available games</p>
                    </div>
                    <button 
                      onClick={() => setEditGame({})}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Game
                    </button>
                  </div>

                  {editGame && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg mb-6 animate-in fade-in slide-in-from-top-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-indigo-950">{editGame.id ? 'Edit Game' : 'New Game'}</h3>
                        <button onClick={() => setEditGame(null)}><X className="w-5 h-5 text-slate-400" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Game Name</label>
                          <input 
                            value={editGame.name || ''} 
                            onChange={e => setEditGame({...editGame, name: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            placeholder="e.g. Free Fire"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Category</label>
                          <input 
                            value={editGame.category || ''} 
                            onChange={e => setEditGame({...editGame, category: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            placeholder="e.g. Battle Royale"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500">Image URL</label>
                          <input 
                            value={editGame.image || ''} 
                            onChange={e => setEditGame({...editGame, image: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex justify-between">
                            <label className="text-xs font-bold text-slate-500">Description</label>
                            <button 
                              onClick={generateGameDescription}
                              disabled={isGeneratingDesc}
                              className="text-xs font-black text-indigo-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                            >
                              <Sparkles className="w-3 h-3" /> {isGeneratingDesc ? 'Generating...' : 'Generate with AI'}
                            </button>
                          </div>
                          <textarea 
                            value={editGame.description || ''} 
                            onChange={e => setEditGame({...editGame, description: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={editGame.isPremium || false}
                            onChange={e => setEditGame({...editGame, isPremium: e.target.checked})}
                            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <label className="text-sm font-bold text-slate-600">Premium Game</label>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setEditGame(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                        <button 
                          onClick={() => {
                            if (editGame.id) onUpdateGame(editGame);
                            else onAddGame(editGame);
                            setEditGame(null);
                          }}
                          className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                          Save Game
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <div key={game.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100">
                          <img src={game.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-black text-indigo-950">{game.name}</h3>
                            <p className="text-xs font-bold text-slate-400">{game.category}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditGame(game)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => onDeleteGame(game.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        {game.isPremium && (
                          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">PREMIUM</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PACKAGES TAB - NEW DESIGN */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-indigo-950">Package Management</h2>
                      <p className="text-slate-400 font-bold text-sm">Organize packages by game</p>
                    </div>
                    <button 
                      onClick={() => setEditPkg({ gameId: selectedGameForPackages })}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Package
                    </button>
                  </div>

                  {/* Game Selection Tabs */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 min-w-max">
                      {games.map(game => (
                        <button
                          key={game.id}
                          onClick={() => setSelectedGameForPackages(game.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                            selectedGameForPackages === game.id
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
                          }`}
                        >
                          <img src={game.image} className="w-6 h-6 rounded-lg object-cover" />
                          {game.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {editPkg && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg mb-6 animate-in fade-in slide-in-from-top-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-indigo-950">{editPkg.id ? 'Edit Package' : 'New Package'}</h3>
                        <button onClick={() => setEditPkg(null)}><X className="w-5 h-5 text-slate-400" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Game</label>
                          <select 
                            value={editPkg.gameId || selectedGameForPackages} 
                            onChange={e => setEditPkg({...editPkg, gameId: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                          >
                            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Package Name</label>
                          <input 
                            value={editPkg.name || ''} 
                            onChange={e => setEditPkg({...editPkg, name: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            placeholder="e.g. Weekly Membership"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Amount/Value</label>
                          <input 
                            value={editPkg.amount || ''} 
                            onChange={e => setEditPkg({...editPkg, amount: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            placeholder="e.g. 100 Diamonds"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Price (৳)</label>
                          <input 
                            type="number"
                            value={editPkg.price || ''} 
                            onChange={e => setEditPkg({...editPkg, price: Number(e.target.value)})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            placeholder="e.g. 150"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setEditPkg(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                        <button 
                          onClick={() => {
                            if (editPkg.id) onUpdatePackage(editPkg);
                            else onAddPackage(editPkg);
                            setEditPkg(null);
                          }}
                          className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                          Save Package
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPackages.length > 0 ? filteredPackages.map((pkg) => (
                      <div key={pkg.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <PackageIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-black text-indigo-950 text-sm">{pkg.amount}</div>
                            <div className="text-xs font-bold text-slate-400">{pkg.name}</div>
                            <div className="text-sm font-black text-red-500 mt-1">৳{pkg.price}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditPkg(pkg)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => onDeletePackage(pkg.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <PackageIcon className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400 font-bold">No packages found for this game.</p>
                        <button onClick={() => setEditPkg({ gameId: selectedGameForPackages })} className="mt-4 text-indigo-600 font-black text-xs hover:underline">Create First Package</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-indigo-950">Global Settings</h2>
                    <p className="text-slate-400 font-bold text-sm">Configure your website links and content</p>
                  </div>

                  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                    {/* Social & Contact Links */}
                    <div>
                      <h3 className="text-lg font-black text-indigo-950 mb-4 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-indigo-600" /> Social & Links
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">WhatsApp Number</label>
                          <div className="relative">
                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                            <input 
                              value={siteSettings.whatsapp} 
                              onChange={e => onUpdateSettings({...siteSettings, whatsapp: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                              placeholder="e.g. 017XXXXXXXX"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Telegram Username/Link</label>
                          <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                            <input 
                              value={siteSettings.telegram} 
                              onChange={e => onUpdateSettings({...siteSettings, telegram: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                              placeholder="e.g. stbtopup"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">App Download Link</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                            <input 
                              value={siteSettings.appLink || ''} 
                              onChange={e => onUpdateSettings({...siteSettings, appLink: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">YouTube Video ID</label>
                          <div className="relative">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                            <input 
                              value={siteSettings.youtube} 
                              onChange={e => onUpdateSettings({...siteSettings, youtube: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                              placeholder="Video ID"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    {/* Payment Numbers */}
                    <div>
                      <h3 className="text-lg font-black text-indigo-950 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" /> Payment Numbers
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['bkash', 'nagad', 'rocket', 'upay'].map((method) => (
                          <div key={method} className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 capitalize">{method} Number</label>
                            <input 
                              value={(siteSettings as any)[`${method}Number`]} 
                              onChange={e => onUpdateSettings({...siteSettings, [`${method}Number`]: e.target.value})}
                              className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    {/* Site Content */}
                    <div>
                      <h3 className="text-lg font-black text-indigo-950 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" /> Site Content
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Site Name</label>
                          <input 
                            value={siteSettings.siteName} 
                            onChange={e => onUpdateSettings({...siteSettings, siteName: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">Notice Bar Text</label>
                          <textarea 
                            value={siteSettings.notice} 
                            onChange={e => onUpdateSettings({...siteSettings, notice: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onUpdateSettings(siteSettings)}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Save All Settings
                    </button>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-indigo-950">User Directory</h2>
                    <p className="text-slate-400 font-bold text-sm">Manage registered users</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">User</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">Balance</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase">Spent</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                              <td className="p-4">
                                <div className="font-bold text-indigo-950 text-sm">{u.name || 'User'}</div>
                                <div className="text-[10px] text-slate-400">{u.email}</div>
                                <div className="text-[10px] font-mono bg-slate-100 px-1 rounded w-fit mt-1">ID: {u.supportPin}</div>
                              </td>
                              <td className="p-4 font-black text-green-600">৳{u.balance}</td>
                              <td className="p-4 font-bold text-slate-600">৳{u.totalSpent}</td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => {
                                    const newBal = prompt('New Balance:', u.balance.toString());
                                    if (newBal) onUpdateUser(u.id, { balance: Number(newBal) });
                                  }}
                                  className="text-xs font-bold text-indigo-600 hover:underline"
                                >
                                  Edit Balance
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* AI TAB */}
              {activeTab === 'ai' && (
                <div className="max-w-2xl mx-auto space-y-6">
                   <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mx-auto">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-indigo-950">AI Assistant</h2>
                    <p className="text-slate-400 font-bold text-sm">Analyze transactions with AI</p>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        value={aiSearchTrxId}
                        onChange={e => setAiSearchTrxId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-600 outline-none"
                        placeholder="Enter Transaction ID..."
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!aiSearchTrxId) return;
                        setIsAiSearching(true);
                        setAiResponse('');
                        setAiSearchResult(null);
                        
                        const foundOrder = orders.find(o => o.transactionId.toLowerCase() === aiSearchTrxId.toLowerCase());
                        
                        if (foundOrder) {
                          setAiSearchResult(foundOrder);
                          try {
                            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
                            const prompt = `
                              You are an Admin Assistant for a Gaming Topup Website called ${siteSettings.siteName}.
                              I found an order with TxID: ${aiSearchTrxId}.
                              Order Details:
                              - User: ${foundOrder.userEmail}
                              - Game: ${foundOrder.gameName}
                              - Package: ${foundOrder.packageName}
                              - Method: ${foundOrder.paymentMethod}
                              - Status: ${foundOrder.status}
                              - Player ID: ${foundOrder.uid}
                              
                              Please provide a professional summary of this transaction. 
                              Confirm if the user has paid for a specific item and mention the payment method.
                              Keep it concise (max 3 sentences).
                            `;
                            const response = await ai.models.generateContent({
                              model: 'gemini-flash-latest',
                              contents: [{ parts: [{ text: prompt }] }]
                            });
                            setAiResponse(response.text || 'Order found successfully.');
                          } catch (e) {
                            setAiResponse('Order found. (AI analysis failed, but data is available below)');
                          }
                        } else {
                          setAiResponse('No order found with this Transaction ID. This might be a fake attempt.');
                        }
                        setIsAiSearching(false);
                      }}
                      disabled={isAiSearching}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {isAiSearching ? 'Analyzing...' : 'Analyze Transaction'}
                    </button>

                    {aiResponse && (
                      <div className={`p-6 rounded-2xl border-2 ${aiSearchResult ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="font-black text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                          {aiSearchResult ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          {aiSearchResult ? 'Verified' : 'Not Found'}
                        </div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">{aiResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
