import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, PlusCircle, Upload, CheckCircle2, DollarSign, Wallet, 
  RefreshCw, Key, Newspaper, FolderSync, Gavel, MessageSquare, 
  Check, XCircle, Send, User, ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react';
import { CardItem, SupportTicket, NewsItem, WholesalePack, AuctionItem } from '../types';
import { 
  SystemSettings, getTickets, updateTicketMessages, getPayments, 
  updatePaymentStatus, getUserProfile, updateUserProfile,
  addNewsItem, addWholesalePack, addAuctionItem,
  deleteCard, updateCard, deleteNewsItem, updateNewsItem,
  deleteWholesalePack, updateWholesalePack, deleteAuctionItem, updateAuctionItem
} from '../utils/dbService';

interface AdminPanelProps {
  onAddCard: (card: Omit<CardItem, 'id'>) => Promise<any>;
  onBulkAddCards: (cards: Omit<CardItem, 'id'>[]) => Promise<any>;
  systemSettings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => Promise<any>;
  onAddToast: (msg: string, type: 'success' | 'info') => void;
  cardList: CardItem[];
  setCardList: React.Dispatch<React.SetStateAction<CardItem[]>>;
  newsList: NewsItem[];
  setNewsList: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  wholesaleList: WholesalePack[];
  setWholesaleList: React.Dispatch<React.SetStateAction<WholesalePack[]>>;
  auctions: AuctionItem[];
  setAuctions: React.Dispatch<React.SetStateAction<AuctionItem[]>>;
}

