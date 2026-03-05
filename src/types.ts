export interface Game {
  id: string;
  name: string;
  image: string;
  category: string;
  description?: string;
  isPremium?: boolean;
}

export interface Package {
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

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  uid: string;
  accountType?: string;
  gameName: string;
  packageName: string;
  paymentMethod: string;
  transactionId: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  timestamp: number;
  price: number;
  phoneNumber?: string;
}

export interface SiteSettings {
  notice: string;
  whatsapp: string;
  telegram: string;
  appLink?: string;
  youtube: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  upayNumber?: string;
  sliderImages: { id: string; url: string; link?: string }[];
  sliderInterval: number;
  bkashLogo: string;
  nagadLogo: string;
  rocketLogo: string;
  upayLogo?: string;
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

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  photoURL?: string;
  role?: 'user' | 'admin';
  phone?: string;
  balance: number;
  totalSpent: number;
  totalOrders: number;
  isVerified: boolean;
  supportPin: string;
}
