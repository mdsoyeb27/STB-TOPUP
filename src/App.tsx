import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Diamond, 
  User, 
  CheckCircle, 
  X, 
  Lock, 
  LayoutDashboard, 
  LogOut, 
  Trash2, 
  MessageCircle,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  Gamepad2,
  Smartphone,
  Globe,
  Plus,
  Edit,
  History,
  Copy,
  SmartphoneIcon,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Wallet,
  Search,
  Sparkles,
  Download,
  Send,
  BookOpen,
  Headphones,
  Box,
  Phone,
  Hash,
  Filter,
  Facebook,
  Youtube,
  Mail,
  Instagram
} from 'lucide-react';
import { db, auth } from './firebase';
import { ref, push, onValue, remove, set, update, get } from 'firebase/database';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser 
} from 'firebase/auth';
import { GoogleGenAI } from "@google/genai";
import AIChatbot from './components/AIChatbot';
import BottomNav from './components/BottomNav';
import { Modal } from './components/Modal';
import { Skeleton } from './components/Skeleton';

// Mock Data for Latest Orders
const latestOrders = [
  { name: 'Md "Nayem" Nayem', item: 'Weekly', price: '148৳', status: 'completed', img: 'https://ui-avatars.com/api/?name=Nayem&background=random' },
  { name: 'Abdullah Hossain', item: '115 Diamond', price: '76৳', status: 'completed', img: 'https://ui-avatars.com/api/?name=Abdullah&background=random' },
  { name: 'Md Masud Miyan', item: 'Weekly', price: '153৳', status: 'completed', img: 'https://ui-avatars.com/api/?name=Masud&background=random' },
  { name: 'Mr Sime', item: 'Weekly', price: '153৳', status: 'pending', img: 'https://ui-avatars.com/api/?name=Sime&background=random' },
  { name: 'Md Nor mohabot', item: 'Weekly', price: '153৳', status: 'completed', img: 'https://ui-avatars.com/api/?name=Nor&background=random' },
  { name: 'CR RIDER', item: 'Weekly', price: '148৳', status: 'completed', img: 'https://ui-avatars.com/api/?name=Rider&background=random' },
];