export default function AdminPanel({
  onAddCard,
  onBulkAddCards,
  systemSettings,
  onUpdateSettings,
  onAddToast,
  cardList,
  setCardList,
  newsList,
  setNewsList,
  wholesaleList,
  setWholesaleList,
  auctions,
  setAuctions,
}: AdminPanelProps) {
  const safeNum = (val: any) => (val === undefined || val === null || isNaN(val) ? '' : val);

  // Tabs inside Admin Panel
  const [adminTab, setAdminTab] = useState<'dumps' | 'cvv2' | 'fullz' | 'banklogs' | 'cashapp' | 'paypal' | 'rdp' | 'bulk' | 'news' | 'wholesale' | 'auction' | 'tickets' | 'payments' | 'addresses'>('dumps');

  // Single card form state
  const [singleCard, setSingleCard] = useState<Omit<CardItem, 'id'>>({
    bin: '411111',
    zip: '90210',
    bank: 'CHASE BANK',
    country: 'US',
    state: 'CA',
    type: 'Visa',
    creditDebit: 'Credit',
    subtype: 'Platinum',
    expDate: '12/28',
    discounted: false,
    onlyRefundable: true,
    price: 15.00,
    ssn: true,
    dob: true,
    mmn: false,
    ipAddress: '192.168.1.1',
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
    base: 'BASE_PROTOCOL_LIVE_2026',
    accountNumber: false,
    routingNumber: false,
    cardNumber: '',
    cvv: '',
    fullName: '',
    fullAddressStr: '',
    fullPhone: '',
    fullSsn: '',
    fullDob: '',
    track1: '',
    track2: '',
    fullMmn: '',
    fullAtmPin: '',
    fullDriverLicense: '',
    fullEmail: '',
    fullEmailPassword: '',
    fullAccountNumber: '',
    fullRoutingNumber: '',
  });

  // Bulk input text state
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState<'cvv2' | 'dumps' | 'fullz'>('cvv2');
  const [bulkPrice, setBulkPrice] = useState<number>(12.00);
  const [bulkBase, setBulkBase] = useState('BASE_BULK_AUTO_PROTOCOL');

  // Settings state
  const [settingsForm, setSettingsForm] = useState<SystemSettings>({
    btcAddress: systemSettings.btcAddress,
    ltcAddress: systemSettings.ltcAddress,
    ethAddress: systemSettings.ethAddress,
    usdtAddress: systemSettings.usdtAddress || '',
  });

  const [loading, setLoading] = useState(false);

  // News Form State
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImportant, setNewsImportant] = useState(false);

  // Wholesale Form State
  const [wholesaleName, setWholesaleName] = useState('');
  const [wholesaleCount, setWholesaleCount] = useState(10);
  const [wholesalePrice, setWholesalePrice] = useState(120.00);
  const [wholesaleDescription, setWholesaleDescription] = useState('Premium high validity CC combo pack.');
  const [wholesaleCountry, setWholesaleCountry] = useState('US');
  const [wholesaleType, setWholesaleType] = useState('Visa Platinum / Gold');

  // Auction Form State
  const [auctionBin, setAuctionBin] = useState('411111');
  const [auctionBank, setAuctionBank] = useState('WELLS FARGO');
  const [auctionCountry, setAuctionCountry] = useState('US');
  const [auctionState, setAuctionState] = useState('CA');
  const [auctionExpDate, setAuctionExpDate] = useState('12/28');
  const [auctionType, setAuctionType] = useState<'Visa' | 'Mastercard' | 'Amex' | 'Discover'>('Visa');
  const [auctionStartingBid, setAuctionStartingBid] = useState(30.00);
  const [auctionEndTime, setAuctionEndTime] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().substring(0, 16);
  });

  // Admin fetched lists (Support Tickets, Payments Tracking)
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [paymentsList, setPaymentsList] = useState<any[]>([]);

  // Fetch tickets & payments from database
  useEffect(() => {
    async function loadAdminData() {
      try {
        const t = await getTickets('patrickkamande10455@gmail.com');
        setTicketsList(t);
        const p = await getPayments('patrickkamande10455@gmail.com');
        setPaymentsList(p);
      } catch (err) {
        console.error("Error loading admin lists:", err);
      }
    }
    loadAdminData();
  }, [adminTab]);

  const [editingItem, setEditingItem] = useState<{
    type: 'card' | 'news' | 'wholesale' | 'auction';
    item: any;
  } | null>(null);

  const handleDeleteItem = async (type: 'card' | 'news' | 'wholesale' | 'auction', id: string) => {
    if (!window.confirm("Are you sure you want to delete this uploaded item?")) return;
    try {
      if (type === 'card') {
        await deleteCard(id);
        setCardList(prev => prev.filter(c => c.id !== id));
      } else if (type === 'news') {
        await deleteNewsItem(id);
        setNewsList(prev => prev.filter(n => n.id !== id));
      } else if (type === 'wholesale') {
        await deleteWholesalePack(id);
        setWholesaleList(prev => prev.filter(p => p.id !== id));
      } else if (type === 'auction') {
        await deleteAuctionItem(id);
        setAuctions(prev => prev.filter(a => a.id !== id));
      }
      onAddToast("Item successfully deleted!", "success");
    } catch (err) {
      console.error(err);
      alert("Failed to delete item.");
    }
  };

  const renderEditModal = () => {
    if (!editingItem) return null;
    const { type, item } = editingItem;

    const handleSaveEdit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (type === 'card') {
          const updated = await updateCard(item.id, item);
          setCardList(prev => prev.map(c => c.id === item.id ? updated : c));
        } else if (type === 'news') {
          const updated = await updateNewsItem(item.id, item);
          setNewsList(prev => prev.map(n => n.id === item.id ? updated : n));
        } else if (type === 'wholesale') {
          const updated = await updateWholesalePack(item.id, item);
          setWholesaleList(prev => prev.map(p => p.id === item.id ? updated : p));
        } else if (type === 'auction') {
          const updated = await updateAuctionItem(item.id, item);
          setAuctions(prev => prev.map(a => a.id === item.id ? updated : a));
        }
        onAddToast("Changes saved successfully!", "success");
        setEditingItem(null);
      } catch (err) {
        console.error(err);
        alert("Failed to save changes.");
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text">
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-gray-900 font-extrabold text-sm uppercase">✏️ Edit Uploaded Record</h3>
            <button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer p-1">×</button>
          </div>
          <form onSubmit={handleSaveEdit} className="p-4 flex flex-col gap-3.5 text-[11px]">
            {type === 'card' && (
              <>
                {(item.category === 'dumps' || item.category === 'cvv2' || item.category === 'fullz') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">BIN</label>
                      <input type="text" value={item.bin || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, bin: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Bank Name</label>
                      <input type="text" value={item.bank || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, bank: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Country</label>
                      <input type="text" value={item.country || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, country: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">State</label>
                      <input type="text" value={item.state || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, state: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="font-bold">Price ($)</label>
                      <input type="number" step="0.01" value={item.price || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, price: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="font-bold">Base Name</label>
                      <input type="text" value={item.base || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, base: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                  </div>
                )}

                {item.category === 'banklogs' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Bank Name</label>
                      <input type="text" value={item.bank || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, bank: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Balance ($)</label>
                      <input type="number" step="0.01" value={item.bankBalance || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, bankBalance: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Login Username</label>
                      <input type="text" value={item.loginUsername || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, loginUsername: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Login Password</label>
                      <input type="text" value={item.loginPassword || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, loginPassword: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Price ($)</label>
                      <input type="number" step="0.01" value={item.price || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, price: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                  </div>
                )}

                {item.category === 'cashapp' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Username ($Cashtag)</label>
                      <input type="text" value={item.cashappUsername || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, cashappUsername: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Email Associated</label>
                      <input type="text" value={item.cashappEmail || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, cashappEmail: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Balance ($)</label>
                      <input type="number" step="0.01" value={item.cashappBalance || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, cashappBalance: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Price ($)</label>
                      <input type="number" step="0.01" value={item.price || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, price: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                  </div>
                )}

                {item.category === 'paypal' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Email</label>
                      <input type="text" value={item.paypalEmail || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, paypalEmail: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Password</label>
                      <input type="text" value={item.paypalPassword || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, paypalPassword: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Balance ($)</label>
                      <input type="number" step="0.01" value={item.paypalBalance || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, paypalBalance: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Price ($)</label>
                      <input type="number" step="0.01" value={item.price || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, price: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                  </div>
                )}

                {item.category === 'rdp' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">RDP IP Address</label>
                      <input type="text" value={item.rdpIp || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, rdpIp: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">OS Version</label>
                      <input type="text" value={item.rdpOs || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, rdpOs: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Country</label>
                      <input type="text" value={item.rdpCountry || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, rdpCountry: e.target.value } })} className="border p-1.5 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold">Price ($)</label>
                      <input type="number" step="0.01" value={item.price || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, price: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                    </div>
                  </div>
                )}
              </>
            )}

            {type === 'news' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Title</label>
                  <input type="text" value={item.title || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, title: e.target.value } })} className="border p-1.5 rounded" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Content</label>
                  <textarea value={item.content || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, content: e.target.value } })} className="border p-1.5 rounded h-24" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!item.important} onChange={e => setEditingItem({ ...editingItem, item: { ...item, important: e.target.checked } })} id="edit-news-important" />
                  <label htmlFor="edit-news-important" className="font-bold cursor-pointer">Mark as Important Bulletin</label>
                </div>
              </div>
            )}

            {type === 'wholesale' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Pack Name</label>
                  <input type="text" value={item.name || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, name: e.target.value } })} className="border p-1.5 rounded" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Count of Cards</label>
                  <input type="number" value={item.count || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, count: Number(e.target.value) } })} className="border p-1.5 rounded" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Price ($)</label>
                  <input type="number" step="0.01" value={item.price || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, price: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Description</label>
                  <input type="text" value={item.description || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, description: e.target.value } })} className="border p-1.5 rounded" />
                </div>
              </div>
            )}

            {type === 'auction' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold">BIN</label>
                  <input type="text" value={item.card?.bin || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, card: { ...item.card, bin: e.target.value } } })} className="border p-1.5 rounded" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Bank Name</label>
                  <input type="text" value={item.card?.bank || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, card: { ...item.card, bank: e.target.value } } })} className="border p-1.5 rounded" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Current Bid ($)</label>
                  <input type="number" step="0.01" value={item.currentBid || 0} onChange={e => setEditingItem({ ...editingItem, item: { ...item, currentBid: Number(e.target.value) } })} className="border p-1.5 rounded font-mono" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">End Time</label>
                  <input type="datetime-local" value={item.endTime?.substring(0, 16) || ''} onChange={e => setEditingItem({ ...editingItem, item: { ...item, endTime: e.target.value } })} className="border p-1.5 rounded" />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 border rounded bg-gray-50 hover:bg-gray-100 cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderManageList = (tab: string) => {
    const cardCats = ['dumps', 'cvv2', 'fullz', 'banklogs', 'cashapp', 'paypal', 'rdp'];
    
    if (cardCats.includes(tab)) {
      const filteredCards = cardList.filter(c => c.category === tab);
      return (
        <div className="border border-gray-200 rounded mt-6 p-4 bg-gray-50/30">
          <h4 className="font-extrabold text-sm text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-1">📁 Existing {tab.toUpperCase()} Records ({filteredCards.length})</h4>
          {filteredCards.length === 0 ? (
            <p className="text-gray-500 italic py-2">No records uploaded in this category yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white border border-gray-200 rounded text-[11px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700">
                    {tab === 'banklogs' ? (
                      <>
                        <th className="p-2">Bank</th>
                        <th className="p-2">Balance</th>
                        <th className="p-2">Username</th>
                        <th className="p-2">Price</th>
                      </>
                    ) : tab === 'cashapp' ? (
                      <>
                        <th className="p-2">Username</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Balance</th>
                        <th className="p-2">Price</th>
                      </>
                    ) : tab === 'paypal' ? (
                      <>
                        <th className="p-2">Email</th>
                        <th className="p-2">Balance</th>
                        <th className="p-2">Price</th>
                      </>
                    ) : tab === 'rdp' ? (
                      <>
                        <th className="p-2">IP / OS</th>
                        <th className="p-2">Country/State</th>
                        <th className="p-2">Access Type</th>
                        <th className="p-2">Price</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2">BIN</th>
                        <th className="p-2">Bank</th>
                        <th className="p-2">Country/State</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Base</th>
                      </>
                    )}
                    <th className="p-2 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCards.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      {tab === 'banklogs' ? (
                        <>
                          <td className="p-2 font-bold text-gray-800">{c.bank}</td>
                          <td className="p-2 font-mono font-bold text-emerald-700">${c.bankBalance ?? 0}</td>
                          <td className="p-2 font-mono text-gray-600">{c.loginUsername}</td>
                          <td className="p-2 font-mono font-bold text-gray-800">${c.price}</td>
                        </>
                      ) : tab === 'cashapp' ? (
                        <>
                          <td className="p-2 font-bold text-[#00D632]">{c.cashappUsername}</td>
                          <td className="p-2 text-gray-600">{c.cashappEmail}</td>
                          <td className="p-2 font-mono font-bold text-gray-800">${c.cashappBalance ?? 0}</td>
                          <td className="p-2 font-mono font-bold text-gray-800">${c.price}</td>
                        </>
                      ) : tab === 'paypal' ? (
                        <>
                          <td className="p-2 font-bold text-blue-800">{c.paypalEmail}</td>
                          <td className="p-2 font-mono font-bold text-emerald-700">${c.paypalBalance ?? 0}</td>
                          <td className="p-2 font-mono font-bold text-gray-800">${c.price}</td>
                        </>
                      ) : tab === 'rdp' ? (
                        <>
                          <td className="p-2 font-bold text-gray-800">{c.rdpIp} <span className="text-gray-400 font-normal">({c.rdpOs})</span></td>
                          <td className="p-2 font-mono text-gray-600">{c.rdpCountry} / {c.rdpState}</td>
                          <td className="p-2 text-gray-600">{c.rdpAccessType}</td>
                          <td className="p-2 font-mono font-bold text-gray-800">${c.price}</td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 font-mono font-bold text-blue-700">{c.bin}</td>
                          <td className="p-2 text-gray-800">{c.bank}</td>
                          <td className="p-2 font-mono text-gray-600">{c.country} / {c.state}</td>
                          <td className="p-2 font-mono font-bold text-emerald-700">${c.price}</td>
                          <td className="p-2 font-mono text-gray-500">{c.base}</td>
                        </>
                      )}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" onClick={() => setEditingItem({ type: 'card', item: c })} className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer font-bold">Edit</button>
                          <button type="button" onClick={() => handleDeleteItem('card', c.id)} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 cursor-pointer font-bold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'wholesale') {
      return (
        <div className="border border-gray-200 rounded mt-6 p-4 bg-gray-50/30">
          <h4 className="font-extrabold text-sm text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-1">📁 Existing WholesaleCombo Packs ({wholesaleList.length})</h4>
          {wholesaleList.length === 0 ? (
            <p className="text-gray-500 italic py-2">No wholesale combo packs uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white border border-gray-200 rounded text-[11px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700">
                    <th className="p-2">Pack Name</th>
                    <th className="p-2">Count</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Country/Type</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wholesaleList.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2 font-bold text-gray-800">{p.name}</td>
                      <td className="p-2 font-mono text-gray-600">{p.count} cards</td>
                      <td className="p-2 font-mono font-bold text-emerald-700">${p.price}</td>
                      <td className="p-2 font-mono text-gray-600">{p.country} / {p.type}</td>
                      <td className="p-2 text-gray-500 max-w-xs truncate">{p.description}</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" onClick={() => setEditingItem({ type: 'wholesale', item: p })} className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer font-bold">Edit</button>
                          <button type="button" onClick={() => handleDeleteItem('wholesale', p.id)} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 cursor-pointer font-bold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'auction') {
      return (
        <div className="border border-gray-200 rounded mt-6 p-4 bg-gray-50/30">
          <h4 className="font-extrabold text-sm text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-1">📁 Existing Auction Items ({auctions.length})</h4>
          {auctions.length === 0 ? (
            <p className="text-gray-500 italic py-2">No auctions active yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white border border-gray-200 rounded text-[11px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700">
                    <th className="p-2">BIN</th>
                    <th className="p-2">Bank</th>
                    <th className="p-2">Country / State</th>
                    <th className="p-2">Starting Bid</th>
                    <th className="p-2">Current Bid</th>
                    <th className="p-2">Bids</th>
                    <th className="p-2 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auctions.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="p-2 font-mono font-bold text-purple-700">{a.card.bin}</td>
                      <td className="p-2 text-gray-800">{a.card.bank}</td>
                      <td className="p-2 font-mono text-gray-600">{a.card.country} / {a.card.state}</td>
                      <td className="p-2 font-mono text-gray-500">${a.currentBid}</td>
                      <td className="p-2 font-mono font-bold text-emerald-700">${a.currentBid}</td>
                      <td className="p-2 font-mono text-gray-500">{a.bidsCount} bids</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" onClick={() => setEditingItem({ type: 'auction', item: a })} className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer font-bold">Edit</button>
                          <button type="button" onClick={() => handleDeleteItem('auction', a.id)} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 cursor-pointer font-bold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (tab === 'news') {
      return (
        <div className="border border-gray-200 rounded mt-6 p-4 bg-gray-50/30">
          <h4 className="font-extrabold text-sm text-gray-800 mb-3 uppercase tracking-wider flex items-center gap-1">📁 Existing Bulletins ({newsList.length})</h4>
          {newsList.length === 0 ? (
            <p className="text-gray-500 italic py-2">No bulletin posts created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white border border-gray-200 rounded text-[11px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700">
                    <th className="p-2 w-1/4">Title</th>
                    <th className="p-2 w-1/2">Content</th>
                    <th className="p-2">Important</th>
                    <th className="p-2 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {newsList.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="p-2 font-bold text-gray-800">{n.title}</td>
                      <td className="p-2 text-gray-600 max-w-sm truncate">{n.content}</td>
                      <td className="p-2 font-mono text-gray-500">{n.important ? "🔥 YES" : "NO"}</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" onClick={() => setEditingItem({ type: 'news', item: n })} className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer font-bold">Edit</button>
                          <button type="button" onClick={() => handleDeleteItem('news', n.id)} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 cursor-pointer font-bold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Single card submission
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const category = adminTab as 'dumps' | 'cvv2' | 'fullz' | 'banklogs' | 'cashapp' | 'paypal' | 'rdp';
      const cardData = {
        ...singleCard,
        category,
      };

      if (category === 'dumps') {
        if (!singleCard.bin || !singleCard.bank || !singleCard.price) {
          alert('Please fill out all required fields (BIN, Bank Name, Price).');
          setLoading(false);
          return;
        }
        cardData.withoutCvv2 = true;
        cardData.ssn = false;
        cardData.dob = false;
      } else if (category === 'cvv2') {
        if (!singleCard.bin || !singleCard.bank || !singleCard.price) {
          alert('Please fill out all required fields (BIN, Bank Name, Price).');
          setLoading(false);
          return;
        }
        cardData.withoutCvv2 = false;
        cardData.ssn = false;
        cardData.dob = false;
      } else if (category === 'fullz') {
        if (!singleCard.bin || !singleCard.bank || !singleCard.price) {
          alert('Please fill out all required fields (BIN, Bank Name, Price).');
          setLoading(false);
          return;
        }
        cardData.withoutCvv2 = false;
        cardData.ssn = true;
        cardData.dob = true;
      } else if (category === 'banklogs') {
        if (!singleCard.bank || !singleCard.price || singleCard.bankBalance === undefined) {
          alert('Please fill out all required fields (Bank Name, Balance, Price).');
          setLoading(false);
          return;
        }
      } else if (category === 'cashapp') {
        if (!singleCard.cashappUsername || !singleCard.price) {
          alert('Please fill out all required fields (Username, Price).');
          setLoading(false);
          return;
        }
      } else if (category === 'paypal') {
        if (!singleCard.paypalEmail || !singleCard.price) {
          alert('Please fill out all required fields (Email, Price).');
          setLoading(false);
          return;
        }
      } else if (category === 'rdp') {
        if (!singleCard.rdpIp || !singleCard.price) {
          alert('Please fill out all required fields (Host IP, Price).');
          setLoading(false);
          return;
        }
      }

      await onAddCard(cardData);
      onAddToast(`Uploaded successfully to live ${category.toUpperCase()} category!`, 'success');
      setSingleCard(prev => ({
        ...prev,
        cardNumber: '',
        cvv: '',
        fullName: '',
        fullAddressStr: '',
        fullPhone: '',
        fullSsn: '',
        fullDob: '',
        track1: '',
        track2: '',
        fullMmn: '',
        fullAtmPin: '',
        fullDriverLicense: '',
        fullEmail: '',
        fullEmailPassword: '',
        fullAccountNumber: '',
        fullRoutingNumber: '',
        bankBalance: 0,
        cashappUsername: '',
        cashappBalance: 0,
        cashappEmail: '',
        cashappPhone: '',
        cashappPin: '',
        paypalEmail: '',
        paypalPassword: '',
        paypalCookies: '',
        paypalBalance: 0,
        rdpIp: '',
        rdpUsername: '',
        rdpPassword: '',
        rdpCity: '',
        rdpState: '',
        rdpOs: '',
        rdpHospeed: '',
      }));
    } catch (err) {
      console.error(err);
      alert('Error uploading item.');
    } finally {
      setLoading(false);
    }
  };

  // News submission
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) {
      alert('Please fill out News Title and Content.');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newNews = await addNewsItem({
        title: newsTitle,
        content: newsContent,
        date: today,
        important: newsImportant,
      });
      setNewsList(prev => [newNews, ...prev]);
      onAddToast(`News bulletin "${newsTitle}" published successfully!`, 'success');
      setNewsTitle('');
      setNewsContent('');
      setNewsImportant(false);
    } catch (err) {
      console.error(err);
      alert('Error publishing news.');
    } finally {
      setLoading(false);
    }
  };

  // Wholesale pack submission
  const handleWholesaleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wholesaleName.trim() || wholesaleCount <= 0 || wholesalePrice <= 0) {
      alert('Please enter a valid Name, Count, and Price.');
      return;
    }
    setLoading(true);
    try {
      const newPack = await addWholesalePack({
        name: wholesaleName,
        count: wholesaleCount,
        price: wholesalePrice,
        description: wholesaleDescription,
        country: wholesaleCountry,
        type: wholesaleType,
      });
      setWholesaleList(prev => [newPack, ...prev]);
      onAddToast(`Wholesale pack "${wholesaleName}" listed successfully!`, 'success');
      setWholesaleName('');
      setWholesaleCount(10);
      setWholesalePrice(120.00);
      setWholesaleDescription('Premium high validity CC combo pack.');
    } catch (err) {
      console.error(err);
      alert('Error creating wholesale pack.');
    } finally {
      setLoading(false);
    }
  };

  // Auction item submission
  const handleAuctionSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auctionBin.trim() || !auctionBank.trim() || auctionStartingBid <= 0 || !auctionEndTime) {
      alert('Please fill out BIN, Bank, Starting Bid and Ending Time.');
      return;
    }
    setLoading(true);
    try {
      const cardDetail: CardItem = {
        id: 'auction-temp',
        bin: auctionBin,
        zip: '10001',
        bank: auctionBank,
        country: auctionCountry,
        state: auctionState,
        type: auctionType,
        creditDebit: 'Credit',
        subtype: 'Platinum',
        expDate: auctionExpDate,
        discounted: false,
        onlyRefundable: false,
        price: auctionStartingBid,
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
        base: 'BASE_AUCTIONS_PRO',
      };

      const newAuction = await addAuctionItem({
        card: cardDetail,
        currentBid: auctionStartingBid,
        myBid: 0,
        bidsCount: 0,
        endTime: auctionEndTime,
      });
      setAuctions(prev => [newAuction, ...prev]);
      onAddToast(`Auction for card ${auctionBin} launched successfully!`, 'success');
      setAuctionBin('411111');
      setAuctionBank('WELLS FARGO');
      setAuctionStartingBid(30.00);
    } catch (err) {
      console.error(err);
      alert('Error creating auction.');
    } finally {
      setLoading(false);
    }
  };

  // Admin reply to support ticket
  const handleAdminTicketReply = async () => {
    if (!ticketReplyText.trim() || !selectedTicketId) return;
    const ticket = ticketsList.find(t => t.id === selectedTicketId);
    if (!ticket) return;

    setLoading(true);
    try {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsg = {
        sender: 'admin' as const,
        text: ticketReplyText,
        timestamp,
      };

      const updatedMessages = [...ticket.messages, newMsg];
      await updateTicketMessages(selectedTicketId, updatedMessages, 'Replied');

      setTicketsList(prev => prev.map(t => t.id === selectedTicketId ? { ...t, messages: updatedMessages, status: 'Replied' } : t));
      setTicketReplyText('');
      onAddToast('Response sent to customer support ticket.', 'success');
    } catch (err) {
      console.error(err);
      alert('Error replying to ticket.');
    } finally {
      setLoading(false);
    }
  };

  // Admin resolve / close support ticket
  const handleCloseTicket = async (ticketId: string) => {
    setLoading(true);
    try {
      await updateTicketMessages(ticketId, [], 'Closed');
      setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Closed' } : t));
      onAddToast('Ticket closed successfully.', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Admin approves payment
  const handleApprovePaymentForm = async (paymentId: string, userEmail: string, amount: number) => {
    setLoading(true);
    try {
      await updatePaymentStatus(paymentId, 'Approved');
      
      const targetUser = await getUserProfile(userEmail);
      const updatedBalance = targetUser.balance + amount;
      const updatedCrabs = targetUser.crabRating + 15;

      await updateUserProfile(userEmail, {
        balance: updatedBalance,
        crabRating: updatedCrabs,
        accountStatus: 'active'
      });

      setPaymentsList(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Approved' } : p));
      onAddToast(`Deposit of $${amount.toFixed(2)} for ${userEmail} approved! Balance credited.`, 'success');
    } catch (err) {
      console.error(err);
      alert('Error approving payment.');
    } finally {
      setLoading(false);
    }
  };

  // Admin declines/cancels payment
  const handleDeclinePaymentForm = async (paymentId: string) => {
    setLoading(true);
    try {
      await updatePaymentStatus(paymentId, 'Failed');
      setPaymentsList(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Failed' } : p));
      onAddToast('Payment rejected/marked as Failed.', 'info');
    } catch (err) {
      console.error(err);
      alert('Error declining payment.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk cards parsing and submission
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      alert('Please paste some card data first.');
      return;
    }

    setLoading(true);
    try {
      const lines = bulkText.split('\n').filter(line => line.trim());
      const cardsToUpload: Omit<CardItem, 'id'>[] = [];

      for (const line of lines) {
        // Simple delimiters support: comma, pipe, space
        const parts = line.split(/[|,]/).map(p => p.trim());
        if (parts.length === 0) continue;

        // Parse with defaults
        const bin = parts[0] || '400000';
        const zip = parts[1] || '10001';
        const bank = parts[2] || 'STANDARD BANK';
        const country = parts[3] || 'US';
        const state = parts[4] || 'NY';
        const expDate = parts[5] || '12/28';

        cardsToUpload.push({
          bin,
          zip,
          bank: bank.toUpperCase(),
          country: country.toUpperCase(),
          state: state.toUpperCase(),
          type: bulkCategory === 'dumps' ? 'Mastercard' : 'Visa',
          creditDebit: 'Credit',
          subtype: 'Platinum',
          expDate,
          discounted: false,
          onlyRefundable: bulkCategory === 'cvv2',
          price: bulkPrice,
          ssn: bulkCategory === 'fullz',
          dob: bulkCategory === 'fullz',
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
          withoutCvv2: bulkCategory === 'dumps',
          base: bulkBase,
        });
      }

      if (cardsToUpload.length === 0) {
        alert('Could not parse any cards. Verify input format.');
        setLoading(false);
        return;
      }

      await onBulkAddCards(cardsToUpload);
      onAddToast(`Successfully parsed and loaded ${cardsToUpload.length} items to database!`, 'success');
      setBulkText('');
    } catch (err) {
      console.error(err);
      alert('Error uploading bulk cards.');
    } finally {
      setLoading(false);
    }
  };

  // Settings updating
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateSettings(settingsForm);
      onAddToast('Cryptocurrency payment addresses updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      alert('Error updating payment addresses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 md:p-6 shadow-xs select-text text-xs text-gray-700">
      
      {/* Top Banner */}
      <div className="bg-[#bee5eb]/30 border border-[#bee5eb] text-[#0c5460] p-4 rounded-sm flex items-center gap-3 mb-5">
        <ShieldAlert className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-900">🛡️ Live Protocol Admin Control Center</h3>
          <p className="font-semibold text-gray-600 mt-0.5">
            Logged in as <span className="text-[#0c5460] underline">patrickkamande10455@gmail.com</span>. You have master root database keys. All uploaded records and address updates take effect instantly.
          </p>
        </div>
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex flex-wrap border-b border-gray-300 mb-5 gap-1 select-none">
        <button
          onClick={() => setAdminTab('dumps')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'dumps'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload Dumps
        </button>
        <button
          onClick={() => setAdminTab('cvv2')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'cvv2'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload CVV2
        </button>
        <button
          onClick={() => setAdminTab('fullz')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'fullz'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload Fullz
        </button>
        <button
          onClick={() => setAdminTab('banklogs')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'banklogs'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload Bank Logs
        </button>
        <button
          onClick={() => setAdminTab('cashapp')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'cashapp'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload CashApp
        </button>
        <button
          onClick={() => setAdminTab('paypal')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'paypal'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload PayPal
        </button>
        <button
          onClick={() => setAdminTab('rdp')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'rdp'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload RDP/VPS
        </button>
        <button
          onClick={() => setAdminTab('bulk')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'bulk'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Bulk Upload
        </button>
        <button
          onClick={() => setAdminTab('news')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all flex items-center gap-1 ${
            adminTab === 'news'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" /> News Posts
        </button>
        <button
          onClick={() => setAdminTab('wholesale')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all flex items-center gap-1 ${
            adminTab === 'wholesale'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FolderSync className="w-3.5 h-3.5" /> Wholesale
        </button>
        <button
          onClick={() => setAdminTab('auction')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all flex items-center gap-1 ${
            adminTab === 'auction'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" /> Auctions
        </button>
        <button
          onClick={() => setAdminTab('tickets')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all flex items-center gap-1 relative ${
            adminTab === 'tickets'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Tickets
          {ticketsList.filter(t => t.status === 'Open').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[8px] px-1 rounded-full animate-bounce">
              {ticketsList.filter(t => t.status === 'Open').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('payments')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all flex items-center gap-1 relative ${
            adminTab === 'payments'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Payments Track
          {paymentsList.filter(p => p.status === 'Pending').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-extrabold text-[8px] px-1 rounded-full animate-pulse">
              {paymentsList.filter(p => p.status === 'Pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAdminTab('addresses')}
          className={`px-3 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'addresses'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Crypto Setting
        </button>
      </div>

      {/* TAB 1: Upload Dumps */}
      {adminTab === 'dumps' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 bg-blue-50/50 p-3 rounded border border-blue-200 text-blue-900 font-bold mb-2">
            Add New Dumps Item (Track 1/2 Records)
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-900 flex items-center gap-1">
              Card Number (16 Digits) *
            </label>
            <input
              type="text"
              maxLength={19}
              value={singleCard.cardNumber || ''}
              onChange={e => {
                const cleanVal = e.target.value.replace(/\D/g, '');
                const formatted = cleanVal.replace(/(\d{4})/g, '$1 ').trim();
                const first6 = cleanVal.slice(0, 6);
                setSingleCard(prev => ({
                  ...prev,
                  cardNumber: formatted,
                  bin: first6 || prev.bin
                }));
              }}
              className="border border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold bg-blue-50/10 text-blue-950"
              placeholder="e.g. 4111 1111 1111 1111"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card BIN (First 6 Digits) *</label>
            <input
              type="text"
              maxLength={6}
              value={singleCard.bin}
              onChange={e => setSingleCard(prev => ({ ...prev, bin: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">ZIP Code / Postal Code *</label>
            <input
              type="text"
              value={singleCard.zip}
              onChange={e => setSingleCard(prev => ({ ...prev, zip: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Issuing Bank Name *</label>
            <input
              type="text"
              value={singleCard.bank}
              onChange={e => setSingleCard(prev => ({ ...prev, bank: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Country Code (e.g. US, CA, GB) *</label>
            <input
              type="text"
              maxLength={2}
              value={singleCard.country}
              onChange={e => setSingleCard(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-bold font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">State / Region (e.g. CA, NY) *</label>
            <input
              type="text"
              maxLength={3}
              value={singleCard.state}
              onChange={e => setSingleCard(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-bold font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Expiry Date (MM/YY) *</label>
            <input
              type="text"
              placeholder="e.g. 12/28"
              value={singleCard.expDate}
              onChange={e => setSingleCard(prev => ({ ...prev, expDate: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card brand / Type *</label>
            <select
              value={singleCard.type}
              onChange={e => setSingleCard(prev => ({ ...prev, type: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
              <option value="Discover">Discover</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card Class (Credit/Debit) *</label>
            <select
              value={singleCard.creditDebit}
              onChange={e => setSingleCard(prev => ({ ...prev, creditDebit: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card Subtype / Level *</label>
            <select
              value={singleCard.subtype}
              onChange={e => setSingleCard(prev => ({ ...prev, subtype: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Classic">Classic</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Signature">Signature</option>
              <option value="Business">Business</option>
              <option value="Corporate">Corporate</option>
              <option value="Infinite">Infinite</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-amber-900">Base Name *</label>
            <input
              type="text"
              value={singleCard.base}
              onChange={e => setSingleCard(prev => ({ ...prev, base: e.target.value }))}
              className="border border-amber-300 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900">Sale Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.price)}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none focus:border-emerald-500 font-mono font-bold text-emerald-950"
              required
            />
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Track 1 Data (Optional)</label>
              <textarea
                value={singleCard.track1 || ''}
                onChange={e => setSingleCard(prev => ({ ...prev, track1: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono text-[11px] h-20"
                placeholder="e.g. B4111111111111111^SMITH/JOHN^281210100000..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Track 2 Data *</label>
              <textarea
                value={singleCard.track2 || ''}
                onChange={e => setSingleCard(prev => ({ ...prev, track2: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono text-[11px] h-20"
                placeholder="e.g. 4111111111111111=281210100000..."
                required
              />
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live Dump Record
                </>
              )}
            </button>
          </div>
        </form>
        {renderManageList('dumps')}
      </div>
    )}

      {/* TAB 1.5: Upload CVV2 */}
      {adminTab === 'cvv2' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 bg-purple-50/50 p-3 rounded border border-purple-200 text-purple-900 font-bold mb-2">
            Add New CVV2 Card Item
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-900 flex items-center gap-1">
              Card Number (16 Digits) *
            </label>
            <input
              type="text"
              maxLength={19}
              value={singleCard.cardNumber || ''}
              onChange={e => {
                const cleanVal = e.target.value.replace(/\D/g, '');
                const formatted = cleanVal.replace(/(\d{4})/g, '$1 ').trim();
                const first6 = cleanVal.slice(0, 6);
                setSingleCard(prev => ({
                  ...prev,
                  cardNumber: formatted,
                  bin: first6 || prev.bin
                }));
              }}
              className="border border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold bg-blue-50/10 text-blue-950"
              placeholder="e.g. 4111 1111 1111 1111"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card BIN (First 6 Digits) *</label>
            <input
              type="text"
              maxLength={6}
              value={singleCard.bin}
              onChange={e => setSingleCard(prev => ({ ...prev, bin: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">CVV/CVV2 (3 or 4 Digits) *</label>
            <input
              type="text"
              maxLength={4}
              value={singleCard.cvv || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, cvv: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold"
              placeholder="e.g. 123"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Cardholder Full Name *</label>
            <input
              type="text"
              value={singleCard.fullName || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullName: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-semibold"
              placeholder="e.g. JOHN SMITH"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">ZIP Code / Postal Code *</label>
            <input
              type="text"
              value={singleCard.zip}
              onChange={e => setSingleCard(prev => ({ ...prev, zip: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Issuing Bank Name *</label>
            <input
              type="text"
              value={singleCard.bank}
              onChange={e => setSingleCard(prev => ({ ...prev, bank: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Country Code (e.g. US, CA) *</label>
            <input
              type="text"
              maxLength={2}
              value={singleCard.country}
              onChange={e => setSingleCard(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-bold font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">State / Region (e.g. NY) *</label>
            <input
              type="text"
              maxLength={3}
              value={singleCard.state}
              onChange={e => setSingleCard(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-bold font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Expiry Date (MM/YY) *</label>
            <input
              type="text"
              placeholder="e.g. 12/28"
              value={singleCard.expDate}
              onChange={e => setSingleCard(prev => ({ ...prev, expDate: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card brand / Type *</label>
            <select
              value={singleCard.type}
              onChange={e => setSingleCard(prev => ({ ...prev, type: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
              <option value="Discover">Discover</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card Class *</label>
            <select
              value={singleCard.creditDebit}
              onChange={e => setSingleCard(prev => ({ ...prev, creditDebit: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card Subtype *</label>
            <select
              value={singleCard.subtype}
              onChange={e => setSingleCard(prev => ({ ...prev, subtype: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Classic">Classic</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Signature">Signature</option>
              <option value="Business">Business</option>
              <option value="Corporate">Corporate</option>
              <option value="Infinite">Infinite</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-amber-900">Base Name *</label>
            <input
              type="text"
              value={singleCard.base}
              onChange={e => setSingleCard(prev => ({ ...prev, base: e.target.value }))}
              className="border border-amber-300 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900">Sale Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.price)}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none focus:border-emerald-500 font-mono font-bold text-emerald-950"
              required
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <label className="flex items-center gap-2 font-semibold text-rose-800 hover:text-rose-950 cursor-pointer">
              <input
                type="checkbox"
                checked={singleCard.onlyRefundable}
                onChange={e => setSingleCard(prev => ({ ...prev, onlyRefundable: e.target.checked }))}
                className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              Refundable / Replaceable Only
            </label>
          </div>

          <div className="md:col-span-3 flex flex-col gap-1 mt-2">
            <label className="font-bold text-gray-800">Full Billing Address / Profile Details</label>
            <textarea
              value={singleCard.fullAddressStr || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullAddressStr: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono text-[11px] h-20"
              placeholder="e.g. 123 Main St, New York, NY 10001"
            />
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Phone Contact (Optional)</label>
              <input
                type="text"
                value={singleCard.fullPhone || ''}
                onChange={e => setSingleCard(prev => ({ ...prev, fullPhone: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none"
                placeholder="e.g. +1 555-019-2831"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Email Address (Optional)</label>
              <input
                type="text"
                value={singleCard.fullEmail || ''}
                onChange={e => setSingleCard(prev => ({ ...prev, fullEmail: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none"
                placeholder="e.g. smith@gmail.com"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live CVV2 Item
                </>
              )}
            </button>
          </div>
        </form>
        {renderManageList('cvv2')}
      </div>
    )}

      {/* TAB 1.6: Upload Fullz */}
      {adminTab === 'fullz' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 bg-indigo-50/50 p-3 rounded border border-indigo-200 text-indigo-900 font-bold mb-2">
            Add New Fullz Profile (Complete Person Info)
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-900 flex items-center gap-1">
              Card Number (16 Digits) *
            </label>
            <input
              type="text"
              maxLength={19}
              value={singleCard.cardNumber || ''}
              onChange={e => {
                const cleanVal = e.target.value.replace(/\D/g, '');
                const formatted = cleanVal.replace(/(\d{4})/g, '$1 ').trim();
                const first6 = cleanVal.slice(0, 6);
                setSingleCard(prev => ({
                  ...prev,
                  cardNumber: formatted,
                  bin: first6 || prev.bin
                }));
              }}
              className="border border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold bg-blue-50/10 text-blue-950"
              placeholder="e.g. 4111 1111 1111 1111"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card BIN (First 6 Digits) *</label>
            <input
              type="text"
              maxLength={6}
              value={singleCard.bin}
              onChange={e => setSingleCard(prev => ({ ...prev, bin: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">CVV *</label>
            <input
              type="text"
              maxLength={4}
              value={singleCard.cvv || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, cvv: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Full Name *</label>
            <input
              type="text"
              value={singleCard.fullName || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullName: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Social Security Number (SSN) *</label>
            <input
              type="text"
              value={singleCard.fullSsn || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullSsn: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. 111-222-3333"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Date of Birth (DOB) *</label>
            <input
              type="text"
              value={singleCard.fullDob || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullDob: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. 10/12/1988"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Issuing Bank Name *</label>
            <input
              type="text"
              value={singleCard.bank}
              onChange={e => setSingleCard(prev => ({ ...prev, bank: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-semibold uppercase"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">ZIP Code *</label>
            <input
              type="text"
              value={singleCard.zip}
              onChange={e => setSingleCard(prev => ({ ...prev, zip: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Expiry Date *</label>
            <input
              type="text"
              value={singleCard.expDate}
              onChange={e => setSingleCard(prev => ({ ...prev, expDate: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Mother's Maiden Name (MMN)</label>
            <input
              type="text"
              value={singleCard.fullMmn || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullMmn: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              placeholder="e.g. MILLER"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">ATM PIN</label>
            <input
              type="text"
              value={singleCard.fullAtmPin || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullAtmPin: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. 4821"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Driver License Number</label>
            <input
              type="text"
              value={singleCard.fullDriverLicense || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullDriverLicense: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. D9123847"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Full Phone Contact</label>
            <input
              type="text"
              value={singleCard.fullPhone || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullPhone: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              placeholder="e.g. +1 602-555-0199"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Email Address</label>
            <input
              type="text"
              value={singleCard.fullEmail || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullEmail: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              placeholder="e.g. smith@gmail.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Email Password</label>
            <input
              type="text"
              value={singleCard.fullEmailPassword || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullEmailPassword: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. Smith@Pass123"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Checking Account Number</label>
            <input
              type="text"
              value={singleCard.fullAccountNumber || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullAccountNumber: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. 10029384812"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Routing Number</label>
            <input
              type="text"
              value={singleCard.fullRoutingNumber || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullRoutingNumber: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. 021000021"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900">Sale Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.price)}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none focus:border-emerald-500 font-mono font-bold text-emerald-950"
              required
            />
          </div>

          <div className="md:col-span-3 flex flex-col gap-1 mt-2">
            <label className="font-bold text-gray-800">Complete Address (Street, City, State, ZIP) *</label>
            <textarea
              value={singleCard.fullAddressStr || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, fullAddressStr: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono text-[11px] h-20"
              placeholder="e.g. 123 Pinecrest Lane, Phoenix, AZ 85001"
              required
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live Fullz Profile
                </>
              )}
            </button>
          </div>
        </form>
        {renderManageList('fullz')}
      </div>
    )}

      {/* TAB 1.7: Upload Bank Logs */}
      {adminTab === 'banklogs' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 bg-[#e8f4fd] p-3 rounded border border-blue-200 text-blue-900 font-bold mb-2">
            Add New Bank Login Record
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Bank / Institution Name *</label>
            <input
              type="text"
              value={singleCard.bank || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, bank: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none uppercase font-semibold"
              placeholder="e.g. CHASE BANK"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Account Type *</label>
            <select
              value={singleCard.bankAccountType || 'Checking'}
              onChange={e => setSingleCard(prev => ({ ...prev, bankAccountType: e.target.value }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Business Checking">Business Checking</option>
              <option value="Corporate Savings">Corporate Savings</option>
              <option value="Credit Card Account">Credit Card Account</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Access Type *</label>
            <select
              value={singleCard.bankAccessType || 'Online Login'}
              onChange={e => setSingleCard(prev => ({ ...prev, bankAccessType: e.target.value }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Online Login">Online Login</option>
              <option value="SMS Bypass">SMS Bypass</option>
              <option value="Cookies Attached">Cookies Attached</option>
              <option value="App Login / API Access">App Login / API Access</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-900">Account Balance (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.bankBalance)}
              onChange={e => setSingleCard(prev => ({ ...prev, bankBalance: parseFloat(e.target.value) }))}
              className="border border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold text-blue-950"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Country Location *</label>
            <input
              type="text"
              maxLength={2}
              value={singleCard.country || 'US'}
              onChange={e => setSingleCard(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none uppercase font-bold font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">State / Region (Optional)</label>
            <input
              type="text"
              maxLength={3}
              value={singleCard.state || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none uppercase font-bold font-mono"
              placeholder="e.g. TX"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Login Username / ID *</label>
            <input
              type="text"
              value={singleCard.loginUsername || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, loginUsername: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. chaseuser99"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Login Password *</label>
            <input
              type="text"
              value={singleCard.loginPassword || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, loginPassword: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. chasepass77"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-amber-900">Base Name *</label>
            <input
              type="text"
              value={singleCard.base}
              onChange={e => setSingleCard(prev => ({ ...prev, base: e.target.value }))}
              className="border border-amber-300 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900">Sale Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.price)}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none focus:border-emerald-500 font-mono font-bold text-emerald-950"
              required
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live Bank Log Record
                </>
              )}
            </button>
          </div>
        </form>
        {renderManageList('banklogs')}
      </div>
    )}

      {/* TAB 1.8: Upload CashApp */}
      {adminTab === 'cashapp' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 bg-emerald-50 p-3 rounded border border-emerald-200 text-emerald-900 font-bold mb-2">
            Add New CashApp Account Item
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900 flex items-center gap-1">
              $Cashtag Username *
            </label>
            <input
              type="text"
              value={singleCard.cashappUsername || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, cashappUsername: e.target.value }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none font-mono font-bold text-emerald-950"
              placeholder="e.g. $JohnSmith33"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Account Balance (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.cashappBalance)}
              onChange={e => setSingleCard(prev => ({ ...prev, cashappBalance: parseFloat(e.target.value) }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">CashApp Cash PIN</label>
            <input
              type="text"
              maxLength={6}
              value={singleCard.cashappPin || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, cashappPin: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono font-bold"
              placeholder="e.g. 1928"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Linked Phone Contact</label>
            <input
              type="text"
              value={singleCard.cashappPhone || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, cashappPhone: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              placeholder="e.g. +1 602-555-0144"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Linked Email Contact</label>
            <input
              type="text"
              value={singleCard.cashappEmail || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, cashappEmail: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              placeholder="e.g. johnny@gmail.com"
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <label className="flex items-center gap-2 font-semibold text-rose-800 hover:text-rose-950 cursor-pointer">
              <input
                type="checkbox"
                checked={singleCard.cashappHasFunds || false}
                onChange={e => setSingleCard(prev => ({ ...prev, cashappHasFunds: e.target.checked }))}
                className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              Has Linked Bank Card Funds?
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-amber-900">Base Name *</label>
            <input
              type="text"
              value={singleCard.base}
              onChange={e => setSingleCard(prev => ({ ...prev, base: e.target.value }))}
              className="border border-amber-300 rounded p-2 focus:outline-none font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900">Sale Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.price)}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none font-mono font-bold text-emerald-950"
              required
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live CashApp Item
                </>
              )}
            </button>
          </div>
        </form>
        {renderManageList('cashapp')}
      </div>
    )}

      {/* TAB 1.9: Upload PayPal */}
      {adminTab === 'paypal' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 bg-blue-50 p-3 rounded border border-blue-200 text-blue-900 font-bold mb-2">
            Add New PayPal Verified Account
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-900">PayPal Registered Email *</label>
            <input
              type="email"
              value={singleCard.paypalEmail || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, paypalEmail: e.target.value }))}
              className="border border-blue-300 rounded p-2 focus:outline-none font-mono font-bold text-blue-950"
              placeholder="e.g. user@paypal.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">PayPal Account Password *</label>
            <input
              type="text"
              value={singleCard.paypalPassword || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, paypalPassword: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. PPUserPass77!"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Available Balance (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.paypalBalance)}
              onChange={e => setSingleCard(prev => ({ ...prev, paypalBalance: parseFloat(e.target.value) }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono font-bold"
              required
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <label className="flex items-center gap-2 font-semibold text-rose-800 hover:text-rose-950 cursor-pointer">
              <input
                type="checkbox"
                checked={singleCard.paypalHasPaymentMethod || false}
                onChange={e => setSingleCard(prev => ({ ...prev, paypalHasPaymentMethod: e.target.checked }))}
                className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              Linked Card / Bank Account Included
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-amber-900">Base Name *</label>
            <input
              type="text"
              value={singleCard.base}
              onChange={e => setSingleCard(prev => ({ ...prev, base: e.target.value }))}
              className="border border-amber-300 rounded p-2 focus:outline-none font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900">Sale Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.price)}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none font-mono font-bold text-emerald-950"
              required
            />
          </div>

          <div className="md:col-span-3 flex flex-col gap-1 mt-2">
            <label className="font-bold text-gray-800">Cookies / Session Attachment JSON String</label>
            <textarea
              value={singleCard.paypalCookies || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, paypalCookies: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono text-[11px] h-20"
              placeholder='[{"domain": ".paypal.com", "name": "ts", "value": "..."}]'
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live PayPal Record
                </>
              )}
            </button>
          </div>
        </form>
        {renderManageList('paypal')}
      </div>
    )}

      {/* TAB 1.10: Upload RDP/VPS */}
      {adminTab === 'rdp' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 bg-indigo-50 p-3 rounded border border-indigo-200 text-indigo-900 font-bold mb-2">
            Add New Remote Desktop Protocol (RDP) / VPS Server
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-blue-900">Server Host IP / Domain *</label>
            <input
              type="text"
              value={singleCard.rdpIp || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpIp: e.target.value }))}
              className="border border-blue-300 rounded p-2 focus:outline-none font-mono font-bold text-blue-950"
              placeholder="e.g. 192.168.100.20:3389"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Connection Username *</label>
            <input
              type="text"
              value={singleCard.rdpUsername || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpUsername: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. Administrator"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Connection Password *</label>
            <input
              type="text"
              value={singleCard.rdpPassword || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpPassword: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-mono"
              placeholder="e.g. p@ssword123"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Server Country *</label>
            <input
              type="text"
              maxLength={2}
              value={singleCard.rdpCountry || 'US'}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpCountry: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-bold uppercase"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Server State / Region</label>
            <input
              type="text"
              maxLength={3}
              value={singleCard.rdpState || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpState: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none font-bold uppercase"
              placeholder="e.g. NY"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Server City</label>
            <input
              type="text"
              value={singleCard.rdpCity || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpCity: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              placeholder="e.g. New York"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Operating System *</label>
            <select
              value={singleCard.rdpOs || 'Windows Server 2022'}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpOs: e.target.value }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Windows Server 2022">Windows Server 2022</option>
              <option value="Windows Server 2019">Windows Server 2019</option>
              <option value="Windows 11 Pro">Windows 11 Pro</option>
              <option value="Windows 10 Pro">Windows 10 Pro</option>
              <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</option>
              <option value="Debian 12 RDP">Debian 12 RDP</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Access Privilege Level *</label>
            <select
              value={singleCard.rdpAccessType || 'Admin'}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpAccessType: e.target.value }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Admin">Admin</option>
              <option value="User">Standard User</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Connection Speed (HOSPEED)</label>
            <input
              type="text"
              value={singleCard.rdpHospeed || ''}
              onChange={e => setSingleCard(prev => ({ ...prev, rdpHospeed: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none"
              placeholder="e.g. 1 Gbps"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-amber-900">Base Name *</label>
            <input
              type="text"
              value={singleCard.base}
              onChange={e => setSingleCard(prev => ({ ...prev, base: e.target.value }))}
              className="border border-amber-300 rounded p-2 focus:outline-none font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-emerald-900">Sale Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={safeNum(singleCard.price)}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="border border-emerald-300 rounded p-2 focus:outline-none font-mono font-bold text-emerald-950"
              required
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live RDP Server Item
                </>
              )}
            </button>
          </div>
        </form>
        {renderManageList('rdp')}
      </div>
    )}

      {/* TAB 2: Bulk upload */}
      {adminTab === 'bulk' && (
        <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-[11px] leading-relaxed text-amber-900 font-semibold">
            <p className="font-extrabold uppercase mb-1">Bulk Parser format instruction:</p>
            <p>Paste card elements line by line. Supported delimiter is the comma (,) or pipe (|).</p>
            <p className="font-mono mt-1 text-[10px] bg-white border p-1 rounded">BIN | ZIP | BANK | COUNTRY | STATE | EXP_DATE</p>
            <p className="mt-1">Example:<br />411111 | 90210 | CHASE BANK | US | CA | 12/28</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Target Category</label>
              <select
                value={bulkCategory}
                onChange={e => setBulkCategory(e.target.value as any)}
                className="border border-gray-300 rounded p-2 bg-white font-semibold"
              >
                <option value="cvv2">CVV2 Cards</option>
                <option value="dumps">Dumps Track 1/2</option>
                <option value="fullz">Fullz (Complete profile with SSN/DOB)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Selling Price per item ($)</label>
              <input
                type="number"
                step="0.01"
                value={bulkPrice}
                onChange={e => setBulkPrice(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold text-emerald-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Target Base Name</label>
              <input
                type="text"
                value={bulkBase}
                onChange={e => setBulkBase(e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Paste records below:</label>
            <textarea
              rows={8}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="border border-gray-300 rounded p-2.5 focus:outline-none focus:border-blue-500 font-mono text-[11px] resize-y leading-relaxed text-gray-800"
              placeholder="411111 | 90210 | CHASE BANK | US | CA | 12/28&#10;512345 | 10019 | CITIBANK | US | NY | 05/27"
              required
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] uppercase border border-blue-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading bulk...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Import & Import Live records
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB: News bulletins */}
      {adminTab === 'news' && (
        <div className="flex flex-col gap-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded text-[11px] leading-relaxed text-amber-900 font-semibold flex items-start gap-2">
            <Newspaper className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-extrabold uppercase">News Bulletin Broadcast Center</p>
              <p>Post updates, notifications, bases list news, and alert alerts. Important bulletins will be highlighted on the main home news panel for all logged-in clients.</p>
            </div>
          </div>

          <form onSubmit={handleNewsSubmit} className="grid grid-cols-1 gap-4 bg-gray-50 border p-4 rounded shadow-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">News Title *</label>
              <input
                type="text"
                value={newsTitle}
                onChange={e => setNewsTitle(e.target.value)}
                placeholder="e.g. 🔥 BASE UPDATE: Fresh High Valid US & UK Fullz loaded"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-amber-500 font-semibold text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Bulletin Content *</label>
              <textarea
                value={newsContent}
                onChange={e => setNewsContent(e.target.value)}
                placeholder="Details of the update... HTML support included."
                rows={4}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-amber-500 font-semibold text-xs font-mono"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="importantNews"
                checked={newsImportant}
                onChange={e => setNewsImportant(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="importantNews" className="font-extrabold text-amber-900 uppercase tracking-wider text-[10px] cursor-pointer">
                Mark as Critical Priority (Blinking Red Badge)
              </label>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] uppercase shadow border border-amber-600"
              >
                <PlusCircle className="w-4 h-4" /> Publish Broadcast
              </button>
            </div>
          </form>
          {renderManageList('news')}
        </div>
      )}

      {/* TAB: Wholesale packs */}
      {adminTab === 'wholesale' && (
        <div className="flex flex-col gap-6">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded text-[11px] leading-relaxed text-purple-900 font-semibold flex items-start gap-2">
            <FolderSync className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <p className="font-extrabold uppercase">Wholesale CC Packs Configurator</p>
              <p>List discounted card combination bundles (e.g. packs of 10, 50, or 100 with guaranteed valid rate and auto-replacement guarantees).</p>
            </div>
          </div>

          <form onSubmit={handleWholesaleSubmitForm} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border p-4 rounded shadow-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Pack Name *</label>
              <input
                type="text"
                value={wholesaleName}
                onChange={e => setWholesaleName(e.target.value)}
                placeholder="e.g. 50x US VISA CLASSIC BUNDLE"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-purple-500 font-semibold text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Total Cards Count *</label>
              <input
                type="number"
                value={wholesaleCount}
                onChange={e => setWholesaleCount(parseInt(e.target.value) || 0)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-purple-500 font-mono font-bold"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Pack Bundle Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                value={wholesalePrice}
                onChange={e => setWholesalePrice(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-purple-500 font-mono font-bold text-emerald-800"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Target Country *</label>
              <input
                type="text"
                maxLength={2}
                value={wholesaleCountry}
                onChange={e => setWholesaleCountry(e.target.value.toUpperCase())}
                placeholder="e.g. US"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-purple-500 font-mono font-bold uppercase"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Cards Type/Brand *</label>
              <input
                type="text"
                value={wholesaleType}
                onChange={e => setWholesaleType(e.target.value)}
                placeholder="e.g. Visa Platinum / Gold"
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-purple-500 font-semibold"
                required
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-bold text-gray-800">Pack Description & Guarantee Details *</label>
              <textarea
                value={wholesaleDescription}
                onChange={e => setWholesaleDescription(e.target.value)}
                placeholder="Provide pack composition, average validity rate, and replace policies..."
                rows={3}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-purple-500 font-semibold text-xs"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] uppercase shadow border border-purple-600"
              >
                <PlusCircle className="w-4 h-4" /> Create Wholesale Offer
              </button>
            </div>
          </form>
          {renderManageList('wholesale')}
        </div>
      )}

      {/* TAB: Auctions */}
      {adminTab === 'auction' && (
        <div className="flex flex-col gap-6">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded text-[11px] leading-relaxed text-rose-900 font-semibold flex items-start gap-2">
            <Gavel className="w-5 h-5 text-rose-700 shrink-0" />
            <div>
              <p className="font-extrabold uppercase">Live Card bidding auctioneer</p>
              <p>Place high-value specialty items (e.g. unique platinum/signature BINs, heavy balances) up for real-time bids with a countdown timer.</p>
            </div>
          </div>

          <form onSubmit={handleAuctionSubmitForm} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border p-4 rounded shadow-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Card BIN (First 6 Digits) *</label>
              <input
                type="text"
                maxLength={6}
                value={auctionBin}
                onChange={e => setAuctionBin(e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-rose-500 font-mono font-bold"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Card Bank Name *</label>
              <input
                type="text"
                value={auctionBank}
                onChange={e => setAuctionBank(e.target.value.toUpperCase())}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-rose-500 font-bold uppercase"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Card brand / Type *</label>
              <select
                value={auctionType}
                onChange={e => setAuctionType(e.target.value as any)}
                className="border border-gray-300 rounded p-2 bg-white font-semibold"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
                <option value="Discover">Discover</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Country Code *</label>
              <input
                type="text"
                maxLength={2}
                value={auctionCountry}
                onChange={e => setAuctionCountry(e.target.value.toUpperCase())}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-rose-500 font-mono font-bold uppercase"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">State / Region *</label>
              <input
                type="text"
                maxLength={3}
                value={auctionState}
                onChange={e => setAuctionState(e.target.value.toUpperCase())}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-rose-500 font-mono font-bold uppercase"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Expiry MM/YY *</label>
              <input
                type="text"
                value={auctionExpDate}
                onChange={e => setAuctionExpDate(e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-rose-500 font-mono font-bold"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Starting Bid (USD $) *</label>
              <input
                type="number"
                step="1"
                value={auctionStartingBid}
                onChange={e => setAuctionStartingBid(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-rose-500 font-mono font-bold text-emerald-800"
                required
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-bold text-gray-800">Auction End Time *</label>
              <input
                type="datetime-local"
                value={auctionEndTime}
                onChange={e => setAuctionEndTime(e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-rose-500 font-mono font-semibold"
                required
              />
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] uppercase shadow border border-rose-600"
              >
                <PlusCircle className="w-4 h-4" /> Start Auction
              </button>
            </div>
          </form>
          {renderManageList('auction')}
        </div>
      )}

      {/* TAB: Support Tickets with cool Telegram links */}
      {adminTab === 'tickets' && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#bee5eb]/30 border border-[#bee5eb] text-[#0c5460] p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <MessageSquare className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-950">🎫 Live Support Ticket Center</h4>
                <p className="font-semibold text-gray-600 mt-1">Review active support requests and reply directly to client queries. The community and escalation links can be shared for external support.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <a
                href="https://t.me/mariafq"
                target="_blank"
                rel="noreferrer"
                className="bg-[#24a1de]/20 hover:bg-[#24a1de]/30 text-[#1f84b6] border border-[#24a1de]/40 px-3 py-1.5 rounded font-extrabold flex items-center gap-1.5 text-[10px] uppercase tracking-wide transition-all"
              >
                ✈️ Support Escalation Chat
              </a>
              <a
                href="https://t.me/+HWRd8CbPTjU0YTU0"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded font-extrabold flex items-center gap-1.5 text-[10px] uppercase tracking-wide transition-all"
              >
                💬 Community Telegram Group
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tickets Left Panel */}
            <div className="md:col-span-1 border rounded bg-gray-50 overflow-hidden flex flex-col max-h-[500px]">
              <div className="bg-gray-100 px-3 py-2 border-b font-extrabold text-gray-700 uppercase tracking-wider text-[10px]">Active Ticket Queue</div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
                {ticketsList.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 font-semibold">No tickets found in DB.</div>
                ) : (
                  ticketsList.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full p-3 text-left transition-all hover:bg-white flex flex-col gap-1.5 ${
                        selectedTicketId === ticket.id ? 'bg-white border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 truncate max-w-[120px]">{ticket.userEmail}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          ticket.status === 'Open' ? 'bg-red-100 text-red-800' : ticket.status === 'Replied' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 truncate text-[11px]">{ticket.subject}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold mt-1">
                        <span>{ticket.messages.length} messages</span>
                        <span>{ticket.id.slice(0, 8)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Tickets Chat Detail Panel */}
            <div className="md:col-span-2 border rounded bg-white flex flex-col max-h-[500px] min-h-[400px]">
              {selectedTicketId ? (
                (() => {
                  const activeTicket = ticketsList.find(t => t.id === selectedTicketId);
                  if (!activeTicket) return null;
                  return (
                    <div className="flex flex-col h-full flex-1">
                      {/* Ticket Header */}
                      <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-xs">{activeTicket.subject}</h4>
                          <p className="text-[10px] text-gray-500 font-semibold mt-0.5">User: {activeTicket.userEmail}</p>
                        </div>
                        <button
                          onClick={() => handleCloseTicket(activeTicket.id)}
                          className="bg-gray-200 hover:bg-red-600 hover:text-white text-gray-800 px-3 py-1 rounded font-extrabold text-[9px] uppercase tracking-wide transition-all"
                        >
                          Mark Resolved (Close)
                        </button>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                        {activeTicket.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[85%] rounded p-2.5 text-xs ${
                              msg.sender === 'admin'
                                ? 'bg-blue-600 text-white self-end ml-auto'
                                : 'bg-white border border-gray-200 text-gray-800 self-start mr-auto'
                            }`}
                          >
                            <span className="font-extrabold text-[9px] uppercase tracking-wider mb-1 opacity-75">
                              {msg.sender === 'admin' ? '🛡️ MASTER ADMIN' : '👤 CLIENT CUSTOMER'}
                            </span>
                            <p className="font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <span className="text-[8px] opacity-70 text-right mt-1.5 block">{msg.timestamp}</span>
                          </div>
                        ))}
                      </div>

                      {/* Reply Input */}
                      <div className="p-3 border-t bg-white flex items-center gap-2">
                        <input
                          type="text"
                          value={ticketReplyText}
                          onChange={e => setTicketReplyText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAdminTicketReply(); }}
                          placeholder="Type your official administrative response..."
                          className="flex-1 border rounded p-2 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                        <button
                          onClick={handleAdminTicketReply}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded transition-all flex items-center gap-1 text-[10px] uppercase"
                        >
                          Send <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-2 p-6 text-center">
                  <MessageSquare className="w-12 h-12 stroke-1" />
                  <div>
                    <h5 className="font-bold text-gray-700">No Support Ticket Selected</h5>
                    <p className="text-[11px] max-w-[250px] mt-1">Select an active ticket from the queue left side panel to review chat details and post replies.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Payments Tracking */}
      {adminTab === 'payments' && (
        <div className="flex flex-col gap-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded text-[11px] leading-relaxed text-emerald-900 font-semibold flex items-start gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-extrabold uppercase">💰 Cryptocurrency Deposit ledger & Payment Tracker</p>
              <p>Verify blockchain hashes submitted by clients. Click <b>"Approve"</b> to instantly credit the user's balance and increase their Crab rating score, or <b>"Reject"</b> to mark the transaction as failed.</p>
            </div>
          </div>

          <div className="border rounded bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-800 font-bold uppercase text-[9px] tracking-wider select-none">
                  <th className="p-3">Deposit ID</th>
                  <th className="p-3">User Email</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount USD</th>
                  <th className="p-3">Blockchain TXID / Info</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-semibold">
                {paymentsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No deposit records located in system ledger.</td>
                  </tr>
                ) : (
                  paymentsList.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono font-bold text-gray-500">{pay.id.slice(0, 8)}</td>
                      <td className="p-3 text-gray-900">{pay.userEmail}</td>
                      <td className="p-3">
                        <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase">
                          {pay.cryptoMethod}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-emerald-800 font-bold">${pay.amount.toFixed(2)}</td>
                      <td className="p-3 max-w-[200px] truncate" title={pay.transactionHash}>
                        <span className="font-mono font-bold text-gray-700 text-[10px] bg-gray-50 p-1 border rounded block truncate">
                          {pay.transactionHash}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          pay.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pay.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {pay.status === 'Pending' ? (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleApprovePaymentForm(pay.id, pay.userEmail, pay.amount)}
                              disabled={loading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded transition-all text-[9px] uppercase cursor-pointer shadow border border-emerald-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeclinePaymentForm(pay.id)}
                              disabled={loading}
                              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-2.5 py-1 rounded transition-all text-[9px] uppercase cursor-pointer border border-red-600"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[10px]">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Addresses */}
      {adminTab === 'addresses' && (
        <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-[11px] leading-relaxed text-blue-900 font-semibold flex items-start gap-2">
            <Wallet className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase">Cryptocurrency Deposit Addresses configuration</p>
              <p>These addresses are loaded live in the "Add Funds" modal whenever clients request to deposit Bitcoin, Litecoin, Ethereum, or Tether USDT.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" /> Bitcoin (BTC) address:
              </label>
              <input
                type="text"
                value={settingsForm.btcAddress}
                onChange={e => setSettingsForm(prev => ({ ...prev, btcAddress: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                placeholder="BTC Address"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full" /> Tether (USDT) address:
              </label>
              <input
                type="text"
                value={settingsForm.usdtAddress}
                onChange={e => setSettingsForm(prev => ({ ...prev, usdtAddress: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                placeholder="USDT TRC-20 Address"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sky-500 rounded-full" /> Litecoin (LTC) address:
              </label>
              <input
                type="text"
                value={settingsForm.ltcAddress}
                onChange={e => setSettingsForm(prev => ({ ...prev, ltcAddress: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                placeholder="LTC Address"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Ethereum (ETH) address:
              </label>
              <input
                type="text"
                value={settingsForm.ethAddress}
                onChange={e => setSettingsForm(prev => ({ ...prev, ethAddress: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                placeholder="ETH Address"
                required
              />
            </div>
          </div>

          <div className="flex justify-end border-t pt-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0c5460] hover:bg-[#083a43] text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] uppercase border border-[#0c5460] shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Live payment Options
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {renderEditModal()}
    </div>
  );
}
