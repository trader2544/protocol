import React, { useState, useEffect, useMemo } from 'react';
import { Settings, ShieldAlert, ArrowRight, User, AlertCircle, X, HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';

// Import our modular components
import Header from './components/Header';
import FilterForm from './components/FilterForm';
import CardTable from './components/CardTable';
import NewsView from './components/NewsView';
import WholesaleView from './components/WholesaleView';
import AuctionView from './components/AuctionView';
import ToolsView from './components/ToolsView';
import TicketsView from './components/TicketsView';
import HelpView from './components/HelpView';
import CartOrdersView from './components/CartOrdersView';
import Modals from './components/Modals';
import AdminPanel from './components/AdminPanel';

// Import models and types
import { ActiveTab, UserProfile, CardItem, SupportTicket, AuctionItem, WholesalePack, NewsItem } from './types';

// Import Firestore service functions
import {
  getUserProfile,
  updateUserProfile,
  getCards,
  addCard,
  deleteCard,
  getNews,
  getWholesalePacks,
  getAuctions,
  updateAuctionBid,
  getTickets,
  createTicket,
  updateTicketMessages,
  getOrders,
  createOrder,
  getSystemSettings,
  updateSystemSettings,
  SystemSettings
} from './utils/dbService';

import { db } from './firebase';
import AuthPage from './components/AuthPage';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<(UserProfile & { role: 'admin' | 'customer' }) | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Default active tab to CVV2 as shown in user's screenshot
  const [activeTab, setActiveTab] = useState<ActiveTab>('cvv2');
  
  // Settings gear drawer panel
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);

  // Live system payment settings
  const [paymentAddresses, setPaymentAddresses] = useState<SystemSettings>({
    btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ltcAddress: 'LQP92mxC9G9888AsXgH66688hS7sdfsF',
    ethAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  });

  // Search Filter form states
  const [searchFilters, setSearchFilters] = useState({
    bins: '',
    zips: '',
    bank: '',
    country: '',
    state: '',
    type: '',
    creditDebit: '',
    subtype: '',
    expDate: '',
    discounted: false,
    onlyRefundable: false,
    priceRange: 150,
    base: '',
    dob: false,
    ssn: false,
    mmn: false,
    ipAddress: false,
    lastPaidAmount: false,
    driverLicense: false,
    driverLicenseScan: false,
    atmPin: false,
    attPin: false,
    fullAddress: false,
    phone: false,
    email: false,
    emailPassword: false,
    withoutCvv2: false,
  });

  // Data collections state from Firestore
  const [cardList, setCardList] = useState<CardItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [wholesaleList, setWholesaleList] = useState<WholesalePack[]>([]);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<CardItem[]>([]);
  
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Logging and Toast feedback notifications
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'info' }[]>([]);

  const addToast = (msg: string, type: 'success' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // 1. Initial mounting fetch
  useEffect(() => {
    async function initDbFetch() {
      try {
        const settings = await getSystemSettings();
        setPaymentAddresses(settings);

        const cards = await getCards();
        setCardList(cards);

        const news = await getNews();
        setNewsList(news);

        const packs = await getWholesalePacks();
        setWholesaleList(packs);

        const liveAuctions = await getAuctions();
        setAuctions(liveAuctions);
      } catch (err) {
        console.error("Error loading live database:", err);
      }
    }
    initDbFetch();
  }, []);

  // Restore logged-in session on mount
  useEffect(() => {
    async function restoreSession() {
      const storedEmail = localStorage.getItem('protocol_auth_email');
      if (storedEmail) {
        try {
          const profile = await getUserProfile(storedEmail);
          setUser(profile);
        } catch (err) {
          console.error("Failed to restore auth session:", err);
          localStorage.removeItem('protocol_auth_email');
        }
      }
      setAuthLoading(false);
    }
    restoreSession();
  }, []);

  // 2. Fetch user profile when email changes
  useEffect(() => {
    if (!user?.email) return;
    async function loadUser() {
      try {
        const profile = await getUserProfile(user.email);
        setUser(prev => {
          if (!prev) return profile;
          return { ...prev, ...profile };
        });
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    }
    loadUser();
  }, [user?.email]);

  // 3. Fetch user tickets and order transactions when email changes
  useEffect(() => {
    if (!user?.email) return;
    async function loadUserRecords() {
      try {
        const userTickets = await getTickets(user.email);
        setTickets(userTickets);

        const userOrders = await getOrders(user.email);
        setOrders(userOrders);
      } catch (err) {
        console.error("Error loading user records:", err);
      }
    }
    loadUserRecords();
  }, [user?.email]);

  // Add card callback (for Admin)
  const handleAddSingleCard = async (newCard: Omit<CardItem, 'id'>) => {
    try {
      const added = await addCard(newCard);
      setCardList(prev => [added, ...prev]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Bulk add cards callback (for Admin)
  const handleBulkAddCards = async (newCards: Omit<CardItem, 'id'>[]) => {
    try {
      const addedList: CardItem[] = [];
      for (const c of newCards) {
        const added = await addCard(c);
        addedList.push(added);
      }
      setCardList(prev => [...addedList, ...prev]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Update Settings callback (for Admin)
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    try {
      await updateSystemSettings(newSettings);
      setPaymentAddresses(newSettings);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleAddFunds = async (amount: number) => {
    const newBalance = user.balance + amount;
    const newCrabs = user.crabRating + 15;
    const newStatus = 'active';

    try {
      await updateUserProfile(user.email, {
        balance: newBalance,
        crabRating: newCrabs,
        accountStatus: newStatus
      });
      setUser(prev => ({
        ...prev,
        balance: newBalance,
        crabRating: newCrabs,
        accountStatus: newStatus
      }));
      addToast(`Successfully credited +$${amount.toFixed(2)} to your live account!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (card: CardItem) => {
    if (cart.some(item => item.id === card.id)) return;
    setCart(prev => [...prev, card]);
    addToast(`Added card BIN ${card.bin} to shopping cart.`, 'success');
  };

  const handleAddPackToCart = (pack: any) => {
    const mockCardPack: CardItem = {
      id: pack.id,
      bin: 'BULK_MIX',
      zip: 'MIXED',
      bank: 'WHOLESALE BANK',
      country: pack.country,
      state: 'MIX',
      type: 'Visa',
      creditDebit: 'Credit',
      subtype: 'Platinum',
      expDate: '12/28',
      discounted: true,
      onlyRefundable: true,
      price: pack.price,
      ssn: true,
      dob: true,
      mmn: false,
      ipAddress: '127.0.0.1',
      lastPaidAmount: false,
      driverLicense: false,
      driverLicenseScan: false,
      atmPin: false,
      attPin: false,
      fullAddress: true,
      phone: true,
      email: true,
      emailPassword: false,
      withoutCvv2: false,
      base: 'WHOLESALE_PACK',
    };
    setCart(prev => [...prev, mockCardPack]);
    addToast(`Added bulk pack: "${pack.name}" to cart.`, 'success');
  };

  // Checkouts checkout items callback - Saves order to Firestore
  const handleCheckoutItems = async (items: any[], totalCost: number) => {
    const newBalance = user.balance - totalCost;
    const newCrabs = user.crabRating + items.length * 10;

    try {
      // 1. Deduct balance in Firestore user profile
      await updateUserProfile(user.email, {
        balance: newBalance,
        crabRating: newCrabs,
      });

      // 2. Log purchase transactions into orders collection in Firestore and delete from catalog
      for (const item of items) {
        const orderRecord = {
          userEmail: user.email.toLowerCase(),
          bin: item.bin,
          bank: item.bank,
          price: item.price,
          purchaseId: item.purchaseId,
          timestamp: new Date().toISOString(),
          details: JSON.stringify(item),
          testStatus: 'untested'
        };
        await createOrder(orderRecord);
        
        // Remove from available inventory if it has a valid database ID
        if (item.id && !item.id.startsWith('mock-')) {
          await deleteCard(item.id);
        }
      }

      // Update local states
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          balance: newBalance,
          crabRating: newCrabs,
        };
      });
      
      const updatedOrders = await getOrders(user.email);
      setOrders(updatedOrders);

      // Refresh catalog list to remove purchased cards from UI
      const updatedCards = await getCards();
      setCardList(updatedCards);
    } catch (err) {
      console.error(err);
    }
  };

  // Live test verification updates in Firestore
  const handleTestCardUpdate = async (purchaseId: string, isDead: boolean, refundAmount: number) => {
    try {
      // Find order record in local state to retrieve Firestore ID
      const orderMatch = orders.find(o => o.purchaseId === purchaseId);
      if (orderMatch && orderMatch.id) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'orders', orderMatch.id);
        await updateDoc(docRef, { testStatus: isDead ? 'dead' : 'valid' });
      }

      if (isDead && refundAmount > 0) {
        // Increment user balance for dead card
        const updatedBalance = user.balance + refundAmount;
        const updatedCrabs = Math.max(0, user.crabRating - 5);
        await updateUserProfile(user.email, {
          balance: updatedBalance,
          crabRating: updatedCrabs
        });
        setUser(prev => ({
          ...prev,
          balance: updatedBalance,
          crabRating: updatedCrabs
        }));
      }
    } catch (err) {
      console.error("Error updating test result:", err);
    }
  };

  // Tickets handlers
  const handleCreateTicketSubmit = async (subject: string, initialMsg: string) => {
    const ticketObj = {
      subject,
      status: 'Open' as const,
      createdAt: new Date().toLocaleDateString(),
      userEmail: user.email.toLowerCase(),
      messages: [
        {
          sender: 'user' as const,
          text: initialMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };

    try {
      const created = await createTicket(ticketObj);
      setTickets(prev => [created, ...prev]);
      setCurrentTicketId(created.id);
      addToast('Ticket submitted successfully.', 'success');

      // Auto response simulator to make support ticketing live and fully responsive
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        const autoReply = 'Thank you for reaching out. Protocol support administrators are inspecting your parameters. We will reply shortly.';
        const updatedMessages = [
          ...created.messages,
          {
            sender: 'admin' as const,
            text: autoReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ];
        await updateTicketMessages(created.id, updatedMessages, 'Replied');
        
        // Refresh ticket stream
        const reloaded = await getTickets(user.email);
        setTickets(reloaded);
      }, 3000);

    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessageSubmit = async (ticketId: string, messageText: string, sender: 'user' | 'admin') => {
    const match = tickets.find(t => t.id === ticketId);
    if (!match) return;

    const updatedMessages = [
      ...match.messages,
      {
        sender,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];

    const nextStatus = sender === 'admin' ? 'Replied' as const : 'Open' as const;

    try {
      await updateTicketMessages(ticketId, updatedMessages, nextStatus);
      
      // Update local ticket stream
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return { ...t, status: nextStatus, messages: updatedMessages };
        }
        return t;
      }));

      // Auto response helper if customer sent a message
      if (sender === 'user') {
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          const autoText = 'Our administrator has logged this request. Your card integrity testing ticket is actively analyzed.';
          const finalMessages = [
            ...updatedMessages,
            {
              sender: 'admin' as const,
              text: autoText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ];
          await updateTicketMessages(ticketId, finalMessages, 'Replied');
          const reloaded = await getTickets(user.email);
          setTickets(reloaded);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearchFilters({
      bins: '',
      zips: '',
      bank: '',
      country: '',
      state: '',
      type: '',
      creditDebit: '',
      subtype: '',
      expDate: '',
      discounted: false,
      onlyRefundable: false,
      priceRange: 150,
      base: '',
      dob: false,
      ssn: false,
      mmn: false,
      ipAddress: false,
      lastPaidAmount: false,
      driverLicense: false,
      driverLicenseScan: false,
      atmPin: false,
      attPin: false,
      fullAddress: false,
      phone: false,
      email: false,
      emailPassword: false,
      withoutCvv2: false,
    });
    addToast('Filters reset successfully.', 'info');
  };

  // Simulated login swap
  const handleLogout = () => {
    localStorage.removeItem('protocol_auth_email');
    setUser(null);
    setCart([]);
    setOrders([]);
    addToast('Logged out successfully.', 'info');
  };

  // Filter logic
  const processedCards = useMemo(() => {
    return cardList.filter(card => {
      // Tab based filtering
      if (activeTab === 'cvv2') {
        if (card.withoutCvv2 || card.ssn || card.dob) return false;
      } else if (activeTab === 'dumps') {
        if (!card.withoutCvv2) return false;
      } else if (activeTab === 'fullz') {
        if (!card.ssn && !card.dob) return false;
      }

      if (searchFilters.bins.trim()) {
        const queryBins = searchFilters.bins.toLowerCase().replace(/,/g, ' ').split(/\s+/).filter(Boolean);
        const matchBin = queryBins.some(qb => card.bin.startsWith(qb));
        if (!matchBin) return false;
      }

      if (searchFilters.zips.trim()) {
        const queryZips = searchFilters.zips.toLowerCase().replace(/,/g, ' ').split(/\s+/).filter(Boolean);
        const matchZip = queryZips.some(qz => card.zip.toLowerCase().startsWith(qz));
        if (!matchZip) return false;
      }

      if (searchFilters.bank && card.bank !== searchFilters.bank) return false;
      if (searchFilters.country && card.country !== searchFilters.country) return false;
      if (searchFilters.state && card.state !== searchFilters.state) return false;
      if (searchFilters.type && card.type !== searchFilters.type) return false;
      if (searchFilters.creditDebit && card.creditDebit !== searchFilters.creditDebit) return false;
      if (searchFilters.subtype && card.subtype !== searchFilters.subtype) return false;
      if (searchFilters.base && card.base !== searchFilters.base) return false;

      if (searchFilters.expDate.trim() && card.expDate !== searchFilters.expDate.trim()) return false;
      if (card.price > searchFilters.priceRange) return false;

      if (searchFilters.discounted && !card.discounted) return false;
      if (searchFilters.onlyRefundable && !card.onlyRefundable) return false;
      if (searchFilters.dob && !card.dob) return false;
      if (searchFilters.ssn && !card.ssn) return false;
      if (searchFilters.mmn && !card.mmn) return false;
      if (searchFilters.ipAddress && !card.ipAddress) return false;
      if (searchFilters.lastPaidAmount && !card.lastPaidAmount) return false;
      if (searchFilters.driverLicense && !card.driverLicense) return false;
      if (searchFilters.driverLicenseScan && !card.driverLicenseScan) return false;
      if (searchFilters.atmPin && !card.atmPin) return false;
      if (searchFilters.attPin && !card.attPin) return false;
      if (searchFilters.fullAddress && !card.fullAddress) return false;
      if (searchFilters.phone && !card.phone) return false;
      if (searchFilters.email && !card.email) return false;
      if (searchFilters.emailPassword && !card.emailPassword) return false;
      if (searchFilters.withoutCvv2 && !card.withoutCvv2) return false;

      return true;
    });
  }, [cardList, searchFilters, activeTab]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c5460]" />
        <p className="mt-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Loading Session...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={(profile) => setUser(profile)} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-800 font-sans p-3 md:p-6 pb-20 select-none">
      
      {/* Centered Main Panel Container */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
        
        {/* Metric Header Block */}
        <Header
          user={user}
          setUser={setUser}
          onLogout={handleLogout}
          cartCount={cart.length}
        />

        {/* Account Inactive Alert Banner */}
        {user.accountStatus === 'inactive' && (
          <div className="bg-[#bee5eb] border border-[#bee5eb] text-[#0c5460] px-4 py-3.5 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-xs">
            <div className="flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#0c5460]" />
              <div>
                <p className="font-bold leading-relaxed text-gray-950 text-[11px] uppercase tracking-wider">Your account is inactive.</p>
                <p className="font-semibold text-gray-700 leading-relaxed mt-0.5">
                  For activation you need to top up your balance. Attention: Not activated accounts for more than 5 days will be deleted automatically.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setUser(prev => ({ ...prev, addFundsOpen: true }))}
              className="bg-white/80 hover:bg-white text-[#0c5460] border border-[#0c5460] font-black uppercase text-[10px] px-4 py-2.5 rounded transition-all shadow-xs cursor-pointer tracking-wider"
            >
              Activate Now (Top up)
            </button>
          </div>
        )}

        {/* Top Tab Bar Navigation Block */}
        <div className="flex flex-wrap items-stretch justify-start border border-gray-300 bg-gray-100 rounded-sm overflow-hidden select-none shadow-2xs">
          
          {/* News Tab */}
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-r border-gray-300 cursor-pointer ${
              activeTab === 'news'
                ? 'bg-white text-gray-950 border-b-2 border-b-transparent shadow-inner'
                : 'hover:bg-gray-200/60 text-gray-600'
            }`}
          >
            News
          </button>

          {/* Dumps Tab - Light Blue Accent */}
          <button
            onClick={() => setActiveTab('dumps')}
            className={`px-4 py-3.5 text-xs font-black transition-all border-r border-gray-300 cursor-pointer ${
              activeTab === 'dumps'
                ? 'bg-[#add8e6] text-blue-950 font-black shadow-inner border-b-2 border-b-[#add8e6]'
                : 'bg-[#add8e6]/30 hover:bg-[#add8e6]/50 text-blue-900 font-bold'
            }`}
          >
            Dumps
          </button>

          {/* CVV2 Tab - Light Green Accent (Matches active tab in screenshot) */}
          <button
            onClick={() => setActiveTab('cvv2')}
            className={`px-4 py-3.5 text-xs font-black transition-all border-r border-gray-300 cursor-pointer ${
              activeTab === 'cvv2'
                ? 'bg-[#bef0be] text-emerald-950 font-black shadow-inner border-b-2 border-b-[#bef0be]'
                : 'bg-[#bef0be]/30 hover:bg-[#bef0be]/50 text-emerald-900 font-bold'
            }`}
          >
            CVV2
          </button>

          {/* Fullz Tab - Light Cyan Accent */}
          <button
            onClick={() => setActiveTab('fullz')}
            className={`px-4 py-3.5 text-xs font-black transition-all border-r border-gray-300 cursor-pointer ${
              activeTab === 'fullz'
                ? 'bg-[#bbf2f6] text-cyan-950 font-black shadow-inner border-b-2 border-b-[#bbf2f6]'
                : 'bg-[#bbf2f6]/30 hover:bg-[#bbf2f6]/50 text-cyan-900 font-bold'
            }`}
          >
            Fullz
          </button>

          {/* Wholesale Tab */}
          <button
            onClick={() => setActiveTab('wholesale')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-r border-gray-300 cursor-pointer ${
              activeTab === 'wholesale'
                ? 'bg-white text-gray-950 border-b-2 border-b-transparent shadow-inner'
                : 'hover:bg-gray-200/60 text-gray-600'
            }`}
          >
            Wholesale
          </button>

          {/* Cart Tab with Badge count */}
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-r border-gray-300 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cart'
                ? 'bg-white text-gray-950 border-b-2 border-b-transparent shadow-inner'
                : 'hover:bg-gray-200/60 text-gray-600'
            }`}
          >
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="bg-[#0c5460] text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </button>

          {/* Orders Tab */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-r border-gray-300 cursor-pointer flex items-center gap-1 ${
              activeTab === 'orders'
                ? 'bg-white text-gray-950 border-b-2 border-b-transparent shadow-inner'
                : 'hover:bg-gray-200/60 text-gray-600'
            }`}
          >
            <span>Orders</span>
            {orders.length > 0 && (
              <span className="bg-emerald-700 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          {/* Auction Tab - Light Red Accent */}
          <button
            onClick={() => setActiveTab('auction')}
            className={`px-4 py-3.5 text-xs font-black transition-all border-r border-gray-300 cursor-pointer ${
              activeTab === 'auction'
                ? 'bg-[#fbc6ca] text-rose-950 font-black shadow-inner border-b-2 border-b-[#fbc6ca]'
                : 'bg-[#fbc6ca]/30 hover:bg-[#fbc6ca]/50 text-rose-900 font-bold'
            }`}
          >
            Auction
          </button>

          {/* Tools Tab */}
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-r border-gray-300 cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-white text-gray-950 border-b-2 border-b-transparent shadow-inner'
                : 'hover:bg-gray-200/60 text-gray-600'
            }`}
          >
            Tools
          </button>

          {/* Tickets Tab */}
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-3.5 text-xs font-bold transition-all border-r border-gray-300 cursor-pointer flex items-center gap-1 ${
              activeTab === 'tickets'
                ? 'bg-white text-gray-950 border-b-2 border-b-transparent shadow-inner'
                : 'hover:bg-gray-200/60 text-gray-600'
            }`}
          >
            <span>Tickets</span>
            {tickets.some(t => t.status === 'Replied') && (
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Help Dropdown Option */}
          <div className="relative border-r border-gray-300 flex items-stretch">
            <button
              onClick={() => {
                setActiveTab('help');
                setHelpDropdownOpen(!helpDropdownOpen);
              }}
              className={`px-4 py-3.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'help'
                  ? 'bg-white text-gray-950'
                  : 'hover:bg-gray-200/60 text-gray-600'
              }`}
            >
              <span>Help</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            {helpDropdownOpen && (
              <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded shadow-lg z-30 w-36 py-1">
                <button
                  onClick={() => {
                    setActiveTab('help');
                    setHelpDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 font-semibold text-gray-700 cursor-pointer"
                >
                  FAQ Help Desk
                </button>
                <button
                  onClick={() => {
                    setUser(prev => ({ ...prev, crabsDetailsOpen: true }));
                    setHelpDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 font-semibold text-gray-700 cursor-pointer"
                >
                  Crab Details
                </button>
              </div>
            )}
          </div>

          {/* MASTER ADMIN PANEL TAB (Rendered ONLY if user email is patrickkamande10455@gmail.com) */}
          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-3.5 text-xs font-black transition-all border-r border-gray-300 cursor-pointer flex items-center gap-1 bg-red-100/50 hover:bg-red-100 ${
                activeTab === 'admin'
                  ? 'bg-red-200 text-red-950 border-b-2 border-b-red-200'
                  : 'text-red-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-700 animate-pulse" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Settings gear toggle */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-3.5 hover:bg-gray-200/60 transition-colors cursor-pointer border-r border-gray-300 flex items-center justify-center text-gray-500 ml-auto"
            title="Account Settings Configuration"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
          </button>

        </div>

        {/* Dynamic Inner Tab View Contents */}
        <main className="flex-grow select-none">
          {/* 1. Main Search Tabs (CVV2, Dumps, Fullz are structured using the Filter Form & Table Layout!) */}
          {(activeTab === 'cvv2' || activeTab === 'dumps' || activeTab === 'fullz') && (
            <div className="flex flex-col gap-4">
              <FilterForm
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
                onSearch={() => addToast('Search filters updated.', 'success')}
                onReset={handleResetFilters}
              />
              <CardTable
                cards={processedCards}
                cart={cart}
                onAddToCart={handleAddToCart}
                activeTab={activeTab}
              />
            </div>
          )}

          {/* 2. News bulletins */}
          {activeTab === 'news' && (
            <NewsView news={newsList} />
          )}

          {/* 3. Wholesale packs */}
          {activeTab === 'wholesale' && (
            <WholesaleView
              packs={wholesaleList}
              cart={cart}
              onAddPackToCart={handleAddPackToCart}
            />
          )}

          {/* 4. Live bidding auctions */}
          {activeTab === 'auction' && (
            <AuctionView
              auctions={auctions}
              setAuctions={setAuctions}
              user={user}
              setUser={setUser}
              onAddToast={addToast}
            />
          )}

          {/* 5. Diagnostic Tools */}
          {activeTab === 'tools' && (
            <ToolsView />
          )}

          {/* 6. Support Ticketing Portal */}
          {activeTab === 'tickets' && (
            <TicketsView
              user={user}
              tickets={tickets}
              setTickets={setTickets}
              currentTicketId={currentTicketId}
              setCurrentTicketId={setCurrentTicketId}
              newMessageText={newMessageText}
              setNewMessageText={setNewMessageText}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              onCreateTicket={handleCreateTicketSubmit}
              onSendMessage={handleSendMessageSubmit}
            />
          )}

          {/* 7. FAQs and manuals */}
          {activeTab === 'help' && (
            <HelpView />
          )}

          {/* 8. Shopping Cart and Purchased Inventory */}
          {(activeTab === 'cart' || activeTab === 'orders') && (
            <CartOrdersView
              cart={cart}
              setCart={setCart}
              orders={orders}
              setOrders={setOrders}
              user={user}
              setUser={setUser}
              onAddToast={addToast}
              activeTab={activeTab}
              onCheckoutItems={handleCheckoutItems}
              onTestCardUpdate={handleTestCardUpdate}
            />
          )}

          {/* 9. MASTER ADMIN PANEL VIEW */}
          {activeTab === 'admin' && user.role === 'admin' && (
            <AdminPanel
              onAddCard={handleAddSingleCard}
              onBulkAddCards={handleBulkAddCards}
              systemSettings={paymentAddresses}
              onUpdateSettings={handleUpdateSettings}
              onAddToast={addToast}
            />
          )}
        </main>

      </div>

      {/* Settings Side Drawer Panel */}
      {settingsOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-2xl p-5 z-40 select-text flex flex-col gap-4 text-xs text-gray-700">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h3 className="font-extrabold text-[#0c5460] text-sm uppercase flex items-center gap-1.5">
              <Settings className="w-4 h-4 animate-spin-slow" /> Profile Variables
            </h3>
            <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-black cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Testing Email:</label>
            <input
              type="email"
              value={user.email}
              onChange={e => setUser(prev => ({ 
                ...prev, 
                email: e.target.value,
                role: e.target.value.toLowerCase() === 'patrickkamande10455@gmail.com' ? 'admin' : 'customer'
              }))}
              className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-blue-400 font-semibold text-gray-800"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Active Balance ($):</label>
            <input
              type="number"
              value={user.balance}
              onChange={e => {
                const b = parseFloat(e.target.value) || 0;
                setUser(prev => ({ ...prev, balance: b, accountStatus: b > 0 ? 'active' : 'inactive' }));
              }}
              className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-blue-400 font-bold font-mono text-emerald-800"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Account Activation:</label>
            <select
              value={user.accountStatus}
              onChange={e => setUser(prev => ({ ...prev, accountStatus: e.target.value as any }))}
              className="w-full border border-gray-300 rounded p-1.5 bg-white font-bold text-gray-700"
            >
              <option value="inactive">Inactive (Show Warning Alert)</option>
              <option value="active">Active (Remove Alert Banner)</option>
            </select>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-[10px] text-gray-500 leading-relaxed font-semibold mt-auto">
            <p className="font-extrabold text-gray-700 uppercase mb-1">Live Database Status</p>
            <p>Database Node: Firestore Sync active</p>
            <p>Active Connection: Normal</p>
          </div>
        </div>
      )}

      {/* Floating Dialog Modals */}
      <Modals
        user={user}
        setUser={setUser}
        onAddFunds={handleAddFunds}
        onAddToast={addToast}
        paymentAddresses={paymentAddresses}
      />

      {/* Custom Floating Stack Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-3 rounded shadow-lg border text-xs font-bold transition-all flex items-center gap-2 pointer-events-auto ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100'
                : 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100'
            }`}
          >
            <div className="flex-grow">{t.msg}</div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer font-mono"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