// Types
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
  sliderImages: string[];
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
}
interface UserProfile {
  name: string;
  phone?: string;
  balance: number;
  totalSpent: number;
  totalOrders: number;
  isVerified: boolean;
  supportPin: string;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    notice: 'Notice: এখন থেকে আমাদের সাইটে প্রতিদিন ২৪ ঘণ্টা অর্ডার করতে পারবেন। ধন্যবাদ।',
    whatsapp: '017XXXXXXXX',
    telegram: 'stbtopup',
    youtube: 'https://youtube.com',
    bkashNumber: '017XXXXXXXX',
    nagadNumber: '017XXXXXXXX',
    rocketNumber: '017XXXXXXXX',
    upayNumber: '017XXXXXXXX',
    sliderImages: ['https://picsum.photos/seed/stb1/1200/400', 'https://picsum.photos/seed/stb2/1200/400'],
    bkashLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Bkash_logo.png/1200px-Bkash_logo.png',
    nagadLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Nagad_Logo.png/1200px-Nagad_Logo.png',
    rocketLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Rocket_Logo.png/1200px-Rocket_Logo.png',
    upayLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Upay_Logo.png/1200px-Upay_Logo.png',
    siteName: 'STB TOPUP',
    siteLogo: 'https://ui-avatars.com/api/?name=STB&background=6366f1&color=fff&size=128',
    selectedPackageColor: '#eff6ff', // bg-blue-50
    stockOutColor: '#f8fafc', // bg-slate-50
    priceColor: '#ef4444', // text-red-500
    premiumThreshold: 10000,
    categorySort: [],
    homeBanners: [],
    loyaltyRules: `
🚩 Premium User Loyalty Discount
যেসব গ্রাহক আমাদের কাছ থেকে মোট ১০,০০০ বা তার বেশি মূল্যের পণ্য ক্রয় করেছেন, তারা Premium User Loyalty Discount অফারটি পাওয়ার যোগ্য হবেন। নির্ধারিত পরিমাণ টাকার টপ-আপ সম্পন্ন হলে, আপনি পরবর্তী টপ-আপে অতিরিক্ত ডিসকাউন্ট উপভোগ করতে পারবেন।

💥 অফারের বিস্তারিত:
✔ শুধুমাত্র বিশ্বস্ত গ্রাহকদের জন্য প্রিমিয়াম পুরস্কার
✔ আমাদের থেকে মোট ১০,০০০+ টাকার কেনাকাটা থাকতে হবে
✔ পরবর্তী টপ-আপে অতিরিক্ত ডিসকাউন্ট প্রযোজ্য হবে
✔ একজন গ্রাহক ২৪ ঘণ্টার মধ্যে যেকোনো সর্বোচ্চ ২টি প্যাকেজ অর্ডার করতে পারবেন
✔ প্রচলিত শর্ত অনুযায়ী অফার কার্যকর হবে
✔ শুধুমাত্র ভেরিফাইড গ্রাহকদের জন্য প্রযোজ্য
📜 শর্তাবলী পরিবর্তনের অধিকার

আমরা প্রয়োজনে এই অফারের শর্তাবলী, সুবিধা বা মেয়াদ যে কোনো সময় পূর্ব নোটিশ ছাড়াই পরিবর্তন, সংশোধন বা বাতিল করার অধিকার সংরক্ষণ করি। এই অফার সংক্রান্ত আমাদের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।
    `.trim()
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    balance: 0,
    totalSpent: 0,
    totalOrders: 0,
    isVerified: true,
    supportPin: '666994'
  });
  
  const [view, setView] = useState<'home' | 'game' | 'profile' | 'edit-profile' | 'admin' | 'add-money' | 'transactions' | 'payment-cancelled' | 'privacy' | 'gateway' | 'gateway-payment' | 'support'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [paymentType, setPaymentType] = useState<'wallet' | 'instant'>('instant');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<'All' | 'Completed' | 'Pending' | 'Cancelled'>('All');
  const [adminTab, setAdminTab] = useState<'orders' | 'games' | 'packages' | 'settings' | 'users' | 'ai'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [aiSearchTrxId, setAiSearchTrxId] = useState('');
  const [aiSearchResult, setAiSearchResult] = useState<Order | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [realTimeLatestOrders, setRealTimeLatestOrders] = useState<any[]>([]);

  // Real-time Latest Orders
  useEffect(() => {
    const combined = orders.map(o => {
      const pkgName = o.packageName.split(' ').slice(1).join(' ');
      const pkgPrice = packages.find(p => p.name === pkgName)?.price;
      return {
        id: o.id,
        name: o.userEmail.split('@')[0],
        item: o.packageName,
        price: `${o.price || pkgPrice || 'N/A'}৳`,
        status: o.status,
        timestamp: o.timestamp
      };
    }).sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    
    setRealTimeLatestOrders(combined);
  }, [orders, packages]);

  const [aiResponse, setAiResponse] = useState<string>('');

  // Form States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [uid, setUid] = useState('');
  const [trxId, setTrxId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Admin Edit States
  const [editGame, setEditGame] = useState<Partial<Game> | null>(null);
  const [editPkg, setEditPkg] = useState<Partial<Package> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Profile Edit States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  const [addMoneyAmount, setAddMoneyAmount] = useState('');

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name || '');
      setEditPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleAddMoney = () => {
    const amount = Number(addMoneyAmount);
    if (!amount || amount < 10) {
      alert("Minimum amount is 10 BDT");
      return;
    }
    setSelectedPackage({ 
      id: `deposit_${Date.now()}`, 
      gameId: 'wallet', 
      name: 'Wallet Deposit', 
      amount: 'Balance', 
      price: amount 
    });
    setPaymentType('instant');
    setView('gateway');
  };

  const generateGameDescription = async () => {
    if (!editGame?.name) {
      alert("Please enter a game name first");
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Keep auto-admin for developer convenience, but manual login will also work
      if (u?.email === 'admin@stb.com') setIsAdminLoggedIn(true);
    });
    onValue(ref(db, 'games'), (s) => {
      const d = s.val();
      setGames(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
    });
    onValue(ref(db, 'packages'), (s) => {
      const d = s.val();
      setPackages(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
    });
    onValue(ref(db, 'orders'), (s) => {
      const d = s.val();
      if (d) {
        const list = Object.entries(d).map(([id, v]: any) => ({ ...v, id }));
        setOrders(list.sort((a, b) => b.timestamp - a.timestamp));
      } else setOrders([]);
    });
    onValue(ref(db, 'settings'), (s) => {
      const d = s.val();
      if (d) setSiteSettings(d);
    });
    onValue(ref(db, 'users'), (s) => {
      const d = s.val();
      if (d) {
        const list = Object.entries(d).map(([id, v]: any) => ({ id, ...v }));
        setAllUsers(list);
      } else setAllUsers([]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      setUserOrders(orders.filter(o => o.userId === user.uid));
      onValue(ref(db, `users/${user.uid}`), (s) => {
        const d = s.val();
        if (d) setUserProfile(d);
      });
    }
  }, [user, orders]);

  useEffect(() => {
    setAuthError(null);
  }, [authMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthLoading) return;
    setAuthError(null);
    
    if (authMode === 'forgot') {
      if (!email) {
        setAuthError("Please enter your email address.");
        return;
      }
      setIsAuthLoading(true);
      try {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Please check your inbox.");
        setAuthMode('login');
      } catch (err: any) {
        setAuthError(err.message);
      } finally {
        setIsAuthLoading(false);
      }
      return;
    }

    // Basic validation
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    setIsAuthLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(db, `users/${cred.user.uid}`), {
          name: name || email.split('@')[0],
          email: email,
          balance: 0,
          totalSpent: 0,
          totalOrders: 0,
          isVerified: true,
          supportPin: Math.floor(100000 + Math.random() * 900000).toString()
        });
      }
      setIsAuthModalOpen(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) { 
      let msg = "An error occurred during authentication.";
      if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
      else if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      else if (err.code === 'auth/email-already-in-use') {
        msg = "This email is already registered. We've switched you to Login mode.";
        setAuthMode('login');
      }
      else if (err.code === 'auth/invalid-email') msg = "Please enter a valid email address.";
      else if (err.code === 'auth/weak-password') msg = "Password is too weak.";
      else if (err.code === 'auth/network-request-failed') msg = "Network error. Please check your connection.";
      setAuthError(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      setIsAdminLoginModalOpen(false);
      setView('admin');
    } else {
      alert('Invalid admin credentials');
    }
  };

  const handleGoogleLogin = async () => {
    if (isAuthLoading) return;
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      
      const userRef = ref(db, `users/${cred.user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        await set(userRef, {
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
          email: cred.user.email,
          balance: 0,
          totalSpent: 0,
          totalOrders: 0,
          isVerified: true,
          supportPin: Math.floor(100000 + Math.random() * 900000).toString()
        });
      }
      setIsAuthModalOpen(false);
    } catch (err: any) { 
      console.error("Google Auth Error:", err);
      setAuthError(err.message); 
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setIsAuthModalOpen(true);

    // Wallet Balance Check
    if (paymentType === 'wallet') {
      if ((userProfile.balance || 0) < (selectedPackage?.price || 0)) {
        alert("Insufficient balance! Please add money to your wallet.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderId = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
      
      // Determine Payment Details
      const finalPaymentMethod = paymentType === 'wallet' ? 'Wallet' : paymentMethod;
      const finalTrxId = paymentType === 'wallet' ? `WAL-${Date.now()}` : trxId;
      const finalPhone = paymentType === 'wallet' ? (userProfile.phone || user.phoneNumber || 'N/A') : phoneNumber;

      await set(ref(db, `orders/${orderId}`), {
        id: orderId,
        userId: user.uid, 
        userEmail: user.email, 
        uid, 
        gameName: selectedGame?.name || 'Wallet', 
        gameId: selectedPackage?.gameId,
        packageName: `${selectedPackage?.amount} ${selectedPackage?.name}`,
        price: selectedPackage?.price,
        paymentMethod: finalPaymentMethod, 
        transactionId: finalTrxId, 
        phoneNumber: finalPhone,
        status: 'Pending', 
        timestamp: Date.now()
      });
      
      // Update user stats & Deduct Balance if Wallet
      const updates: any = {
        totalOrders: (userProfile.totalOrders || 0) + 1,
        totalSpent: (userProfile.totalSpent || 0) + (selectedPackage?.price || 0)
      };

      if (paymentType === 'wallet') {
        updates.balance = (userProfile.balance || 0) - (selectedPackage?.price || 0);
      }

      await update(ref(db, `users/${user.uid}`), updates);

      setOrderSuccess(true);
      setTimeout(() => { 
        setIsOrderModalOpen(false); 
        setOrderSuccess(false); 
        setUid(''); 
        setTrxId(''); 
        setPhoneNumber('');
        setPaymentMethod('');
        setView('home');
      }, 3000);
    } catch (err) { alert("Error submitting order"); }
    finally { setIsSubmitting(false); }
  };

  const handleOrderStatusChange = async (order: any, newStatus: string) => {
    await update(ref(db, `orders/${order.id}`), { status: newStatus });
    
    // Automatic Wallet Update Logic
    if (newStatus === 'Completed' && order.gameId === 'wallet' && order.status !== 'Completed') {
      const userRef = ref(db, `users/${order.userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const newBalance = (userData.balance || 0) + (order.price || 0);
        await update(userRef, { balance: newBalance });
        alert(`Automatically added ৳${order.price} to user's wallet!`);
      }
    }
  };

  const adminSaveGame = async () => {
    const id = editGame?.id || Date.now().toString();
    await set(ref(db, `games/${id}`), { 
      name: editGame?.name, 
      image: editGame?.image, 
      category: editGame?.category,
      description: editGame?.description || ''
    });
    setEditGame(null);
  };

  const adminSavePkg = async () => {
    const id = editPkg?.id || Date.now().toString();
    const price = Number(editPkg?.price);
    if (isNaN(price)) {
      alert("Please enter a valid price");
      return;
    }
    await set(ref(db, `packages/${id}`), { ...editPkg, price });
    setEditPkg(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const seedInitialData = async () => {
    if (!isAdminLoggedIn) return;
    const initialGames = [
      { name: 'Free Fire', image: 'https://picsum.photos/seed/ff/200/200', category: 'Mobile' },
      { name: 'PUBG Mobile', image: 'https://picsum.photos/seed/pubg/200/200', category: 'Mobile' },
      { name: 'Mobile Legends', image: 'https://picsum.photos/seed/ml/200/200', category: 'Mobile' }
    ];
    for (const g of initialGames) {
      await push(ref(db, 'games'), g);
    }
    alert('Initial games added!');
  };

  const [adminClickCount, setAdminClickCount] = useState(0);
  const handleFooterClick = () => {
    setAdminClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setIsAdminLoginModalOpen(true);
        return 0;
      }
      return newCount;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Notice Bar */}
      <AnimatePresence>
        {siteSettings.notice && (
          <motion.div 
            key="notice-bar"
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-950 text-white text-xs md:text-sm py-3 px-4 flex items-center justify-between overflow-hidden relative shadow-md z-50"
          >
            <div className="flex items-center gap-3 w-full overflow-hidden">
                <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shrink-0 animate-pulse">Notice</div>
                <div className="flex-1 overflow-hidden relative h-5">
                    <div className="absolute whitespace-nowrap animate-marquee font-bold text-slate-200">
                        {siteSettings.notice}
                    </div>
                </div>
            </div>
            <button onClick={() => setSiteSettings({...siteSettings, notice: ''})} className="hover:bg-white/10 p-1 rounded-full transition-colors ml-4 shrink-0"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors group">
              <div className="w-6 h-0.5 bg-indigo-950 mb-1.5 rounded-full group-hover:w-4 transition-all"></div>
              <div className="w-4 h-0.5 bg-red-500 mb-1.5 rounded-full group-hover:w-6 transition-all"></div>
              <div className="w-6 h-0.5 bg-indigo-950 rounded-full group-hover:w-4 transition-all"></div>
            </button>
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setView('home'); setSelectedGame(null); }}>
              <div className="w-10 h-10 bg-indigo-950 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-900/20">
                <Zap className="w-6 h-6 fill-current text-red-500" />
              </div>
              <div>
                <span className="text-xl font-black text-indigo-950 tracking-tighter leading-none block">STB</span>
                <span className="text-xs font-black text-red-500 tracking-[0.2em] leading-none block">TOPUP</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex gap-6 text-sm font-bold">
              <button onClick={() => setView('home')} className="hover:text-red-500 transition-colors">Topup</button>
              <button onClick={() => window.open(`https://wa.me/${siteSettings.whatsapp}`)} className="hover:text-red-500 transition-colors">Contact Us</button>
              {isAdminLoggedIn && <button onClick={() => setView('admin')} className="text-indigo-600 font-black">Admin Panel</button>}
            </nav>
            <div className="flex items-center gap-2 md:gap-4">
              {user ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Welcome</span>
                    <span className="text-xs font-black text-indigo-950 truncate max-w-[100px]">{userProfile.name || user.email?.split('@')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1.5 rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-red-100">
                    <Wallet className="w-3 h-3" /> ৳{userProfile.balance}
                  </div>
                  <button onClick={() => setIsSidebarOpen(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden border-2 border-indigo-100 hover:border-red-500 transition-all shadow-sm">
                    <img src={`https://ui-avatars.com/api/?name=${userProfile.name || user.email}&background=6366f1&color=fff`} className="w-full h-full object-cover" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} className="bg-red-500 text-white px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-black shadow-lg shadow-red-100 hover:scale-105 transition-all">Login</button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              key="sidebar-backdrop"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              key="sidebar-content"
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=6366f1&color=fff`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-indigo-950 truncate">Hi, {user?.email?.split('@')[0].toUpperCase()}</div>
                  <div className="text-[10px] text-slate-400 font-bold truncate">{user?.email}</div>
                </div>
                <button onClick={() => signOut(auth)} className="bg-red-500 text-white p-2 rounded-lg">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                <button onClick={() => { setView('profile'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <User className="w-5 h-5 text-indigo-600" /> My Account
                </button>
                <button onClick={() => { setView('my-orders'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <History className="w-5 h-5 text-indigo-600" /> My Orders
                </button>
                <button onClick={() => { setView('profile'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <Copy className="w-5 h-5 text-indigo-600" /> My Codes
                </button>
                <button onClick={() => { setView('transactions'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <History className="w-5 h-5 text-indigo-600" /> My Transaction
                </button>
                <button onClick={() => { setView('add-money'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <Wallet className="w-5 h-5 text-indigo-600" /> Add Money
                </button>
                <button onClick={() => { setView('privacy'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Privacy Policy
                </button>
                <button onClick={() => { window.open(`https://wa.me/${siteSettings.whatsapp}`); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <MessageCircle className="w-5 h-5 text-indigo-600" /> Contact Us
                </button>
                <button onClick={() => { alert("To install the app:\n1. Tap the Share button in your browser.\n2. Select 'Add to Home Screen'."); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-indigo-950 font-bold transition-colors">
                  <Smartphone className="w-5 h-5 text-indigo-600" /> Install App
                </button>
              </nav>

              <div className="p-6 border-t border-slate-100">
                <button onClick={() => window.open(`https://t.me/${siteSettings.telegram}`)} className="w-full bg-red-500 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-red-100">
                  <MessageCircle className="w-5 h-5" /> Support
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="space-y-8">
            {/* Hero Slider */}
            <section className="relative h-48 md:h-80 rounded-3xl overflow-hidden shadow-lg group">
              <div className="flex transition-transform duration-700 h-full">
                {siteSettings.sliderImages.map((img, i) => (
                  <img key={`slider-${i}`} src={img} className="w-full h-full object-cover flex-shrink-0" />
                ))}
              </div>
              {/* Simple Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                 <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold border border-white/20">
                    Welcome to {siteSettings.siteName}
                 </div>
              </div>
            </section>

            {/* Home Banners (Attractive Offers) */}
            {siteSettings.homeBanners && siteSettings.homeBanners.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {siteSettings.homeBanners.map((banner, i) => (
                  <motion.div 
                    key={`home-banner-${i}`}
                    whileHover={{ scale: 1.02 }}
                    className="relative h-32 md:h-40 rounded-2xl overflow-hidden shadow-md cursor-pointer border border-slate-100"
                  >
                    <img src={banner} className="w-full h-full object-cover" alt={`Offer ${i+1}`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Categories */}
            {(siteSettings.categorySort && siteSettings.categorySort.length > 0 
              ? siteSettings.categorySort 
              : Array.from(new Set(games.map(g => g.category)))
            ).map((cat, i) => {
              const categoryGames = games.filter(g => g.category === cat);
              if (categoryGames.length === 0) return null;
              
              return (
                <div key={cat || `uncategorized-${i}`} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                    <h2 className="text-lg font-black text-center text-slate-800 uppercase tracking-wider">{cat}</h2>
                    <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                    {games.length === 0 ? (
                      Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
                    ) : (
                      categoryGames.map((g, idx) => (
                        <motion.div 
                          key={`game-item-${g.id}-${idx}`} 
                          whileHover={{ y: -5 }} 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setSelectedGame(g); setView('game'); }} 
                          className="bg-white p-2 rounded-2xl shadow-sm cursor-pointer border border-slate-100 hover:shadow-md transition-all"
                        >
                          <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-slate-50">
                            <img src={g.image} className="w-full h-full object-cover" />
                            {idx < 3 && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
                                    HOT
                                </div>
                            )}
                          </div>
                          <h3 className="text-[10px] md:text-xs font-bold text-center text-slate-800 line-clamp-1">{g.name}</h3>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            {/* Banners - Moved to Home Screen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500 rounded-xl p-4 flex items-center justify-between text-white shadow-lg shadow-blue-200 cursor-pointer hover:bg-blue-600 transition-colors" onClick={() => window.open(`https://t.me/${siteSettings.telegram}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Send className="w-5 h-5 -rotate-45 translate-x-0.5 translate-y-0.5" />
                  </div>
                  <div>
                    <div className="font-black text-lg">Join Telegram</div>
                    <div className="text-xs opacity-90 font-bold">Offers & Updates</div>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="bg-green-500 rounded-xl p-4 flex items-center justify-between text-white shadow-lg shadow-green-200 cursor-pointer hover:bg-green-600 transition-colors" onClick={() => alert("App coming soon!")}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-lg">Download App</div>
                    <div className="text-xs opacity-90 font-bold">Get it on Play Store</div>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Latest Orders - Moved to Home Screen */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-center text-slate-800">Latest Orders</h3>
                <p className="text-center text-xs text-red-500 font-bold mt-1">Real-time updates</p>
              </div>
              <div className="divide-y divide-slate-100">
                {realTimeLatestOrders.map((order, i) => (
                  <div key={`latest-order-${order.id}-${i}`} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs uppercase border border-slate-200">
                        {order.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{order.name}</div>
                        <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                          {order.item} <span className="text-orange-500">🔥</span> <span className="text-green-600">{order.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-600' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 text-center border-t border-slate-100">
                <button className="text-slate-400 text-xs font-bold">Showing 10 recent orders</button>
              </div>
            </div>
          </div>
        )}

        {view === 'game' && selectedGame && (
          <div className="space-y-6 pb-24">
            {/* Gaming Banner Header */}
            <div className="relative h-32 md:h-48 rounded-2xl overflow-hidden shadow-xl mb-6 group">
              {/* Background with Overlay */}
              <div className="absolute inset-0 bg-indigo-900">
                <img 
                  src={selectedGame.image} 
                  className="w-full h-full object-cover opacity-40 blur-sm scale-110 group-hover:scale-100 transition-transform duration-1000" 
                  alt="Banner Background"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-transparent to-indigo-950/80"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-between px-6 md:px-12">
                {/* Left: Logo & Delivery Time */}
                <div className="flex flex-col gap-2">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-white p-1 rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden">
                    <img src={selectedGame.image} className="w-full h-full object-cover rounded-xl" alt="Game Logo" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[10px] md:text-xs font-black text-white tracking-tight">মাত্র ২ সেকেন্ডে ডেলিভারি</span>
                  </div>
                </div>

                {/* Right: Game Name */}
                <div className="text-right">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl uppercase italic">
                    {selectedGame.name}
                  </h1>
                  <div className="flex justify-end gap-2 mt-1">
                    <div className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Official</div>
                    <div className="bg-blue-600 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Instant</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium User Card */}
            {selectedGame.isPremium && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-indigo-950 ml-1">Premium User</h2>
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-sm">বিশেষ অফার</div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-black text-indigo-950 leading-tight">এই প্রোডাক্টটি শুধু বিশেষ ইউজারদের জন্য আনলক হবে</h3>
                      <p className="text-[11px] font-bold text-slate-600 leading-relaxed">আপনার অ্যাকাউন্ট থেকে মোট <span className="text-red-600">৳{siteSettings.premiumThreshold || 10000}</span> বা তার বেশি টপ-আপ করলেই এই অফারটি আপনার জন্য স্থায়ীভাবে আনলক হয়ে যাবে।</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">আপনার মোট খরচ: <span className="text-green-600 font-black">৳{userProfile.totalSpent || 0}</span></div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">আরও <span className="text-red-600 font-black">৳{Math.max(0, (siteSettings.premiumThreshold || 10000) - (userProfile.totalSpent || 0))}</span> টপ-আপ করলেই অফারটি আনলক হবে</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-orange-500" /> প্রোগ্রেস</span>
                      <span className="bg-white/50 px-2 py-0.5 rounded-full">{Math.min(100, Math.round(((userProfile.totalSpent || 0) / (siteSettings.premiumThreshold || 10000)) * 100))}%</span>
                    </div>
                    <div className="h-4 bg-white/50 rounded-full overflow-hidden border border-orange-200 p-0.5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((userProfile.totalSpent || 0) / (siteSettings.premiumThreshold || 10000)) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full shadow-sm relative"
                      >
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                      </motion.div>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 italic flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                    একটু একটু করে টপ-আপ করলেই এই অফারটির জন্য <span className="text-indigo-600 font-black">LOYALTY ACCESS</span> আনলক হয়ে যাবে।
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Packages */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <h3 className="text-xl font-bold text-blue-700">Select Recharge</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {packages.length === 0 ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : (
                  packages.filter(p => p.gameId === selectedGame.id).map((p, i) => (
                    <div 
                      key={`package-item-${p.id}-${i}`} 
                      onClick={() => {
                        if (p.inStock === false) return;
                        if (selectedGame.isPremium && (userProfile.totalSpent || 0) < (siteSettings.premiumThreshold || 10000)) {
                          alert(`এই অফারটি আনলক করতে আপনার মোট খরচ ${siteSettings.premiumThreshold || 10000}৳ হতে হবে। বর্তমানে আপনার মোট খরচ ৳${userProfile.totalSpent || 0}`);
                          return;
                        }
                        setSelectedPackage(p);
                      }} 
                      className={`relative p-3 rounded-lg border flex items-center justify-between transition-all ${
                        p.inStock === false || (selectedGame.isPremium && (userProfile.totalSpent || 0) < (siteSettings.premiumThreshold || 10000))
                          ? 'border-slate-100 opacity-60 grayscale cursor-not-allowed' 
                          : selectedPackage?.id === p.id 
                            ? 'border-blue-500 ring-1 ring-blue-500 cursor-pointer' 
                            : 'border-slate-200 hover:border-blue-300 cursor-pointer'
                      }`}
                      style={{
                        backgroundColor: p.inStock === false || (selectedGame.isPremium && (userProfile.totalSpent || 0) < (siteSettings.premiumThreshold || 10000))
                          ? (siteSettings.stockOutColor || '#f8fafc')
                          : selectedPackage?.id === p.id 
                            ? (siteSettings.selectedPackageColor || '#eff6ff')
                            : '#ffffff'
                      }}
                    >
                      {p.inStock === false && (
                        <div className="absolute -top-2 -right-1 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm z-10 animate-pulse">
                          Stock Out
                        </div>
                      )}
                      {selectedPackage?.id === p.id && p.inStock !== false && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-0.5 shadow-sm">
                              <CheckCircle className="w-3 h-3" />
                          </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{p.amount} {p.name}</span>
                      </div>
                      <div className="font-black text-sm" style={{ color: siteSettings.priceColor || '#ef4444' }}>৳{p.price}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Step 2: Account Info */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <h3 className="text-xl font-bold text-blue-700">Account Info</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Player Id <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={uid} 
                  onChange={e => setUid(e.target.value)} 
                  placeholder="Enter Player ID"
                  className="w-full bg-slate-100 border border-slate-200 p-3 rounded-lg font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <h3 className="text-xl font-bold text-blue-700">Select Payment</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Wallet Card */}
                <div 
                  onClick={() => setPaymentType('wallet')} 
                  className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 group ${
                    paymentType === 'wallet' 
                      ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg' 
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="p-4 flex flex-col items-center justify-center gap-2 h-28">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl transition-colors ${paymentType === 'wallet' ? 'bg-blue-50' : 'bg-slate-50'}`}>
                          <Wallet className={`w-8 h-8 ${paymentType === 'wallet' ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                        <div className="text-left leading-none">
                            <span className={`block text-xl font-black italic ${paymentType === 'wallet' ? 'text-blue-600' : 'text-slate-400'}`}>STB</span>
                            <span className="block text-[10px] font-black text-slate-800 tracking-widest">TOPUP</span>
                        </div>
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${paymentType === 'wallet' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      WALLET PAY
                    </div>
                  </div>
                  <div className={`py-2 px-1 text-center text-xs font-black transition-colors ${paymentType === 'wallet' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    Balance: ৳{userProfile.balance}
                  </div>
                  {paymentType === 'wallet' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 fill-white" />
                    </div>
                  )}
                </div>
                
                {/* Instant Pay Card */}
                <div 
                  onClick={() => setPaymentType('instant')} 
                  className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 group ${
                    paymentType === 'instant' 
                      ? 'border-indigo-600 ring-4 ring-indigo-500/10 shadow-lg' 
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="p-4 flex flex-col items-center justify-center gap-3 h-28">
                    <div className="flex items-center gap-2 scale-110">
                       <img src={siteSettings.bkashLogo} className="h-5 object-contain" alt="Bkash" />
                       <img src={siteSettings.nagadLogo} className="h-5 object-contain" alt="Nagad" />
                       <img src={siteSettings.rocketLogo} className="h-5 object-contain" alt="Rocket" />
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${paymentType === 'instant' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      INSTANT PAY
                    </div>
                  </div>
                  <div className={`py-2 px-1 text-center text-xs font-black transition-colors ${paymentType === 'instant' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    bKash / Nagad / Rocket
                  </div>
                  {paymentType === 'instant' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 fill-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info Boxes */}
              {paymentType === 'wallet' && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    আপনার অ্যাকাউন্ট ব্যালেন্স <span className="text-blue-600">৳ {userProfile.balance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-blue-600">৳ {selectedPackage?.price || 0}</span>
                  </div>
                </div>
              )}

              {/* Buy Now Button (Inside Payment Section) */}
              <div className="flex justify-end items-center gap-3">
                  {user && selectedPackage && paymentType === 'wallet' && userProfile.balance < selectedPackage.price && (
                    <button 
                      onClick={() => setView('add-money')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 animate-bounce"
                    >
                      <Plus className="w-4 h-4" /> ADD MONEY
                    </button>
                  )}
                  
                  {(!user || !selectedPackage || paymentType === 'instant' || (paymentType === 'wallet' && userProfile.balance >= selectedPackage.price)) && (
                    <button 
                      onClick={() => { 
                          if (!user) {
                            setIsAuthModalOpen(true); 
                          } else if (!selectedPackage) {
                            alert("Please select a package first");
                          } else if (!uid) {
                            alert("Please enter your Player ID");
                          } else {
                            if (paymentType === 'instant') {
                                setPaymentMethod(''); // Reset method
                                setView('gateway');
                            } else {
                                if (userProfile.balance < (selectedPackage.price || 0)) {
                                  if (confirm("Insufficient balance! Do you want to add money?")) {
                                    setView('add-money');
                                  }
                                } else {
                                  setIsOrderModalOpen(true); 
                                }
                            }
                          }
                      }} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-xl font-black text-sm shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                      >
                      {user ? (paymentType === 'instant' ? 'PAY NOW' : 'BUY NOW') : 'LOGIN TO BUY'}
                    </button>
                  )}
              </div>
            </div>

            {/* Description / Rules */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">4</div>
                <h3 className="text-2xl font-black text-blue-700">Description</h3>
              </div>
              
              <div className="space-y-4 text-sm font-bold text-slate-700">
                {selectedGame.description ? (
                  <div className="prose prose-sm max-w-none text-slate-700 font-bold whitespace-pre-wrap">
                    {selectedGame.description}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {siteSettings.loyaltyRules}
                  </div>
                )}
              </div>
            </div>
                        {/* Floating Support Button */}
            <button className="fixed bottom-24 right-4 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg z-40 hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7" />
            </button>
          </div>
        )}

        {(view === 'gateway' || view === 'gateway-payment') && selectedPackage && (
          <div className="min-h-screen bg-slate-50 pb-24">
            {/* Gateway Header */}
            <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-40">
               <div className="flex items-center gap-2">
                 <button onClick={() => view === 'gateway-payment' ? setView('gateway') : setView('game')}><ArrowRight className="w-5 h-5 rotate-180 text-slate-600" /></button>
                 <span className="font-bold text-slate-700">pay.youtopup.com</span>
               </div>
               <div className="flex gap-4">
                 <Plus className="w-5 h-5 text-slate-600" />
                 <div className="w-6 h-6 border-2 border-slate-600 rounded-md flex items-center justify-center text-xs font-bold">68</div>
               </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">
              {/* Logo Section */}
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-50 p-2 overflow-hidden">
                   <img src={siteSettings.siteLogo} className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-bold text-slate-700">{siteSettings.siteName}</h2>
                <div className="flex gap-4 mt-2">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400"><MessageCircle className="w-5 h-5" /></div>
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400"><AlertCircle className="w-5 h-5" /></div>
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400"><AlertCircle className="w-5 h-5" /></div>
                </div>
              </div>

              {view === 'gateway' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-blue-600 text-white text-center py-4 rounded-t-2xl font-bold text-lg shadow-lg shadow-blue-200">
                    মোবাইল ব্যাংকিং
                  </div>
                  <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-slate-100 grid grid-cols-2 gap-4">
                    <button onClick={() => setPaymentMethod('Bkash')} className={`aspect-[3/2] border-2 rounded-xl flex items-center justify-center transition-all p-4 group ${paymentMethod === 'Bkash' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 hover:border-pink-500 hover:bg-pink-50'}`}>
                      <img src={siteSettings.bkashLogo} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={() => setPaymentMethod('Nagad')} className={`aspect-[3/2] border-2 rounded-xl flex items-center justify-center transition-all p-4 group ${paymentMethod === 'Nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-orange-500 hover:bg-orange-50'}`}>
                      <img src={siteSettings.nagadLogo} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={() => setPaymentMethod('Rocket')} className={`aspect-[3/2] border-2 rounded-xl flex items-center justify-center transition-all p-4 group ${paymentMethod === 'Rocket' ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-500 hover:bg-purple-50'}`}>
                      <img src={siteSettings.rocketLogo} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={() => setPaymentMethod('Upay')} className={`aspect-[3/2] border-2 rounded-xl flex items-center justify-center transition-all p-4 group ${paymentMethod === 'Upay' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-500 hover:bg-blue-50'}`}>
                      <img src={siteSettings.upayLogo} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  
                  {/* Sticky Pay Now Button for Gateway */}
                  {paymentMethod && (
                    <div className="mt-8">
                        <button 
                        onClick={() => setView('gateway-payment')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-2"
                        >
                        PAY NOW
                        </button>
                    </div>
                  )}
                  <div className="text-center text-slate-400 text-xs font-bold pb-20 md:pb-0">
                    Secure Payment Gateway
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Invoice Header */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-14 h-14 border rounded-xl p-1 flex-shrink-0">
                       <img src={siteSettings.siteLogo} className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-800 text-lg">{siteSettings.siteName}</div>
                      <div className="text-xs text-slate-500 font-bold truncate">Invoice: {Date.now().toString().slice(-8)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold">Amount</div>
                        <div className="text-xl font-black text-slate-800">৳{selectedPackage.price}</div>
                    </div>
                  </div>

                  {/* Pink Payment Form */}
                  <div className="bg-[#E2136E] rounded-2xl overflow-hidden shadow-xl shadow-pink-200">
                    <div className="bg-[#C5105E] p-4 text-white font-bold text-center text-lg border-b border-white/10">
                      ট্রানজেকশন আইডি দিন
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="TrxID" 
                          value={trxId}
                          onChange={e => setTrxId(e.target.value)}
                          className="w-full bg-white p-4 rounded-xl text-center font-black text-xl text-slate-800 outline-none placeholder:text-slate-300 shadow-inner"
                        />
                      </div>

                      <div className="text-white text-sm space-y-4 font-medium leading-relaxed">
                        <div className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <p>*247# ডায়াল করে আপনার <span className="font-bold">{paymentMethod.toUpperCase()}</span> মোবাইল মেনুতে যান অথবা <span className="font-bold">{paymentMethod.toUpperCase()}</span> অ্যাপে যান।</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <p>"Send Money" -এ ক্লিক করুন।</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <div className="flex-1">
                                <p>প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="bg-black/20 px-3 py-1.5 rounded-lg font-mono font-bold text-yellow-300 text-lg tracking-wider">
                                    {paymentMethod === 'Bkash' ? siteSettings.bkashNumber : 
                                    paymentMethod === 'Nagad' ? siteSettings.nagadNumber : 
                                    paymentMethod === 'Rocket' ? siteSettings.rocketNumber : 
                                    siteSettings.upayNumber}
                                    </div>
                                    <button onClick={() => copyToClipboard(
                                    paymentMethod === 'Bkash' ? siteSettings.bkashNumber : 
                                    paymentMethod === 'Nagad' ? siteSettings.nagadNumber : 
                                    paymentMethod === 'Rocket' ? siteSettings.rocketNumber : 
                                    siteSettings.upayNumber
                                    )} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <p>টাকার পরিমাণঃ <span className="font-bold text-yellow-300 text-lg">৳{selectedPackage.price}</span></p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <p>নিশ্চিত করতে এখন আপনার <span className="font-bold">{paymentMethod.toUpperCase()}</span> মোবাইল মেনু পিন লিখুন।</p>
                        </div>
                        <div className="bg-black/10 p-4 rounded-xl text-center border border-white/10 mt-4">
                          এখন উপরের বক্সে আপনার <span className="text-yellow-300 font-bold">Transaction ID</span> দিন এবং নিচের <span className="text-yellow-300 font-bold">VERIFY</span> বাটনে ক্লিক করুন।
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleOrder}
                      disabled={!trxId || isSubmitting}
                      className="w-full bg-pink-800 hover:bg-pink-900 text-white py-4 font-black text-xl transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? 'VERIFYING...' : 'VERIFY'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
        <Modal
          isOpen={orderSuccess}
          onClose={() => setOrderSuccess(false)}
          maxWidth="max-w-xs"
        >
          <div className="text-center space-y-4 py-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Payment Successful!</h3>
              <p className="text-slate-500 font-bold">Your order is being processed.</p>
            </div>
          </div>
        </Modal>
          </div>
        )}

        {view === 'profile' && user && (
          <div className="space-y-8 pb-24">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-500 p-1">
                  <img src={`https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-indigo-950">Hi, {user.email?.split('@')[0].toUpperCase()}</h2>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
                  Available Balance : <span className="text-red-500">৳{userProfile.balance}</span>
                  <button onClick={() => window.location.reload()} className="p-1 hover:bg-slate-100 rounded"><Zap className="w-3 h-3" /></button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'User ID', value: userProfile.supportPin, color: 'text-red-500' },
                { label: 'Weekly Spent', value: `৳${userProfile.totalSpent}`, color: 'text-red-500' },
                { label: 'Total Spent', value: userProfile.totalSpent, color: 'text-red-500' },
                { label: 'Total Order', value: userProfile.totalOrders, color: 'text-red-500' }
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-4 md:p-6 rounded-2xl border border-red-100 text-center space-y-1 shadow-sm overflow-hidden">
                  <div className={`text-sm md:text-lg font-black ${stat.color} truncate`}>{stat.value}</div>
                  <div className="text-[8px] md:text-[10px] font-black text-indigo-950 uppercase truncate">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-black text-indigo-950">
                <User className="w-5 h-5 text-red-500" /> Account Settings
              </div>
              <div className="p-4 space-y-2">
                 <button 
                   onClick={() => setView('edit-profile')}
                   className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                 >
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                       <Edit className="w-5 h-5" />
                     </div>
                     <div className="text-left">
                       <div className="font-black text-indigo-950">Edit Profile</div>
                       <div className="text-xs font-bold text-slate-500">Update name, phone & password</div>
                     </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                 </button>
              </div>
            </div>
          </div>
        )}

        {view === 'edit-profile' && user && (
          <div className="space-y-8 pb-24">
             <div className="flex items-center gap-4">
               <button onClick={() => setView('profile')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50">
                 <ArrowRight className="w-5 h-5 text-slate-700 rotate-180" />
               </button>
               <h2 className="text-2xl font-black text-indigo-950">Edit Profile</h2>
             </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-black text-indigo-950">
                <User className="w-5 h-5 text-red-500" /> Edit Profile
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase">User ID (Read Only)</label>
                    <input type="text" value={userProfile.supportPin} readOnly className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase">Email (Read Only)</label>
                    <input type="text" value={user.email || ''} readOnly className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase">Full Name</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl font-bold text-indigo-950 outline-none focus:border-red-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase">Phone Number</label>
                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Enter phone number" className="w-full border border-slate-200 p-3 rounded-xl font-bold text-indigo-950 outline-none focus:border-red-500 transition-all" />
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    setIsProfileUpdating(true);
                    try {
                      await update(ref(db, `users/${user.uid}`), {
                        name: editName,
                        phone: editPhone
                      });
                      alert('Profile updated successfully!');
                      setView('profile');
                    } catch (error) {
                      console.error("Error updating profile:", error);
                      alert('Failed to update profile. Please try again.');
                    } finally {
                      setIsProfileUpdating(false);
                    }
                  }}
                  disabled={isProfileUpdating}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isProfileUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-black text-indigo-950">
                <Lock className="w-5 h-5 text-red-500" /> Change Password
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Old Password</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl font-bold text-indigo-950 outline-none focus:border-red-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl font-bold text-indigo-950 outline-none focus:border-red-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl font-bold text-indigo-950 outline-none focus:border-red-500 transition-all" />
                </div>
                <button 
                  onClick={() => {
                    if (newPassword !== confirmPassword) {
                      alert("Passwords do not match!");
                      return;
                    }
                    setIsProfileUpdating(true);
                    // Simulate password change
                    setTimeout(() => {
                      alert('Password changed successfully!');
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setIsProfileUpdating(false);
                    }, 1000);
                  }}
                  disabled={isProfileUpdating || !oldPassword || !newPassword}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-black shadow-lg shadow-red-200 hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {isProfileUpdating ? 'Processing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'add-money' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-black text-indigo-950">Add Money</div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-indigo-950">Enter the amount</label>
                  <input 
                    type="number" 
                    value={addMoneyAmount}
                    onChange={e => setAddMoneyAmount(e.target.value)}
                    placeholder="Amount" 
                    className="w-full border p-4 rounded-xl focus:border-red-500 outline-none font-bold" 
                  />
                </div>
                <button onClick={handleAddMoney} className="w-full bg-red-500 text-white py-4 rounded-xl font-black shadow-lg shadow-red-100 hover:bg-red-600 transition-colors">
                  Click Here To Add Money
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-black text-indigo-950">
                <Globe className="w-5 h-5 text-green-500" /> How to add money
              </div>
              <div className="p-4 aspect-video bg-black rounded-b-3xl">
                <iframe 
                  className="w-full h-full" 
                  src={`https://www.youtube.com/embed/${siteSettings.youtube.split('v=')[1] || 'dQw4w9WgXcQ'}`} 
                  title="How to add money" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {view === 'my-orders' && (
          <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-2 text-xl font-black text-indigo-950 px-2">
              <History className="w-6 h-6 text-blue-600" /> MY ORDERS
            </div>
            
            <div className="text-sm font-bold text-slate-500 px-2">
              {userOrders.length} of {userOrders.length} orders
            </div>

            <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center gap-2 font-bold text-sm mx-2 shadow-lg shadow-blue-200">
              <div className="bg-white/20 p-1 rounded"><CheckCircle className="w-4 h-4" /></div>
              Total: {userOrders.length} Orders
            </div>

            {/* Search and Filter */}
            <div className="mx-2 space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by Order ID, Phone, Package, TrxID" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all appearance-none">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
              {userOrders.length > 0 ? userOrders.map((o, i) => (
                <div key={`my-order-list-${o.id}-${i}`} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mx-2 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Box className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm flex items-center gap-2">
                          Order #{o.id}
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        </div>
                        <div className="text-xs font-bold text-slate-400 mt-0.5">
                          {new Date(o.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      o.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      o.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {o.status}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3">
                    {/* Package */}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                        <Box className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Package</div>
                        <div className="text-sm font-black text-slate-800">{o.packageName}</div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Total Price</div>
                        <div className="text-sm font-black text-green-600">৳{o.price || packages.find(p => p.name === o.packageName.split(' ').slice(1).join(' '))?.price || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Phone (User) */}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Phone</div>
                        <div className="text-sm font-black text-slate-800">{o.phoneNumber || 'N/A'}</div>
                      </div>
                    </div>

                    {/* TrxID */}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Transaction ID</div>
                        <div className="text-sm font-black text-slate-800">{o.transactionId}</div>
                      </div>
                    </div>

                    {/* Player ID */}
                    <div className="flex items-center gap-3 pt-2">
                       <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Player ID</div>
                        <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-sm font-black text-slate-700 w-full">
                          {o.uid || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-400 font-bold text-sm bg-white rounded-xl border border-slate-100 mx-2">No orders found.</div>
              )}
            </div>
          </div>
        )}

        {view === 'payment-cancelled' && (
          <div className="max-w-md mx-auto py-12">
            <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl text-center space-y-6">
              <div className="bg-red-500 text-white p-6 rounded-2xl flex items-center justify-center gap-4">
                <X className="w-8 h-8" />
                <h2 className="text-2xl font-black">পেমেন্ট বাতিল!</h2>
              </div>
              <p className="text-slate-600 font-bold">আপনি পেমেন্ট বাতিল করেছেন।</p>
              <button onClick={() => setView('home')} className="w-full flex items-center justify-center gap-2 py-4 border rounded-xl font-bold hover:bg-slate-50">
                <Globe className="w-5 h-5" /> ওয়েবসাইট ফিরে যান!
              </button>
            </div>
          </div>
        )}

        {view === 'support' && (
          <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black text-indigo-950">Contact Us</h1>
              <p className="text-slate-500 font-bold max-w-2xl mx-auto">
                We're here to help! Get in touch with our support team for any questions, concerns, or assistance you need.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                {/* Telegram Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-indigo-950">Telegram</div>
                    <div className="text-xs text-slate-400 font-bold">24/7 Live Chat</div>
                    <button onClick={() => window.open(`https://t.me/${siteSettings.telegram}`, '_blank')} className="text-blue-600 text-xs font-black mt-1 flex items-center gap-1">Start Chat <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Get In Touch Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-xl font-black text-indigo-950 border-b border-slate-50 pb-4">Get In Touch</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-indigo-950 text-sm">Email</div>
                        <div className="text-xs text-slate-500 font-bold">stbtopup@gmail.com</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-indigo-950 text-sm">Business Hours</div>
                        <div className="text-xs text-slate-500 font-bold">9:00 AM - 11:59 PM (GMT+6)</div>
                        <div className="text-[10px] text-slate-400 font-bold">7 days a week</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-indigo-950 text-sm">Telegram Group</div>
                        <button onClick={() => window.open(`https://t.me/${siteSettings.telegram}`, '_blank')} className="text-xs text-blue-600 font-bold hover:underline">Join Our Community</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow Us Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-indigo-950">Follow Us</h3>
                  <div className="flex gap-4">
                    <button className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 hover:scale-110 transition-transform">
                      <Facebook className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-100 hover:scale-110 transition-transform">
                      <Youtube className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-110 transition-transform">
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                {/* Message Form */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                  <h3 className="text-2xl font-black text-indigo-950">Send us a Message</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                      <input type="text" placeholder="Enter your full name" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 p-4 rounded-2xl text-sm font-bold outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                      <input type="email" placeholder="Enter your email" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 p-4 rounded-2xl text-sm font-bold outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject *</label>
                    <input type="text" placeholder="What's this about?" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 p-4 rounded-2xl text-sm font-bold outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message *</label>
                    <textarea rows={5} placeholder="Tell us how we can help you..." className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 p-4 rounded-2xl text-sm font-bold outline-none transition-all resize-none"></textarea>
                  </div>
                  <button className="w-full bg-indigo-950 text-white py-5 rounded-2xl font-black shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Send className="w-5 h-5" /> SEND MESSAGE
                  </button>

                  <div className="bg-indigo-50 p-6 rounded-2xl flex items-center gap-4 border border-indigo-100">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-black text-indigo-950 text-sm">Need Immediate Help?</div>
                      <p className="text-xs text-slate-500 font-bold">For urgent support, please use our instant messaging channels for faster response.</p>
                      <button onClick={() => window.open(`https://t.me/${siteSettings.telegram}`, '_blank')} className="text-indigo-600 text-xs font-black mt-2 flex items-center gap-1">
                        <Send className="w-4 h-4" /> Telegram
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-8 pt-12">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-indigo-950">Frequently Asked Questions</h2>
                <p className="text-slate-400 font-bold text-sm">Find quick answers to common questions</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { q: 'How do I add money to my wallet?', a: 'You can add money through various payment methods including bKash, Nagad, and bank transfers.' },
                  { q: 'What are your business hours?', a: 'We provide support from 9:00 AM to 11:59 PM (GMT+6) every day of the week.' },
                  { q: 'How long does order processing take?', a: 'Most orders are processed within 5-10 minutes. For instant top-ups, you\'ll receive confirmation immediately.' }
                ].map((faq) => (
                  <div key={faq.q} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                    <div className="font-black text-indigo-950">{faq.q}</div>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'transactions' && (
          <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
            {/* Balance Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Available Balance</div>
                  <div className="text-4xl font-black text-indigo-950">৳{userProfile.balance}</div>
                </div>
              </div>
              <button onClick={() => setView('add-money')} className="w-full md:w-auto bg-indigo-950 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-indigo-100 hover:scale-105 transition-all flex items-center justify-center gap-3">
                <Plus className="w-5 h-5" /> ADD MONEY
              </button>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-black text-indigo-950">Transaction History</h3>
                </div>
                <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                  {['All', 'Completed', 'Pending', 'Cancelled'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setTransactionFilter(f as any)}
                      className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${transactionFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-indigo-600'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {userOrders.filter(o => transactionFilter === 'All' || o.status === transactionFilter).length > 0 ? userOrders.filter(o => transactionFilter === 'All' || o.status === transactionFilter).map((o, i) => (
                  <div key={`transaction-item-${o.id}-${i}`} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        o.status === 'Completed' ? 'bg-green-50 text-green-600' :
                        o.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {o.status === 'Completed' ? <CheckCircle className="w-7 h-7" /> : 
                         o.status === 'Cancelled' ? <X className="w-7 h-7" /> : 
                         <Clock className="w-7 h-7" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            o.status === 'Completed' ? 'bg-green-100 text-green-600' :
                            o.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>{o.status}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order #{o.id}</span>
                        </div>
                        <div className="font-black text-indigo-950 text-sm truncate">{o.packageName}</div>
                        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-1">
                          <Hash className="w-3 h-3" /> Trx: {o.transactionId || 'N/A'}
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <Clock className="w-3 h-3" /> {new Date(o.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-8">
                      <div className="text-right">
                        <div className="text-2xl font-black text-indigo-950">৳{packages.find(p => p.name === o.packageName)?.price || '0'}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid</div>
                      </div>
                      <div className="flex gap-2">
                        {o.status === 'Pending' && (
                          <>
                            <button onClick={() => setView('gateway')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all">PAY NOW</button>
                            <button onClick={() => {
                              if(confirm('Cancel this order?')) {
                                update(ref(db, `orders/${o.id}`), { status: 'Cancelled' });
                              }
                            }} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-red-100 transition-all">CANCEL</button>
                          </>
                        )}
                        <button onClick={() => {
                          setOrderSearch(o.id);
                          setView('my-orders');
                        }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <History className="w-10 h-10" />
                    </div>
                    <div className="text-slate-400 font-bold">No transactions found yet.</div>
                  </div>
                )}
              </div>
              <div className="p-8 bg-slate-50/50 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Transaction History</div>
            </div>
          </div>
        )}

        {view === 'privacy' && (
          <div className="max-w-4xl mx-auto space-y-8 py-12">
            <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
              <h1 className="text-4xl font-black text-indigo-950 mb-8">Privacy Policy</h1>
              <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium">
                <p>Welcome to STB TOPUP. Your privacy is important to us.</p>
                <h3 className="text-xl font-black text-indigo-950">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This includes your name, email address, and transaction details.</p>
                <h3 className="text-xl font-black text-indigo-950">2. How We Use Your Information</h3>
                <p>We use your information to process your orders, manage your account, and provide customer support. We may also use it to send you updates about our services.</p>
                <h3 className="text-xl font-black text-indigo-950">3. Data Security</h3>
                <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>
                <h3 className="text-xl font-black text-indigo-950">4. Third-Party Services</h3>
                <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website and conducting our business.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && isAdminLoggedIn && (
          <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-3xl font-black text-indigo-950">Control Center</h2>
                <p className="text-slate-400 font-bold text-sm">Manage your gaming empire from here</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={seedInitialData} className="px-6 py-3 bg-slate-100 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all">Seed Data</button>
                <button onClick={() => setIsAdminLoggedIn(false)} className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-100 transition-all">Logout</button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Orders', value: orders.length, icon: History, color: 'bg-blue-500' },
                { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'bg-orange-500' },
                { label: 'Games', value: games.length, icon: Zap, color: 'bg-red-500' },
                { label: 'Packages', value: packages.length, icon: Copy, color: 'bg-indigo-500' }
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-indigo-950">{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 p-2 bg-white rounded-3xl border border-slate-100 shadow-sm w-full md:w-fit mx-auto overflow-x-auto no-scrollbar">
              {['orders', 'games', 'packages', 'settings', 'users', 'ai'].map(t => (
                <button key={t} onClick={() => setAdminTab(t as any)} className={`px-6 md:px-8 py-3 rounded-2xl font-black text-xs uppercase whitespace-nowrap transition-all ${adminTab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}>
                  {t === 'ai' ? 'AI Assistant' : t}
                </button>
              ))}
            </div>

            {adminTab === 'orders' && (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-indigo-950">Recent Orders</h3>
                    <p className="text-xs font-bold text-slate-400">Manage and track all customer transactions</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search Email, UID or TrxID..." 
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xs font-bold border-2 border-transparent focus:border-red-500 outline-none transition-all"
                      />
                    </div>
                    <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase whitespace-nowrap">Pending: {orders.filter(o => o.status === 'Pending').length}</div>
                  </div>
                </div>
                
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
                      <tr><th className="p-8">Order Info</th><th className="p-8">Customer & Game</th><th className="p-8">Payment Details</th><th className="p-8">Status</th><th className="p-8 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.filter(o => {
                        const orderUser = allUsers.find(u => u.id === o.userId);
                        return (
                          o.userEmail?.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.transactionId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.uid?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.userId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.phoneNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          orderUser?.supportPin?.includes(orderSearch) ||
                          orderUser?.name?.toLowerCase().includes(orderSearch.toLowerCase())
                        );
                      }).map((o, i) => (
                        <tr key={`admin-order-desktop-${o.id}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-8">
                            <div className="space-y-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</div>
                              <div className="font-mono text-xs font-black text-indigo-950 bg-slate-100 px-2 py-1 rounded w-fit select-all">#{o.id}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Player ID</div>
                              <div className="font-mono text-xs font-black text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit select-all">{o.uid || 'N/A'}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">User ID</div>
                              <div className="font-mono text-xs font-black text-red-500 bg-red-50 px-2 py-1 rounded w-fit select-all">{allUsers.find(u => u.id === o.userId)?.supportPin || 'N/A'}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Time</div>
                              <div className="font-mono text-xs font-black text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit">{new Date(o.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">{o.userEmail?.charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="font-black text-indigo-950 text-sm">{allUsers.find(u => u.id === o.userId)?.name || 'Unknown User'}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{o.userEmail}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{o.gameName} • {o.packageName}</div>
                                <div className="text-[10px] text-slate-500 font-bold mt-0.5">Phone: {o.phoneNumber || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-red-500" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-indigo-950">{o.paymentMethod} • ৳{o.price || packages.find(p => p.name === o.packageName.split(' ').slice(1).join(' '))?.price || 'N/A'}</div>
                                <div className="text-[10px] font-mono text-slate-400 font-bold">{o.transactionId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <select value={o.status} onChange={e => handleOrderStatusChange(o, e.target.value)} className={`text-[10px] font-black p-2 rounded-xl border-2 outline-none transition-all ${
                              o.status === 'Completed' ? 'border-green-100 text-green-600 bg-green-50' :
                              o.status === 'Cancelled' ? 'border-red-100 text-red-600 bg-red-50' :
                              'border-orange-100 text-orange-600 bg-orange-50'
                            }`}>
                              <option>Pending</option><option>Processing</option><option>Completed</option><option>Cancelled</option>
                            </select>
                          </td>
                          <td className="p-8 text-right">
                            <button onClick={() => remove(ref(db, `orders/${o.id}`))} className="text-red-400 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                  {orders.filter(o => 
                    o.userEmail?.toLowerCase().includes(orderSearch.toLowerCase()) || 
                    o.transactionId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.uid?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.userId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.phoneNumber?.toLowerCase().includes(orderSearch.toLowerCase())
                  ).map((o, i) => (
                    <div key={`admin-order-mobile-${o.id}-${i}`} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex-shrink-0 flex items-center justify-center text-indigo-600 font-black text-xs">{o.userEmail?.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0 flex-1">
                            <div className="font-black text-indigo-950 text-xs truncate">{o.userEmail}</div>
                            <div className="text-[10px] text-slate-500 font-bold truncate">Phone: {o.phoneNumber || 'N/A'}</div>
                            <div className="text-[10px] text-slate-400 font-bold truncate">{new Date(o.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                            <div className="text-[10px] text-slate-400 font-bold truncate">Order #{o.id}</div>
                          </div>
                        </div>
                        <button onClick={() => remove(ref(db, `orders/${o.id}`))} className="text-red-400 p-2 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 overflow-hidden">
                          <div className="text-[10px] text-slate-400 font-bold uppercase truncate">Game Info</div>
                          <div className="font-black text-indigo-950 truncate">{o.gameName}</div>
                          <div className="text-indigo-600 font-bold truncate">{o.packageName}</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 overflow-hidden">
                          <div className="text-[10px] text-slate-400 font-bold uppercase truncate">Payment</div>
                          <div className="font-black text-indigo-950 truncate">{o.paymentMethod}</div>
                          <div className="font-mono text-[10px] text-slate-500 truncate" title={o.transactionId}>{o.transactionId}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg">ID: {o.uid}</div>
                        <select value={o.status} onChange={e => handleOrderStatusChange(o, e.target.value)} className={`flex-1 text-[10px] font-black p-2 rounded-xl border-2 outline-none transition-all ${
                          o.status === 'Completed' ? 'border-green-100 text-green-600 bg-green-50' :
                          o.status === 'Cancelled' ? 'border-red-100 text-red-600 bg-red-50' :
                          'border-orange-100 text-orange-600 bg-orange-50'
                        }`}>
                          <option>Pending</option><option>Processing</option><option>Completed</option><option>Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === 'games' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-indigo-950">Game Catalog</h3>
                  <button onClick={() => setEditGame({})} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"><Plus className="w-5 h-5" /> Add New Game</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {games.length === 0 ? (
                    Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)
                  ) : (
                    games.map((g, i) => (
                      <div key={`admin-game-${g.id}-${i}`} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="relative h-48 rounded-[2rem] overflow-hidden mb-6">
                          <img src={g.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => setEditGame(g)} className="bg-white/90 backdrop-blur-sm p-3 rounded-xl text-indigo-600 shadow-lg hover:bg-white transition-all"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => remove(ref(db, `games/${g.id}`))} className="bg-white/90 backdrop-blur-sm p-3 rounded-xl text-red-500 shadow-lg hover:bg-white transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-black text-xl text-indigo-950">{g.name}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{g.category}</div>
                          </div>
                          <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Active</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {adminTab === 'packages' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-indigo-950">Package Management</h3>
                  <button onClick={() => setEditPkg({})} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"><Plus className="w-5 h-5" /> Create Package</button>
                </div>
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
                      <tr><th className="p-8">Game</th><th className="p-8">Package Details</th><th className="p-8">Price</th><th className="p-8 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {packages.length === 0 ? (
                        Array(6).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td className="p-8"><Skeleton className="h-10 w-32" /></td>
                            <td className="p-8"><Skeleton className="h-6 w-24" /></td>
                            <td className="p-8"><Skeleton className="h-8 w-16" /></td>
                            <td className="p-8"><Skeleton className="h-8 w-20 ml-auto" /></td>
                          </tr>
                        ))
                      ) : (
                        packages.map((p, i) => (
                          <tr key={`admin-package-${p.id}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <img src={games.find(g => g.id === p.gameId)?.image} className="w-10 h-10 rounded-xl object-cover" />
                                <div className="font-black text-indigo-950 text-sm">{games.find(g => g.id === p.gameId)?.name}</div>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="text-sm font-bold text-indigo-950">{p.amount} {p.name}</div>
                            </td>
                            <td className="p-8">
                              <div className="text-lg font-black text-red-500">৳{p.price}</div>
                            </td>
                            <td className="p-8 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditPkg(p)} className="text-indigo-600 p-3 hover:bg-indigo-50 rounded-xl transition-all"><Edit className="w-5 h-5" /></button>
                                <button onClick={() => remove(ref(db, `packages/${p.id}`))} className="text-red-400 p-3 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'settings' && (
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-indigo-950">Global Configuration</h3>
                  <p className="text-slate-400 font-bold text-sm">Control every aspect of your platform</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Site Name</label>
                    <input value={siteSettings.siteName} onChange={e => setSiteSettings({...siteSettings, siteName: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Site Logo URL</label>
                    <input value={siteSettings.siteLogo} onChange={e => setSiteSettings({...siteSettings, siteLogo: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notice Bar Content</label>
                    <textarea value={siteSettings.notice} onChange={e => setSiteSettings({...siteSettings, notice: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                      <input value={siteSettings.whatsapp} onChange={e => setSiteSettings({...siteSettings, whatsapp: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telegram</label>
                      <input value={siteSettings.telegram} onChange={e => setSiteSettings({...siteSettings, telegram: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">App Download Link</label>
                    <input value={siteSettings.appLink || ''} onChange={e => setSiteSettings({...siteSettings, appLink: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">YouTube Tutorial ID</label>
                    <input value={siteSettings.youtube} onChange={e => setSiteSettings({...siteSettings, youtube: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" placeholder="Video ID or Link" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">bKash Number</label>
                      <input value={siteSettings.bkashNumber} onChange={e => setSiteSettings({...siteSettings, bkashNumber: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">bKash Logo URL</label>
                      <input value={siteSettings.bkashLogo} onChange={e => setSiteSettings({...siteSettings, bkashLogo: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nagad Number</label>
                      <input value={siteSettings.nagadNumber} onChange={e => setSiteSettings({...siteSettings, nagadNumber: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nagad Logo URL</label>
                      <input value={siteSettings.nagadLogo} onChange={e => setSiteSettings({...siteSettings, nagadLogo: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rocket Number</label>
                      <input value={siteSettings.rocketNumber} onChange={e => setSiteSettings({...siteSettings, rocketNumber: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rocket Logo URL</label>
                      <input value={siteSettings.rocketLogo} onChange={e => setSiteSettings({...siteSettings, rocketLogo: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Selected Package Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings.selectedPackageColor || '#eff6ff'} onChange={e => setSiteSettings({...siteSettings, selectedPackageColor: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-100 p-1" />
                        <input type="text" value={siteSettings.selectedPackageColor || '#eff6ff'} onChange={e => setSiteSettings({...siteSettings, selectedPackageColor: e.target.value})} className="flex-1 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Out Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings.stockOutColor || '#f8fafc'} onChange={e => setSiteSettings({...siteSettings, stockOutColor: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-100 p-1" />
                        <input type="text" value={siteSettings.stockOutColor || '#f8fafc'} onChange={e => setSiteSettings({...siteSettings, stockOutColor: e.target.value})} className="flex-1 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings.priceColor || '#ef4444'} onChange={e => setSiteSettings({...siteSettings, priceColor: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-100 p-1" />
                        <input type="text" value={siteSettings.priceColor || '#ef4444'} onChange={e => setSiteSettings({...siteSettings, priceColor: e.target.value})} className="flex-1 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Premium Threshold (৳)</label>
                      <input type="number" value={siteSettings.premiumThreshold || 10000} onChange={e => setSiteSettings({...siteSettings, premiumThreshold: parseInt(e.target.value)})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Loyalty Discount Rules (Bullet Points)</label>
                      <textarea value={siteSettings.loyaltyRules} onChange={e => setSiteSettings({...siteSettings, loyaltyRules: e.target.value})} className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" rows={8} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category Sort Order (One per line)</label>
                      <textarea 
                        value={siteSettings.categorySort?.join('\n') || ''} 
                        onChange={e => setSiteSettings({...siteSettings, categorySort: e.target.value.split('\n').filter(s => s.trim())})} 
                        className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" 
                        rows={4} 
                        placeholder="e.g.&#10;In-Game Topup&#10;ID Code Topup&#10;Gift Card"
                      />
                      <p className="text-[10px] text-slate-400 font-bold italic mt-1">Categories will appear on the homepage in this exact order.</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Home Banners (Attractive Offers - One URL per line)</label>
                      <textarea 
                        value={siteSettings.homeBanners?.join('\n') || ''} 
                        onChange={e => setSiteSettings({...siteSettings, homeBanners: e.target.value.split('\n').filter(s => s.trim())})} 
                        className="w-full border-2 border-slate-100 p-4 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all" 
                        rows={4} 
                        placeholder="https://example.com/banner1.jpg&#10;https://example.com/banner2.jpg"
                      />
                      <p className="text-[10px] text-slate-400 font-bold italic mt-1">These banners will appear right below the main slider.</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => set(ref(db, 'settings'), siteSettings)} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-indigo-100 hover:scale-[1.02] transition-all">Update Platform Settings</button>
              </div>
            )}
            {adminTab === 'users' && (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-indigo-950">User Directory</h3>
                  <div className="text-xs font-bold text-slate-400 uppercase">Total Users: {allUsers.length}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
                      <tr><th className="p-8">User Profile</th><th className="p-8">User ID</th><th className="p-8">Wallet Balance</th><th className="p-8">Activity</th><th className="p-8 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allUsers.map((u, i) => (
                        <tr key={`user-directory-${u.id}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-100">
                                <img src={`https://ui-avatars.com/api/?name=${u.name || 'User'}&background=6366f1&color=fff`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="font-black text-indigo-950 text-sm">{u.name || 'User'}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{u.email || 'No Email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="font-mono text-xs font-black text-indigo-950 bg-slate-100 px-2 py-1 rounded w-fit select-all">{u.supportPin || 'N/A'}</div>
                          </td>
                           <td className="p-8">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Wallet className="w-3 h-3 text-green-500" />
                                <span className="text-sm font-black text-indigo-950">৳{u.balance || 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <History className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-bold text-slate-400">Spent: ৳{u.totalSpent || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-indigo-950">Orders: {u.totalOrders || 0}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active</div>
                            </div>
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => {
                                const newBalance = prompt('Enter new balance:', u.balance);
                                if (newBalance !== null) {
                                  update(ref(db, `users/${u.id}`), { balance: Number(newBalance) });
                                }
                              }} className="text-indigo-600 p-3 hover:bg-indigo-50 rounded-xl transition-all font-black text-xs uppercase">Edit Balance</button>
                              <button onClick={() => {
                                const newSpent = prompt('Enter new total spent:', u.totalSpent || 0);
                                if (newSpent !== null) {
                                  update(ref(db, `users/${u.id}`), { totalSpent: Number(newSpent) });
                                }
                              }} className="text-orange-600 p-3 hover:bg-orange-50 rounded-xl transition-all font-black text-xs uppercase">Edit Spent</button>
                              <button onClick={() => {
                                setAdminTab('orders');
                                setOrderSearch(u.id);
                              }} className="text-red-500 p-3 hover:bg-red-50 rounded-xl transition-all font-black text-xs uppercase">Orders</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-8 bg-slate-50/50 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of User Directory</div>
              </div>
            )}

            {adminTab === 'ai' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-indigo-950">AI Order Assistant</h3>
                      <p className="text-slate-400 font-bold text-sm">Enter a Transaction ID to analyze the order</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Enter Transaction ID (TxID)..." 
                        value={aiSearchTrxId}
                        onChange={(e) => setAiSearchTrxId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-600 outline-none transition-all"
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
                              model: 'gemini-3-flash-preview',
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
                      className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {isAiSearching ? 'Analyzing...' : 'Analyze TxID'}
                    </button>
                  </div>

                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-2xl border-2 ${aiSearchResult ? 'bg-indigo-50 border-indigo-100 text-indigo-900' : 'bg-red-50 border-red-100 text-red-900'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${aiSearchResult ? 'bg-indigo-600' : 'bg-red-600'} text-white`}>
                          {aiSearchResult ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-sm uppercase tracking-wider mb-1">{aiSearchResult ? 'Order Verified' : 'Verification Failed'}</div>
                          <p className="text-sm font-bold leading-relaxed">{aiResponse}</p>
                          
                          {aiSearchResult && (
                            <button 
                              onClick={() => {
                                setAdminTab('orders');
                                setOrderSearch(aiSearchResult.id);
                              }}
                              className="mt-4 flex items-center gap-2 text-indigo-600 font-black text-xs hover:underline"
                            >
                              View Details <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {aiSearchResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6"
                  >
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <h4 className="text-lg font-black text-indigo-950">Transaction Details</h4>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this order?')) {
                            remove(ref(db, `orders/${aiSearchResult.id}`));
                            setAiSearchResult(null);
                            setAiResponse('Order deleted successfully.');
                          }
                        }}
                        className="flex items-center gap-2 text-red-500 font-black text-xs hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Order
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</div>
                        <div className="font-bold text-indigo-950">{aiSearchResult.userEmail}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</div>
                        <div className="font-bold text-indigo-950">{aiSearchResult.id}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Game & Package</div>
                        <div className="font-bold text-indigo-950">{aiSearchResult.gameName} - {aiSearchResult.packageName}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Player ID</div>
                        <div className="font-bold text-red-500">{aiSearchResult.uid}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</div>
                        <div className="font-bold text-indigo-950">{aiSearchResult.paymentMethod}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          aiSearchResult.status === 'Completed' ? 'bg-green-100 text-green-600' :
                          aiSearchResult.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {aiSearchResult.status}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-indigo-950 text-white pt-20 pb-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="text-red-500 w-8 h-8 fill-current" />
              <span className="text-2xl font-black">STB <span className="text-red-500">TOPUP</span></span>
            </div>
            <p className="text-slate-400 font-bold text-sm leading-relaxed">The most trusted gaming top-up platform in Bangladesh. Fast, secure, and reliable service for all your favorite games.</p>
            <div className="flex gap-4">
              <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-500 transition-all"><Globe className="w-5 h-5" /></button>
              <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-500 transition-all"><MessageCircle className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-black mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400 font-bold text-sm">
              <li><button onClick={() => setView('home')} className="hover:text-red-500 transition-colors">Topup Center</button></li>
              <li><button onClick={() => setView('privacy')} className="hover:text-red-500 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => setView('privacy')} className="hover:text-red-500 transition-colors">Terms of Service</button></li>
              <li><button onClick={() => window.open(`https://wa.me/${siteSettings.whatsapp}`)} className="hover:text-red-500 transition-colors">Contact Support</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black mb-6">Support Center</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase">WhatsApp</div>
                  <div className="text-sm font-black">{siteSettings.whatsapp}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase">Telegram</div>
                  <div className="text-sm font-black">@{siteSettings.telegram}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black mb-6">Download App</h4>
            <button className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all"><Globe className="w-6 h-6" /></div>
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-400 uppercase">Get it on</div>
                <div className="text-sm font-black">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 font-bold text-sm cursor-pointer hover:text-red-500 transition-colors select-none" onClick={handleFooterClick}>
            © 2026 STB TOPUP. All Rights Reserved.
          </div>
          <div className="flex gap-8 text-slate-500 font-bold text-sm">
            <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">Cookies</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal 
        key="admin-login-modal"
        isOpen={isAdminLoginModalOpen} 
        onClose={() => setIsAdminLoginModalOpen(false)}
        title="Admin Access"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input type="text" placeholder="Username" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full border p-4 rounded-xl font-bold" />
          <input type="password" placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full border p-4 rounded-xl font-bold" />
          <button className="w-full bg-indigo-950 text-white py-4 rounded-xl font-black shadow-lg">Login as Admin</button>
        </form>
      </Modal>

      <Modal
        key="order-modal"
        isOpen={isOrderModalOpen && !!selectedPackage}
        onClose={() => { setIsOrderModalOpen(false); setView('payment-cancelled'); }}
        maxWidth="max-w-md"
      >
        {selectedPackage && (
          <div className="-mx-8 -mt-2">
            <div className="bg-gradient-to-br from-red-600 to-red-500 p-10 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <Zap className="w-full h-full scale-150 -rotate-12" />
              </div>
              <h3 className="text-3xl font-black mb-2">Checkout</h3>
              <p className="text-xs font-bold opacity-80 tracking-widest uppercase">Complete your top-up securely</p>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</span>
                  <span className="text-sm font-black text-indigo-950">{selectedGame?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Package</span>
                  <span className="text-sm font-black text-indigo-950">{selectedPackage.amount} {selectedPackage.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Player ID</span>
                  <span className="text-sm font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg">{uid}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-950">Total Amount</span>
                  <span className="text-2xl font-black text-red-500">৳{selectedPackage.price}</span>
                </div>
              </div>

              {paymentType === 'instant' ? (
                <div className="space-y-6">
                  <div className="bg-indigo-950 p-6 rounded-[2rem] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700"></div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{paymentMethod} Personal</span>
                      <button onClick={() => copyToClipboard(
                        paymentMethod === 'Bkash' ? siteSettings.bkashNumber :
                        paymentMethod === 'Nagad' ? siteSettings.nagadNumber :
                        paymentMethod === 'Rocket' ? siteSettings.rocketNumber :
                        siteSettings.upayNumber
                      )} className="text-[10px] font-black flex items-center gap-1 hover:text-red-400 transition-colors bg-white/10 px-3 py-1 rounded-full"><Copy className="w-3 h-3" /> Copy</button>
                    </div>
                    <div className="text-3xl font-black text-center tracking-[0.2em]">
                      {paymentMethod === 'Bkash' ? siteSettings.bkashNumber :
                       paymentMethod === 'Nagad' ? siteSettings.nagadNumber :
                       paymentMethod === 'Rocket' ? siteSettings.rocketNumber :
                       siteSettings.upayNumber}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Your Phone Number</label>
                      <input type="text" placeholder="Enter your phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full border-2 border-slate-100 p-5 rounded-2xl focus:border-red-500 outline-none font-mono text-sm font-black transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Transaction ID (TrxID)</label>
                      <input type="text" placeholder="Enter 10-digit TrxID" value={trxId} onChange={e => setTrxId(e.target.value)} className="w-full border-2 border-slate-100 p-5 rounded-2xl focus:border-red-500 outline-none font-mono text-sm font-black transition-all" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-dashed border-orange-200 text-center space-y-4">
                  <Wallet className="w-12 h-12 text-orange-500 mx-auto" />
                  <div>
                    <div className="text-lg font-black text-indigo-950">Wallet Payment</div>
                    <p className="text-xs font-bold text-slate-400">Pay securely from your balance</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-orange-100 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Your Balance</div>
                      <div className={`text-lg font-black ${(userProfile.balance || 0) < (selectedPackage?.price || 0) ? 'text-red-500' : 'text-green-500'}`}>
                        ৳{userProfile.balance || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Product Cost</div>
                      <div className="text-lg font-black text-indigo-950">৳{selectedPackage?.price}</div>
                    </div>
                  </div>

                  {(userProfile.balance || 0) < (selectedPackage?.price || 0) ? (
                    <div className="bg-red-100 text-red-600 p-3 rounded-xl text-xs font-bold">
                      Insufficient Balance. Please add money.
                    </div>
                  ) : (
                    <div className="bg-green-100 text-green-600 p-3 rounded-xl text-xs font-bold">
                      Sufficient Balance. You can buy now.
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => { setIsOrderModalOpen(false); setView('payment-cancelled'); }} className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                
                {paymentType === 'wallet' && (userProfile.balance || 0) < (selectedPackage?.price || 0) ? (
                   <button onClick={() => { setIsOrderModalOpen(false); setView('add-money'); }} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">
                     Add Money
                   </button>
                ) : (
                   <button onClick={handleOrder} disabled={isSubmitting} className="flex-[2] bg-red-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                     {isSubmitting ? 'Processing...' : paymentType === 'wallet' ? 'Buy Now' : 'Confirm Order'}
                   </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        key="auth-modal"
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        maxWidth="max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/20 rotate-12 group">
            <Zap className="w-10 h-10 text-white fill-current group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-indigo-950 tracking-tighter">
            {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-slate-400 font-bold text-sm mt-2">
            {authMode === 'login' ? 'Login to access your dashboard' : authMode === 'register' ? 'Join the elite gaming community' : 'Enter your email to reset password'}
          </p>
        </div>

        <div className="space-y-6">
          {authMode !== 'forgot' && (
            <>
              {authError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {authError}
                </motion.div>
              )}
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 p-4 rounded-2xl font-black text-indigo-950 hover:bg-slate-50 transition-all hover:border-indigo-100">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
                Continue with Google
              </button>
              
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <span className="relative bg-white px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Email Login</span>
              </div>
            </>
          )}

          {authMode === 'forgot' && authError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-slate-100 p-4 pl-12 rounded-2xl font-bold focus:border-red-500 outline-none transition-all" required />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full border-2 border-slate-100 p-4 pl-12 rounded-2xl font-bold focus:border-red-500 outline-none transition-all" required />
              </div>
            </div>
            {authMode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Password</label>
                  {authMode === 'login' && (
                    <button type="button" onClick={() => setAuthMode('forgot')} className="text-[10px] font-black text-red-500 uppercase hover:underline">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full border-2 border-slate-100 p-4 pl-12 rounded-2xl font-bold focus:border-red-500 outline-none transition-all" required />
                </div>
              </div>
            )}
            <button className="w-full bg-red-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={isAuthLoading}>
              {isAuthLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                authMode === 'login' ? 'Sign In Now' : authMode === 'register' ? 'Create My Account' : 'Send Reset Link'
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">
            {authMode === 'login' ? "Don't have an account? " : authMode === 'register' ? "Already have an account? " : "Back to "}
            <span className="text-red-500 font-black">{authMode === 'login' ? 'Register' : 'Login'}</span>
          </button>
        </div>
      </Modal>

      <Modal
        key="edit-game-modal"
        isOpen={!!editGame}
        onClose={() => setEditGame(null)}
        title="Edit Game"
        maxWidth="max-w-md"
      >
        {editGame && (
          <div className="space-y-4">
            <input placeholder="Name" value={editGame.name || ''} onChange={e => setEditGame({...editGame, name: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input placeholder="Image URL" value={editGame.image || ''} onChange={e => setEditGame({...editGame, image: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input placeholder="Category" value={editGame.category || ''} onChange={e => setEditGame({...editGame, category: e.target.value})} className="w-full border p-3 rounded-xl" />
            
            <div className="relative">
              <textarea 
                placeholder="Description (Optional)" 
                value={editGame.description || ''} 
                onChange={e => setEditGame({...editGame, description: e.target.value})} 
                className="w-full border p-3 rounded-xl h-24 text-sm"
              />
              <button 
                onClick={generateGameDescription}
                disabled={isGenerating}
                className="absolute bottom-2 right-2 bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
                title="Generate with AI"
              >
                {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-xl">
              <input 
                type="checkbox" 
                id="isPremium"
                checked={editGame.isPremium || false} 
                onChange={e => setEditGame({...editGame, isPremium: e.target.checked})} 
                className="w-5 h-5 accent-indigo-600"
              />
              <label htmlFor="isPremium" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Premium Game (Requires Loyalty)
              </label>
            </div>

            <button onClick={adminSaveGame} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black">Save</button>
          </div>
        )}
      </Modal>

      <Modal
        key="edit-pkg-modal"
        isOpen={!!editPkg}
        onClose={() => setEditPkg(null)}
        title="Edit Package"
        maxWidth="max-w-md"
      >
        {editPkg && (
          <div className="space-y-4">
            <select value={editPkg.gameId || ''} onChange={e => setEditPkg({...editPkg, gameId: e.target.value})} className="w-full border p-3 rounded-xl">
              <option value="">Select Game</option>{games.map((g, i) => <option key={`game-opt-${g.id}-${i}`} value={g.id}>{g.name}</option>)}
            </select>
            <input placeholder="Amount" value={editPkg.amount || ''} onChange={e => setEditPkg({...editPkg, amount: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input placeholder="Name (e.g. Diamond)" value={editPkg.name || ''} onChange={e => setEditPkg({...editPkg, name: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input placeholder="Price" type="number" value={editPkg.price === undefined || isNaN(editPkg.price as number) ? '' : editPkg.price} onChange={e => setEditPkg({...editPkg, price: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full border p-3 rounded-xl" />
            <input placeholder="Stock Quantity (Optional)" type="number" value={editPkg.stock === undefined ? '' : editPkg.stock} onChange={e => setEditPkg({...editPkg, stock: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full border p-3 rounded-xl" />
            <div className="flex items-center gap-3 p-3 border rounded-xl">
              <input 
                type="checkbox" 
                id="inStock"
                checked={editPkg.inStock !== false} 
                onChange={e => setEditPkg({...editPkg, inStock: e.target.checked})} 
                className="w-5 h-5 accent-indigo-600"
              />
              <label htmlFor="inStock" className="text-sm font-bold text-slate-700">In Stock</label>
            </div>
            <button onClick={adminSavePkg} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black">Save</button>
          </div>
        )}
      </Modal>
      
      <AIChatbot 
        isAdmin={isAdminLoggedIn} 
        orders={orders} 
        packages={packages} 
        user={user} 
        onAddPackage={(pkgData) => {
          const newPkg = {
            id: `pkg-${Date.now()}`,
            gameId: pkgData.gameId || games[0]?.id || 'free-fire',
            name: pkgData.name,
            amount: pkgData.amount || pkgData.name,
            price: pkgData.price,
            inStock: true,
            stock: pkgData.stock || 999
          };
          setPackages(prev => [...prev, newPkg]);
          set(ref(db, 'packages'), [...packages, newPkg]);
        }}
      />
      <BottomNav view={view} setView={setView} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="md:hidden h-20"></div>
    </div>
  );
}
