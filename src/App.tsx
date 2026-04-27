import { useState, useEffect } from 'react';
import { 
  Search, 
  Home, 
  ShoppingCart, 
  MapPin, 
  User, 
  Plus, 
  LogOut, 
  ChevronLeft,
  Clock,
  Map as MapIcon,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  Star,
  Share2,
  MessageSquare,
  Lock,
  Edit3,
  ShoppingBag,
  History,
  Truck,
  HeartPulse,
  Info,
  ChevronRight,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { collection, getDocs, addDoc } from 'firebase/firestore';

interface Medicine {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  category?: string;
}

const PROFILE_SECTIONS = [
  {
    title: 'ACCOUNT',
    items: [
      { id: 'edit_profile', label: 'Edit Profile', icon: Edit3 },
      { id: 'saved_addresses', label: 'Saved Addresses', icon: MapPin },
      { id: 'change_password', label: 'Change Password', icon: Lock }
    ]
  },
  {
    title: 'ORDERS & ACTIVITY',
    items: [
      { id: 'my_orders', label: 'My Orders', icon: ShoppingBag },
      { id: 'order_history', label: 'Order History', icon: History },
      { id: 'track_order', label: 'Track Order', icon: Truck }
    ]
  },
  {
    title: 'PAYMENTS & INFO',
    items: [
      { id: 'payment_methods', label: 'Payment Methods (COD)', icon: CreditCard },
      { id: 'saved_prescriptions', label: 'Saved Prescriptions', icon: HeartPulse }
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { id: 'notifications', label: 'Notifications Settings', icon: Bell, isToggle: true },
      { id: 'language', label: 'Language Selection', icon: Globe }
    ]
  },
  {
    title: 'LEGAL & INFO',
    items: [
      { id: 'privacy', label: 'Privacy Policy', icon: Shield },
      { id: 'terms', label: 'Terms & Conditions', icon: FileText },
      { id: 'refund', label: 'Refund Policy', icon: CreditCard },
      { id: 'about', label: 'About Us', icon: Info },
      { id: 'contact', label: 'Contact Us', icon: MessageSquare }
    ]
  },
  {
    title: 'ENGAGEMENT',
    items: [
      { id: 'rate', label: 'Rate App', icon: Star },
      { id: 'share', label: 'Share App', icon: Share2 },
      { id: 'feedback', label: 'Feedback / Report Issue', icon: MessageSquare }
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { id: 'help', label: 'Help & Support', icon: HelpCircle },
      { id: 'faq', label: 'FAQ', icon: HelpCircle }
    ]
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile Advanced State
  const [subScreen, setSubScreen] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddressTitle, setNewAddressTitle] = useState('');
  const [newAddressDetails, setNewAddressDetails] = useState('');

  useEffect(() => {
    if (subScreen === 'saved_addresses' && user) {
      const fetchAddresses = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'users', user.uid, 'addresses'));
          setSavedAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch(e) {
          console.error("Error fetching addresses", e);
        }
      };
      fetchAddresses();
    }
  }, [subScreen, user]);
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'medicines'));
        const medsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
        setMedicines(medsList);
      } catch(e) {
        console.error("Error fetching medicines", e);
      }
    };
    fetchMedicines();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentScreen === 'auth') {
        setCurrentScreen('home');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        if(user) setCurrentScreen('home');
        else setCurrentScreen('auth');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, user]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setCurrentScreen('home');
    } catch(e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      setCurrentScreen('home');
    } catch(e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (med: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === med.id);
      if (existing) {
        return prev.map((item) =>
          item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans relative">
      <div className="flex-1 overflow-y-auto relative pb-20">
          <AnimatePresence mode="wait">
            
            {/* SPLASH SCREEN */}
            {currentScreen === 'splash' && (
              <motion.div
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white"
              >
                <div className="p-4 bg-white/20 backdrop-blur rounded-2xl mb-4">
                  <Plus className="w-16 h-16" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">MediHub</h1>
                <div className="absolute bottom-16 animate-pulse">
                  <div className="w-8 h-8 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
                </div>
              </motion.div>
            )}

            {/* AUTH SCREEN */}
            {currentScreen === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 bg-neutral-50 flex flex-col justify-center p-8"
              >
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-bold text-emerald-600 mb-2">MediHub</h1>
                  <p className="text-neutral-500">Your health, delivered.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white" />
                  </div>
                  <div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white" />
                  </div>
                  
                  <button 
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl mt-4 active:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Wait...' : 'Login'}
                  </button>
                  <button 
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full bg-white text-emerald-600 border-2 border-emerald-500 font-bold py-3.5 rounded-xl active:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    Sign Up
                  </button>
                  
                  <p className="text-center text-emerald-600 font-medium mt-4 text-sm">Forgot Password?</p>
                </div>
              </motion.div>
            )}

            {/* HOME SCREEN */}
            {currentScreen === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-full flex flex-col"
              >
                <div className="bg-emerald-500 pt-4 pb-6 px-4 rounded-b-3xl shadow-sm z-10">
                  <div className="flex justify-between items-center mb-4 text-white">
                    <div>
                      <p className="text-emerald-100 text-xs">Deliver to</p>
                      <h2 className="font-bold flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Current Location
                      </h2>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Search medicines..." 
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white outline-none shadow-sm text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="px-4 py-4 content-start flex-1">
                  <h3 className="font-bold text-neutral-800 mb-4">Featured Medicines</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {medicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map((med) => (
                      <div key={med.id} className="bg-white rounded-2xl p-3 shadow-sm border border-neutral-100 flex flex-col">
                        <div className="h-24 bg-neutral-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                          {med.imageUrl ? (
                            <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover mix-blend-multiply" />
                          ) : (
                             <Plus className="w-8 h-8 text-neutral-300" />
                          )}
                        </div>
                        <h4 className="font-bold text-neutral-800 text-sm leading-tight flex-1">{med.name}</h4>
                        <p className="text-xs text-neutral-500 mb-2 truncate">{med.description || med.category}</p>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="font-bold text-emerald-600">${med.price.toFixed(2)}</span>
                          <button 
                            onClick={() => addToCart(med)}
                            className="bg-emerald-50 w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 active:bg-emerald-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* CART & CHECKOUT SCREEN */}
            {currentScreen === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-h-full flex flex-col bg-neutral-50"
              >
                <div className="bg-emerald-500 px-4 py-4 flex items-center gap-3 text-white sticky top-0 z-10">
                  <button onClick={() => setCurrentScreen('home')}><ChevronLeft /></button>
                  <h2 className="font-bold text-lg">Cart & Checkout</h2>
                </div>

                <div className="p-4 flex-1">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 mt-20">
                      <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-neutral-100 flex items-center gap-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-neutral-800">{item.name}</h4>
                            <p className="text-emerald-600 font-bold">${item.price}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-neutral-50 px-2 py-1 rounded-lg">
                            <span className="font-bold text-sm">x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="bg-white p-4 border-t border-neutral-200 mt-auto shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between mb-4 font-bold text-lg">
                      <span>Total</span>
                      <span className="text-emerald-600">${totalCartPrice.toFixed(2)}</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Delivery Address" 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:border-emerald-500"
                    />
                    <button className="w-full bg-neutral-50 text-neutral-600 border border-neutral-300 font-semibold py-3 rounded-xl mb-3 text-sm">
                      Upload Prescription (Optional)
                    </button>
                    <button 
                      onClick={async () => {
                        if(!address) return alert("Please enter address");
                        if(!user) return alert("Please login first");
                        setLoading(true);
                        try {
                          await addDoc(collection(db, 'orders'), {
                            userId: user.uid,
                            address,
                            total: totalCartPrice,
                            status: 'Pending',
                            items: cart,
                            createdAt: Date.now()
                          });
                          setCurrentScreen('tracking');
                          setCart([]);
                          setAddress('');
                        } catch(e) {
                           alert("Failed to place order");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl text-sm disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Place Order (COD)'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TRACKING SCREEN */}
            {currentScreen === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-full flex flex-col"
              >
                <div className="bg-emerald-500 px-4 py-4 flex items-center gap-3 text-white">
                  <button onClick={() => setCurrentScreen('home')}><ChevronLeft /></button>
                  <h2 className="font-bold text-lg">Live Tracking</h2>
                </div>
                
                <div className="flex-1 bg-blue-50 relative overflow-hidden">
                  {/* Mock Map Background */}
                  <div className="absolute inset-0 opacity-30 bg-[url('https://maps.geoapify.com/v1/staticmap?style=osm-liberty&width=400&height=600&center=lonlat:77.5946,12.9716&zoom=14&apiKey=8fd8b797090b479fa155228614bee82d')] bg-cover bg-center" />
                  
                  {/* Mock Map UI Elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md relative z-10" />
                  </div>
                  <div className="absolute top-1/4 left-1/3">
                     <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                        <MapIcon className="w-4 h-4" />
                     </div>
                  </div>
                  
                  {/* Route Line Mock */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{strokeDasharray: "5,5"}}>
                    <path d="M 150 200 L 200 400" stroke="#3b82f6" strokeWidth="4" fill="none" />
                  </svg>
                </div>

                <div className="bg-white p-5 rounded-t-3xl shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] relative z-10 -mt-6">
                  <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4" />
                  <p className="text-neutral-500 text-sm font-medium">Order Status</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mb-1">Out for Delivery</h3>
                  <div className="flex items-center gap-2 text-neutral-600 mt-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-sm">ETA: 15 mins</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PROFILE SCREEN */}
            {currentScreen === 'profile' && !subScreen && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-full flex flex-col bg-neutral-50 pb-20"
              >
                <div className="bg-emerald-500 px-4 py-4 text-white text-center sticky top-0 z-10 shadow-sm flex items-center justify-between">
                  <div className="w-6" /> {/* Spacer */}
                  <h2 className="font-bold text-lg">Profile</h2>
                  <Settings className="w-5 h-5 opacity-80" onClick={() => setSubScreen('settings_overview')} />
                </div>
                
                <div className="flex flex-col items-center pt-8 px-4 pb-4 bg-white shadow-sm mb-2 rounded-b-3xl">
                  <div className="relative">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-[0_5px_15px_-5px_rgba(16,185,129,0.3)] border-4 border-white">
                      <User className="w-10 h-10" />
                    </div>
                    <button className="absolute bottom-2 right-0 bg-white p-1.5 rounded-full shadow-md text-emerald-600 border border-neutral-100">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800">{user?.email?.substring(0, user?.email?.indexOf('@')) || 'User'}</h2>
                  <p className="text-neutral-500 mb-4 text-sm">{user?.email}</p>
                  <button 
                    onClick={() => setSubScreen('edit_profile')}
                    className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-bold text-sm"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="px-4 space-y-6 mt-4">
                  {PROFILE_SECTIONS.map((section, idx) => (
                    <div key={idx}>
                      <h3 className="text-xs font-bold text-neutral-400 mb-3 px-2 tracking-wider">{section.title}</h3>
                      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
                        {section.items.map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <div 
                              key={i}
                              onClick={() => {
                                if (item.id === 'rate' || item.id === 'share') {
                                  alert(`${item.label} Action Triggered!`);
                                } else if (!item.isToggle) {
                                  setSubScreen(item.id);
                                }
                              }}
                              className="w-full flex items-center justify-between p-4 active:bg-neutral-50 cursor-pointer"
                            >
                              <div className="flex items-center gap-3 text-neutral-700">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-sm">{item.label}</span>
                              </div>
                              {item.isToggle ? (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNotificationsEnabled(!notificationsEnabled);
                                  }}
                                  className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${notificationsEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                                >
                                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                              ) : (
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 pb-8 text-center text-xs text-neutral-400 space-y-6">
                    <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full bg-white border border-red-200 text-red-500 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    >
                      <LogOut className="w-5 h-5" /> Logout
                    </button>
                    <p>MediHub App Version 1.0.0</p>
                  </div>
                </div>

                {/* Logout Confirmation Dialog */}
                {showLogoutConfirm && (
                  <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                    >
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <LogOut className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Logout expected?</h3>
                        <p className="text-neutral-500 text-sm">Are you sure you want to sign out from your account?</p>
                      </div>
                      <div className="flex border-t border-neutral-100 bg-neutral-50">
                        <button 
                          onClick={() => setShowLogoutConfirm(false)}
                          className="flex-1 py-4 text-neutral-600 font-medium border-r border-neutral-100"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            setShowLogoutConfirm(false);
                            signOut(auth);
                            setCurrentScreen('auth');
                          }}
                          className="flex-1 py-4 text-red-500 font-bold"
                        >
                          Yes, Logout
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILE SUB-SCREENS */}
            {currentScreen === 'profile' && subScreen && (
              <motion.div
                key="subscreen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 bg-neutral-50 flex flex-col z-40"
              >
                <div className="bg-emerald-500 px-4 py-4 flex items-center gap-3 text-white shadow-sm">
                  <button onClick={() => setSubScreen(null)}><ChevronLeft /></button>
                  <h2 className="font-bold text-lg capitalize">{subScreen.replace(/_/g, ' ')}</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center text-neutral-500">
                  <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center mb-4 opacity-50">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 mb-2 capitalize">{subScreen.replace(/_/g, ' ')}</h3>
                  <p className="max-w-xs text-sm">This is a dynamic screen for {subScreen.replace(/_/g, ' ')}. In the Android app, this will open a new intent activity with the relevant layout.</p>
                  
                  {(subScreen === 'privacy' || subScreen === 'terms' || subScreen === 'refund' || subScreen === 'about' || subScreen === 'contact') && (
                    <div className="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mt-6 h-64 overflow-hidden relative">
                      <p className="text-xs leading-relaxed text-neutral-400">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                        <br/><br/>
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent" />
                    </div>
                  )}

                  {subScreen === 'saved_addresses' && (
                    <div className="w-full mt-6 flex flex-col gap-3">
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${addr.isSelected ? 'border-emerald-500' : 'border-neutral-300'}`}>
                            {addr.isSelected && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-neutral-800 text-sm">{addr.title}</h4>
                            <p className="text-xs text-neutral-500 mt-1">{addr.details}</p>
                          </div>
                        </div>
                      ))}

                      {savedAddresses.length === 0 && !showAddAddressForm && (
                        <div className="py-8 text-neutral-400 flex flex-col items-center">
                          <MapPin className="w-12 h-12 mb-3 opacity-50" />
                          <p>No saved addresses yet</p>
                        </div>
                      )}

                      {!showAddAddressForm ? (
                        <button 
                          onClick={() => setShowAddAddressForm(true)}
                          className="w-full mt-4 bg-emerald-50 text-emerald-600 font-bold py-3.5 rounded-xl border border-emerald-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" /> Add New Address
                        </button>
                      ) : (
                        <div className="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 mt-2 flex flex-col gap-3">
                          <h4 className="font-bold text-neutral-800">Add Address</h4>
                          <input 
                            placeholder="Title (e.g. Home, Work)" 
                            value={newAddressTitle}
                            onChange={(e) => setNewAddressTitle(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                          />
                          <textarea 
                            placeholder="Full Address" 
                            rows={3}
                            value={newAddressDetails}
                            onChange={(e) => setNewAddressDetails(e.target.value)}
                            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button 
                              onClick={() => setShowAddAddressForm(false)}
                              className="px-4 py-2 text-sm font-medium text-neutral-500"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={async () => {
                                if(!newAddressTitle || !newAddressDetails) return alert("Fill all fields");
                                if(!user) return;
                                try {
                                  const addrRef = collection(db, 'users', user.uid, 'addresses');
                                  await addDoc(addrRef, {
                                    title: newAddressTitle,
                                    details: newAddressDetails,
                                    isSelected: savedAddresses.length === 0
                                  });
                                  setShowAddAddressForm(false);
                                  setNewAddressTitle('');
                                  setNewAddressDetails('');
                                  const snapshot = await getDocs(addrRef);
                                  setSavedAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                                } catch(e) {
                                  alert("Error adding address");
                                }
                              }}
                              className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg"
                            >
                              Save Address
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {subScreen === 'payment_methods' && (
                    <div className="w-full mt-6 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                        <span className="font-bold text-neutral-800">Cash on Delivery</span>
                      </div>
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"/>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        {['home', 'cart', 'tracking', 'profile'].includes(currentScreen) && !subScreen && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-200 flex justify-around items-center py-3 px-4 text-xs font-medium text-neutral-400 z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
            <button 
              onClick={() => setCurrentScreen('home')}
              className={`flex flex-col items-center gap-1 w-16 ${(currentScreen === 'home' || currentScreen === 'tracking') ? 'text-emerald-600' : ''}`}
            >
              <Home className="w-6 h-6" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('cart')}
              className={`flex flex-col items-center gap-1 w-16 relative ${currentScreen === 'cart' ? 'text-emerald-600' : ''}`}
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </div>
                )}
              </div>
              <span>Cart</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('profile')}
              className={`flex flex-col items-center gap-1 w-16 ${currentScreen === 'profile' ? 'text-emerald-600' : ''}`}
            >
              <User className="w-6 h-6" />
              <span>Profile</span>
            </button>
          </div>
        )}
    </div>
  );
}

