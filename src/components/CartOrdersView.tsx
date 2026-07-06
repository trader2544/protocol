import React, { useState } from 'react';
import { ShoppingCart, Trash2, CheckCircle2, ShieldCheck, Download, AlertCircle, RefreshCw, FileCode, X, Eye, Coins } from 'lucide-react';
import { CardItem, UserProfile } from '../types';
import { updateUserProfile } from '../utils/dbService';

const fieldMapping: Record<string, { label: string; isMono?: boolean }> = {
  // Card Details
  fullCc: { label: 'Card Number', isMono: true },
  cardNumber: { label: 'Card Number', isMono: true },
  expDate: { label: 'Expiration Date', isMono: true },
  fullCvv: { label: 'CVV/CVV2 Code', isMono: true },
  cvv: { label: 'CVV/CVV2 Code', isMono: true },
  fullName: { label: 'Cardholder Name' },
  fullAddressStr: { label: 'Billing Address' },
  fullPhone: { label: 'Phone Number' },
  fullSsn: { label: 'SSN (Social Security)', isMono: true },
  fullDob: { label: 'Date of Birth (DOB)', isMono: true },
  fullMmn: { label: "Mother's Maiden Name (MMN)" },
  fullAtmPin: { label: 'ATM PIN', isMono: true },
  fullDriverLicense: { label: "Driver's License No." },
  fullEmail: { label: 'Secure Email Address' },
  fullEmailPassword: { label: 'Email Password', isMono: true },
  fullAccountNumber: { label: 'Bank Account Number', isMono: true },
  fullRoutingNumber: { label: 'Bank Routing Number', isMono: true },
  track1: { label: 'Track 1 Data', isMono: true },
  track2: { label: 'Track 2 Data', isMono: true },
  base: { label: 'Base / Upload Group' },

  // Banklog / Log details
  loginUsername: { label: 'Login Username/Email' },
  loginPassword: { label: 'Login Password', isMono: true },
  bankBalance: { label: 'Account Balance', isMono: true },
  bankAccountType: { label: 'Account Type' },
  bankAccessType: { label: 'Access Level/Type' },

  // CashApp Details
  cashappUsername: { label: 'Cashtag Username' },
  cashappEmail: { label: 'Linked Email' },
  cashappPhone: { label: 'Linked Phone' },
  cashappPin: { label: 'Account PIN', isMono: true },
  cashappBalance: { label: 'Cash Balance', isMono: true },

  // PayPal Details
  paypalEmail: { label: 'PayPal Email' },
  paypalPassword: { label: 'PayPal Password', isMono: true },
  paypalBalance: { label: 'PayPal Balance', isMono: true },
  paypalCookies: { label: 'Session Cookies', isMono: true },

  // RDP Details
  rdpIp: { label: 'RDP Host IP', isMono: true },
  rdpUsername: { label: 'RDP Login Username' },
  rdpPassword: { label: 'RDP Login Password', isMono: true },
  rdpCountry: { label: 'RDP Host Country' },
  rdpState: { label: 'RDP Host State' },
  rdpCity: { label: 'RDP Host City' },
  rdpOs: { label: 'Operating System' },
  rdpAccessType: { label: 'Access Privileges' },
  rdpHospeed: { label: 'Connection Speed' },
};

const renderOrderDetails = (order: any) => {
  const entries: { key: string; label: string; value: string; isMono?: boolean }[] = [];
  
  Object.entries(fieldMapping).forEach(([key, config]) => {
    const val = order[key];
    if (val !== undefined && val !== null && val !== '' && val !== false && val !== 'N/A') {
      if (key === 'cardNumber' && order.fullCc) return;
      if (key === 'cvv' && order.fullCvv) return;
      
      let displayVal = val;
      if (typeof val === 'number') {
        if (key.toLowerCase().includes('balance')) {
          displayVal = `$${val.toFixed(2)}`;
        } else {
          displayVal = val.toString();
        }
      }
      
      entries.push({
        key,
        label: config.label,
        value: displayVal.toString(),
        isMono: config.isMono,
      });
    }
  });

  return entries;
};

interface CartOrdersViewProps {
  cart: CardItem[];
  setCart: React.Dispatch<React.SetStateAction<CardItem[]>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onAddToast: (msg: string, type: 'success' | 'info') => void;
  activeTab: string;
  onCheckoutItems?: (items: any[], cost: number) => Promise<void>;
  onTestCardUpdate?: (purchaseId: string, isDead: boolean, refundAmount: number) => Promise<void>;
}

export default function CartOrdersView({
  cart,
  setCart,
  orders,
  setOrders,
  user,
  setUser,
  onAddToast,
  activeTab,
  onCheckoutItems,
  onTestCardUpdate,
}: CartOrdersViewProps) {
  // Verification states for "tester" checker
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);

  // Popup & modal states
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundsToAdd, setFundsToAdd] = useState<string>('50');
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState<any | null>(null);

  // Filters state
  const [filterDays, setFilterDays] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');

  // Computed totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleRemoveFromCart = (cardId: string) => {
    setCart(prev => prev.filter(item => item.id !== cardId));
    onAddToast('Removed item from shopping cart.', 'info');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (user.balance < cartTotal) {
      const deficit = Math.ceil(cartTotal - user.balance);
      setFundsToAdd(deficit.toString());
      setShowAddFunds(true);
      onAddToast('Insufficient balance! Please recharge your wallet.', 'info');
      return;
    }

    // Deduct balance and update crabs
    const purchasedItems: any[] = [];
    
    cart.forEach(item => {
      if (item.base === 'WHOLESALE_PACK' && item.packCount && item.packCount >= 1) {
        // Generate packCount separate individual card items!
        for (let i = 0; i < item.packCount; i++) {
          let bin = '';
          let bank = 'WHOLESALE SECURE BANK';
          let brand: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' = 'Visa';
          let selectName = '';
          let selectState = 'NY';
          let fullCc = '';
          let cvv = '';
          let fullAddressStr = '';
          let fullPhone = '';
          let fullSsn = '';
          let fullDob = '';
          let track1 = '';
          let track2 = '';

          const detailStr = item.cardsDetails && item.cardsDetails[i];
          if (detailStr) {
            const parts = detailStr.split(/[|,]/).map(s => s.trim());
            let ccNum = parts[0] || '4111111111111111';
            if (ccNum.includes('=')) {
              track2 = ccNum;
              ccNum = ccNum.split('=')[0];
            } else {
              track2 = `${ccNum}=281210100000`;
            }
            bin = ccNum.replace(/\D/g, '').substring(0, 6) || '411111';
            brand = bin.startsWith('4') ? 'Visa' : bin.startsWith('5') ? 'Mastercard' : bin.startsWith('3') ? 'Amex' : 'Discover';
            cvv = parts[2] || '123';
            selectName = parts[3] || 'John Miller';
            fullCc = ccNum.replace(/(\d{4})/g, '$1 ').trim();
            fullAddressStr = parts[6] || `742 Evergreen Terrace, New York, NY, ${parts[4] || '10001'}, ${item.country || 'US'}`;
            fullPhone = parts[7] || `+1 555-0199`;
            fullSsn = parts[4] || '000-00-0000';
            fullDob = parts[5] || '01/01/1990';
            track1 = parts[8] || `B${ccNum}^${selectName.toUpperCase().replace(/\s+/g, '/')}^281210100000`;
            if (parts[5] && parts[5].length > 4 && isNaN(Number(parts[5]))) {
              bank = parts[5].toUpperCase();
            }
          } else {
            const randomBins = ['411111', '400022', '448530', '510510', '542418', '378288', '601100'];
            bin = randomBins[Math.floor(Math.random() * randomBins.length)];
            bank = 'WHOLESALE SECURE BANK';
            brand = bin.startsWith('4') ? 'Visa' : bin.startsWith('5') ? 'Mastercard' : bin.startsWith('3') ? 'Amex' : 'Discover';
            const names = ['John Miller', 'Sarah Connor', 'Michael Scott', 'Patrick Kamande', 'Emily Davis', 'Robert Vance', 'Bruce Wayne', 'Diana Prince', 'Clark Kent', 'Selina Kyle'];
            selectName = names[Math.floor(Math.random() * names.length)];
            const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'GA', 'MI', 'WA'];
            selectState = states[Math.floor(Math.random() * states.length)];
            
            let prefix = bin;
            let ccNum = prefix;
            while (ccNum.length < 16) {
              ccNum += Math.floor(Math.random() * 10).toString();
            }
            fullCc = ccNum.replace(/(\d{4})/g, '$1 ').trim();
            cvv = (Math.floor(Math.random() * 900) + 100).toString();
            const addresses = ['742 Evergreen Terrace', '1725 Slough Avenue', '10455 Magnolia Ave', '221B Baker St', '1600 Amphitheatre Pkwy', '1007 Mountain Drive', '4 Privet Drive'];
            const selectAddr = addresses[Math.floor(Math.random() * addresses.length)];
            const cities: Record<string, string> = { CA: 'Los Angeles', NY: 'New York', TX: 'Houston', FL: 'Miami', IL: 'Chicago', GA: 'Atlanta', MI: 'Detroit', WA: 'Seattle' };
            const selectCity = cities[selectState] || 'Springfield';
            fullAddressStr = `${selectAddr}, ${selectCity}, ${selectState}, ${Math.floor(Math.random() * 90000) + 10000}, ${item.country || 'US'}`;
            fullPhone = `+1 ${Math.floor(Math.random() * 900) + 100}-555-0199`;
            fullSsn = `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
            fullDob = `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 30) + 1975}`;
            track1 = `B${ccNum}^${selectName.toUpperCase().replace(/\s+/g, '/')}^281210100000`;
            track2 = `${ccNum}=281210100000`;
          }
 
          const singleItem: any = {
            ...item,
            id: `wholesale-item-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
            bin,
            bank,
            type: brand,
            state: selectState,
            price: 0, // bundled
            category: 'cvv2',
            base: `BULK_WHOLESALE_ITEM_${i + 1}_OF_${item.packCount}`,
            purchaseId: `ord-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
            purchaseDate: new Date().toLocaleString(),
            purchaseTimestamp: Date.now(),
            revealed: false,
            tested: 'untested',
            fullCc,
            fullCvv: cvv,
            fullName: selectName,
            fullAddressStr,
            fullPhone,
            fullSsn,
            fullDob,
            track1,
            track2,
          };
          purchasedItems.push(singleItem);
        }
      } else {
        const orderObj: any = {
          ...item,
          purchaseId: `ord-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          purchaseDate: new Date().toLocaleString(),
          purchaseTimestamp: Date.now(),
          revealed: false,
          tested: 'untested', // 'untested' | 'valid' | 'dead'
        };

        // Ensure exact keys are mapped for rendering from the admin-uploaded details ONLY IF they are filled out
        if (item.cardNumber) {
          orderObj.fullCc = item.cardNumber;
        } else if (item.id && String(item.id).startsWith('card-')) {
          // Fallback realistic credentials ONLY for the mock demo cards to make sure they look complete on checkout
          let prefix = item.bin;
          let ccNum = prefix;
          while (ccNum.length < 16) {
            ccNum += Math.floor(Math.random() * 10).toString();
          }
          orderObj.fullCc = ccNum.replace(/(\d{4})/g, '$1 ').trim();
        }

        if (item.cvv) {
          orderObj.fullCvv = item.cvv;
        } else if (item.id && String(item.id).startsWith('card-')) {
          orderObj.fullCvv = (Math.floor(Math.random() * 900) + 100).toString();
        }

        if (item.fullName) {
          orderObj.fullName = item.fullName;
        } else if (item.id && String(item.id).startsWith('card-')) {
          const names = ['John Miller', 'Sarah Connor', 'Michael Scott', 'Patrick Kamande', 'Emily Davis', 'Robert Vance'];
          orderObj.fullName = names[Math.floor(Math.random() * names.length)];
        }

        if (item.fullAddressStr) {
          orderObj.fullAddressStr = item.fullAddressStr;
        } else if (item.id && String(item.id).startsWith('card-')) {
          const addresses = ['742 Evergreen Terrace', '1725 Slough Avenue', '10455 Magnolia Ave', '221B Baker St', '1600 Amphitheatre Pkwy'];
          const selectAddr = addresses[Math.floor(Math.random() * addresses.length)];
          const cities: Record<string, string> = { CA: 'Los Angeles', NY: 'New York', TX: 'Houston', FL: 'Miami', ON: 'Toronto', LND: 'London' };
          const selectCity = cities[item.state] || 'Springfield';
          orderObj.fullAddressStr = `${selectAddr}, ${selectCity}, ${item.state}, ${item.zip}, ${item.country}`;
        }

        if (item.fullPhone) {
          orderObj.fullPhone = item.fullPhone;
        } else if (item.id && String(item.id).startsWith('card-') && item.phone) {
          orderObj.fullPhone = `+1 ${Math.floor(Math.random() * 900) + 100}-555-0199`;
        }

        if (item.fullSsn) {
          orderObj.fullSsn = item.fullSsn;
        } else if (item.id && String(item.id).startsWith('card-') && item.ssn) {
          orderObj.fullSsn = `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
        }

        if (item.fullDob) {
          orderObj.fullDob = item.fullDob;
        } else if (item.id && String(item.id).startsWith('card-') && item.dob) {
          orderObj.fullDob = `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 30) + 1975}`;
        }

        if (item.fullMmn) {
          orderObj.fullMmn = item.fullMmn;
        }

        if (item.fullAtmPin) {
          orderObj.fullAtmPin = item.fullAtmPin;
        }

        if (item.fullDriverLicense) {
          orderObj.fullDriverLicense = item.fullDriverLicense;
        }

        if (item.fullEmail) {
          orderObj.fullEmail = item.fullEmail;
        }

        if (item.fullEmailPassword) {
          orderObj.fullEmailPassword = item.fullEmailPassword;
        }

        if (item.fullAccountNumber) {
          orderObj.fullAccountNumber = item.fullAccountNumber;
        }

        if (item.fullRoutingNumber) {
          orderObj.fullRoutingNumber = item.fullRoutingNumber;
        }

        if (item.track1) {
          orderObj.track1 = item.track1;
        } else if (item.id && String(item.id).startsWith('card-') && !orderObj.withoutCvv2) {
          orderObj.track1 = `B${(orderObj.fullCc || '').replace(/\s+/g, '')}^${(orderObj.fullName || 'HOLDER').toUpperCase().replace(/\s+/g, '/')}^${(orderObj.expDate || '12/28').replace('/', '')}10100000`;
        }

        if (item.track2) {
          orderObj.track2 = item.track2;
        } else if (item.id && String(item.id).startsWith('card-') && !orderObj.withoutCvv2) {
          orderObj.track2 = `${(orderObj.fullCc || '').replace(/\s+/g, '')}=${(orderObj.expDate || '12/28').replace('/', '')}10100000`;
        }

        purchasedItems.push(orderObj);
      }
    });

    setUser(prev => ({
      ...prev,
      balance: prev.balance - cartTotal,
      crabRating: prev.crabRating + cart.length * 10,
    }));

    if (onCheckoutItems) {
      onCheckoutItems(purchasedItems, cartTotal);
    }

    setOrders(prev => [...purchasedItems, ...prev]);
    setCart([]);
    onAddToast(`Purchase successful! Added ${purchasedItems.length} items to your Orders.`, 'success');
  };

  const handleCartAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundsToAdd);
    if (isNaN(amount) || amount <= 0) {
      onAddToast('Please enter a valid amount to recharge.', 'info');
      return;
    }

    try {
      const newBalance = user.balance + amount;
      await updateUserProfile(user.email, { balance: newBalance });
      setUser(prev => ({
        ...prev,
        balance: newBalance
      }));
      onAddToast(`Wallet recharged successfully! Added $${amount.toFixed(2)} to your balance.`, 'success');
      setShowAddFunds(false);
    } catch (err) {
      console.error(err);
      onAddToast('Failed to recharge balance.', 'info');
    }
  };

  const handleToggleReveal = (purchaseId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.purchaseId === purchaseId) {
        return { ...o, revealed: !o.revealed };
      }
      return o;
    }));
  };

  const handleTestCard = (purchaseId: string) => {
    const order = orders.find(o => o.purchaseId === purchaseId);
    if (!order) return;

    setCheckingOrderId(purchaseId);
    onAddToast(`Connecting tester API for card BIN ${order.bin}...`, 'info');

    setTimeout(() => {
      setCheckingOrderId(null);
      // 70% chance of being "Valid", 30% chance of "Dead" to trigger refund simulation!
      const isDead = Math.random() < 0.3;

      setOrders(prev => prev.map(o => {
        if (o.purchaseId === purchaseId) {
          const outcome = isDead ? 'dead' : 'valid';
          if (isDead) {
            setUser(u => ({
              ...u,
              balance: u.balance + o.price,
              crabRating: Math.max(0, u.crabRating - 5), // small correction
            }));
            onAddToast(`❌ Card tested DEAD. ${o.price.toFixed(2)} refunded to your balance!`, 'info');
            if (onTestCardUpdate) {
              onTestCardUpdate(purchaseId, true, o.price);
            }
          } else {
            onAddToast(`✅ Card tested VALID! Ready for diagnostic usage.`, 'success');
            if (onTestCardUpdate) {
              onTestCardUpdate(purchaseId, false, 0);
            }
          }
          return { ...o, tested: outcome, revealed: true };
        }
        return o;
      }));
    }, 1500);
  };

  const handleDownloadTxt = (order: any) => {
    let dump = '';
    if (order.category === 'banklogs') {
      dump = `=== BANK LOG PURCHASE ===\r\nBank Name: ${order.bank || ''}\r\nAccount Type: ${order.bankAccountType || ''}\r\nAccess Type: ${order.bankAccessType || ''}\r\nBalance: $${order.bankBalance || 0}\r\nUsername: ${order.loginUsername || ''}\r\nPassword: ${order.loginPassword || ''}\r\nCountry/State: ${order.country || ''}/${order.state || ''}\r\nBase: ${order.base || ''}`;
    } else if (order.category === 'cashapp') {
      dump = `=== CASHAPP PURCHASE ===\r\nUsername: ${order.cashappUsername || ''}\r\nEmail: ${order.cashappEmail || ''}\r\nPhone: ${order.cashappPhone || ''}\r\nPIN: ${order.cashappPin || ''}\r\nBalance: $${order.cashappBalance || 0}\r\nBase: ${order.base || ''}`;
    } else if (order.category === 'paypal') {
      dump = `=== PAYPAL PURCHASE ===\r\nEmail: ${order.paypalEmail || ''}\r\nPassword: ${order.paypalPassword || ''}\r\nCookies: ${order.paypalCookies || ''}\r\nBalance: $${order.paypalBalance || 0}\r\nBase: ${order.base || ''}`;
    } else if (order.category === 'rdp') {
      dump = `=== RDP PURCHASE ===\r\nHost IP: ${order.rdpIp || ''}\r\nUsername: ${order.rdpUsername || ''}\r\nPassword: ${order.rdpPassword || ''}\r\nLocation: ${order.rdpCity || ''}, ${order.rdpState || ''}, ${order.rdpCountry || ''}\r\nOS: ${order.rdpOs || ''}\r\nAccess Type: ${order.rdpAccessType || ''}\r\nSpeed: ${order.rdpHospeed || ''}\r\nBase: ${order.base || ''}`;
    } else {
      let cardLines = [];
      cardLines.push(`=== SECURE CARD/PRODUCT DETAILS ===`);
      if (order.category) cardLines.push(`Category: ${order.category.toUpperCase()}`);
      if (order.bin) cardLines.push(`BIN: ${order.bin}`);
      if (order.fullCc || order.cardNumber) cardLines.push(`Card Number: ${order.fullCc || order.cardNumber}`);
      if (order.expDate) cardLines.push(`Exp Date: ${order.expDate}`);
      if (order.fullCvv || order.cvv) cardLines.push(`CVV: ${order.fullCvv || order.cvv}`);
      if (order.fullName) cardLines.push(`Full Name: ${order.fullName}`);
      if (order.fullAddressStr) cardLines.push(`Billing Address: ${order.fullAddressStr}`);
      if (order.fullPhone) cardLines.push(`Phone Number: ${order.fullPhone}`);
      if (order.fullSsn) {
        cardLines.push(`SSN: ${order.fullSsn}`);
      } else if (order.ssn) {
        cardLines.push(`SSN Info: Included`);
      }
      if (order.fullDob) {
        cardLines.push(`DOB: ${order.fullDob}`);
      } else if (order.dob) {
        cardLines.push(`DOB Info: Included`);
      }
      if (order.fullMmn) cardLines.push(`Mother's Maiden Name (MMN): ${order.fullMmn}`);
      if (order.fullAtmPin) cardLines.push(`ATM PIN: ${order.fullAtmPin}`);
      if (order.fullDriverLicense) cardLines.push(`Driver's License: ${order.fullDriverLicense}`);
      if (order.fullEmail) cardLines.push(`Email: ${order.fullEmail}`);
      if (order.fullEmailPassword) cardLines.push(`Email Password: ${order.fullEmailPassword}`);
      if (order.fullAccountNumber) cardLines.push(`Bank Account Number: ${order.fullAccountNumber}`);
      if (order.fullRoutingNumber) cardLines.push(`Bank Routing Number: ${order.fullRoutingNumber}`);
      if (order.track1) cardLines.push(`Track 1: ${order.track1}`);
      if (order.track2) cardLines.push(`Track 2: ${order.track2}`);
      if (order.base) cardLines.push(`Base Group: ${order.base}`);
      
      if (order.fullCc) {
        const rawPipe = `${(order.fullCc || '').replace(/\s+/g, '')}|${(order.expDate || '').replace('/', '|')}|${order.fullCvv || ''}|${order.fullName || ''}|${order.fullAddressStr || ''}|${order.fullPhone || ''}`;
        cardLines.push(`\r\n=== RAW PIPE DUMP ===\r\n${rawPipe}`);
      }
      dump = cardLines.join('\r\n');
    }

    const element = document.createElement('a');
    const file = new Blob([dump], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Protocol_${order.bin || 'PRODUCT'}_${order.purchaseId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onAddToast('Downloaded purchased item credentials pack!', 'success');
  };

  if (activeTab === 'cart') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs text-xs flex flex-col gap-4">
        <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#0c5460]" /> Shopping Cart ({cart.length} items)
        </h2>

        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">
            Your shopping cart is currently empty. Go to CVV2 or Dumps to add items!
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-5">
            {/* List */}
            <div className="w-full md:w-[70%] border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-bold text-[10px] uppercase">
                    <th className="p-3">BIN</th>
                    <th className="p-3">Origin / State</th>
                    <th className="p-3">Type Level</th>
                    <th className="p-3 font-mono">Price</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {cart.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono font-bold text-gray-900">{item.bin}</td>
                      <td className="p-3">
                        <span>{item.country}</span> ({item.state})
                      </td>
                      <td className="p-3 font-medium">
                        {item.type} {item.subtype} ({item.creditDebit})
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800">${item.price.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                          title="Remove from Cart"
                        >
                          <Trash2 className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total / Checkout */}
            <div className="w-full md:w-[30%] bg-gray-50 border border-gray-200 rounded p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-gray-950 uppercase border-b pb-1.5 mb-3 text-[11px]">Checkout Details</h3>
                <div className="flex flex-col gap-2 font-medium text-gray-600 border-b pb-3 mb-3 leading-loose">
                  <div className="flex justify-between">
                    <span>Cart Volume:</span>
                    <span className="font-bold text-gray-800">{cart.length} cards</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet Balance:</span>
                    <span className="font-bold text-[#0c5460] font-mono">${user.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount Multipliers:</span>
                    <span className="text-gray-400 font-bold">NONE</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-5">
                  <span className="font-bold text-gray-800 uppercase">Grand Total:</span>
                  <span className="font-mono font-black text-lg text-emerald-800">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#0c5460] hover:opacity-95 text-white font-extrabold py-2.5 rounded border border-[#0c5460] text-center cursor-pointer uppercase tracking-wider transition-all"
              >
                Simulate Secure Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // orders tab
  const getOrderTime = (order: any) => {
    if (order.purchaseTimestamp) return order.purchaseTimestamp;
    if (order.timestamp) {
      const parsed = new Date(order.timestamp).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    if (order.purchaseDate) {
      const parsed = new Date(order.purchaseDate).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return Date.now();
  };

  const filteredOrders = orders.filter(order => {
    // 1. Filter by category
    if (filterProduct !== 'all') {
      const category = order.category || (order.withoutCvv2 ? 'dumps' : (order.ssn || order.dob ? 'fullz' : 'cvv2'));
      if (category !== filterProduct) return false;
    }

    // 2. Filter by days
    if (filterDays !== 'all') {
      const orderTime = getOrderTime(order);
      const diffMs = Date.now() - orderTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      const maxDays = parseFloat(filterDays);
      if (!isNaN(maxDays) && diffDays > maxDays) return false;
    }

    return true;
  });

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs text-xs flex flex-col gap-4">
      <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Purchased Cards ({orders.length} inventory)
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-medium">
          You have not purchased any cards yet. Completed items in your checkout are saved here.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {/* Dynamic Filters Row */}
          <div className="bg-gray-50 border border-gray-200 p-3 rounded flex flex-col sm:flex-row gap-3 items-center justify-between text-xs select-none">
            <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-gray-700 uppercase text-[10px]">Date Purchased:</span>
                <select
                  value={filterDays}
                  onChange={e => setFilterDays(e.target.value)}
                  className="border border-gray-300 rounded p-1 bg-white text-[11px] font-bold text-gray-800 focus:outline-none focus:border-blue-400"
                >
                  <option value="all">All Days</option>
                  <option value="1">Last 24 Hours</option>
                  <option value="3">Last 3 Days</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-gray-700 uppercase text-[10px]">Product Bought:</span>
                <select
                  value={filterProduct}
                  onChange={e => setFilterProduct(e.target.value)}
                  className="border border-gray-300 rounded p-1 bg-white text-[11px] font-bold text-gray-800 focus:outline-none focus:border-blue-400"
                >
                  <option value="all">All Products</option>
                  <option value="cvv2">CVV2 Cards</option>
                  <option value="dumps">Dumps Track 1/2</option>
                  <option value="fullz">Fullz Profiles</option>
                  <option value="banklogs">Bank Logs</option>
                  <option value="cashapp">CashApp Accounts</option>
                  <option value="paypal">PayPal Logs</option>
                  <option value="rdp">RDP Servers</option>
                </select>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 font-extrabold uppercase shrink-0">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium border border-dashed rounded bg-gray-50">
              No orders found matching the selected filters.
            </div>
          ) : (
            filteredOrders.map(order => {
              const hasTester = order.onlyRefundable;
              const isUntested = order.tested === 'untested';
              const isValid = order.tested === 'valid';
              const isDead = order.tested === 'dead';

              return (
                <div
                  key={order.purchaseId}
                  className={`border rounded p-4 flex flex-col gap-3 relative overflow-hidden transition-all ${
                    isDead
                      ? 'border-red-200 bg-red-50/20 opacity-70'
                      : isValid
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-gray-200 bg-gray-50/20'
                  }`}
                >
                  {/* Status Indicator Tag */}
                  <div className="flex justify-between items-start border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 font-mono">BIN {order.bin || 'N/A'}</span>
                      <span className="text-gray-400 font-medium text-[10px]">Purchased: {order.purchaseDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasTester && (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                          Refundable Tester Covered
                        </span>
                      )}
                      {isDead ? (
                        <span className="bg-red-100 text-red-800 border border-red-200 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                          DEAD (REFUNDED)
                        </span>
                      ) : isValid ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                          VALID
                        </span>
                      ) : (
                        <span className="bg-gray-100 border text-gray-600 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                          UNCHECKED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card diagnostic parameters */}
                  <div className="text-[11px] font-medium leading-relaxed">
                    {!order.revealed || isDead ? (
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-sm italic text-gray-400 text-center select-none">
                        Credentials are encrypted. Click <span className="font-bold text-gray-600">"Reveal Credentials"</span> below or <span className="font-bold text-sky-600">"View Details"</span> to decrypt the security keys.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {renderOrderDetails(order).length === 0 ? (
                          <div className="md:col-span-3 text-center py-4 bg-gray-50 border border-gray-150 rounded text-gray-400 italic">
                            No additional credentials uploaded for this record by the administrator.
                          </div>
                        ) : (
                          renderOrderDetails(order).map((field) => (
                            <div key={field.key} className="bg-gray-50/50 border border-gray-200 p-2 rounded flex flex-col gap-0.5 select-all">
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                                {field.label}
                              </span>
                              {field.key === 'paypalCookies' ? (
                                <span className="font-mono text-[10px] font-semibold truncate text-gray-900" title={field.value}>
                                  {field.value.substring(0, 30)}...
                                </span>
                              ) : (
                                <span className={`text-[11px] font-bold text-gray-900 ${field.isMono ? 'font-mono' : ''}`}>
                                  {field.value}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleReveal(order.purchaseId)}
                        disabled={isDead}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold px-3 py-1.5 border rounded cursor-pointer text-[10px] uppercase"
                      >
                        {order.revealed && !isDead ? 'Hide Credentials' : 'Reveal Credentials'}
                      </button>

                      <button
                        onClick={() => {
                          if (!order.revealed) {
                            setOrders(prev => prev.map(o => {
                              if (o.purchaseId === order.purchaseId) {
                                return { ...o, revealed: true };
                              }
                              return o;
                            }));
                          }
                          setSelectedDetailsOrder(order);
                        }}
                        disabled={isDead}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold px-3 py-1.5 border border-sky-200 rounded cursor-pointer text-[10px] uppercase flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>

                      {!isDead && (
                        <button
                          onClick={() => handleDownloadTxt(order)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border rounded px-3 py-1.5 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                          title="Download product details inside a TXT file"
                        >
                          <Download className="w-3.5 h-3.5 text-gray-500" /> Download TXT
                        </button>
                      )}

                      {order.revealed && !isDead && (
                        <button
                          onClick={() => {
                            const dump = order.category === 'banklogs'
                              ? `Username: ${order.loginUsername || ''} | Password: ${order.loginPassword || ''}`
                              : order.category === 'cashapp'
                              ? `Username: ${order.cashappUsername || ''} | PIN: ${order.cashappPin || ''}`
                              : order.category === 'paypal'
                              ? `Email: ${order.paypalEmail || ''} | Password: ${order.paypalPassword || ''}`
                              : order.category === 'rdp'
                              ? `IP: ${order.rdpIp || ''} | Username: ${order.rdpUsername || ''} | Password: ${order.rdpPassword || ''}`
                              : order.withoutCvv2
                              ? `${order.track1 || ''}|${order.track2 || ''}`
                              : `${order.fullCc.replace(/\s+/g, '')}|${order.expDate.replace('/', '|')}|${order.fullCvv}|${order.fullName}|${order.fullAddressStr}`;
                            navigator.clipboard.writeText(dump);
                            onAddToast('Copied credentials to clipboard!', 'success');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border rounded px-3 py-1.5 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                        >
                          <FileCode className="w-3.5 h-3.5 text-gray-500" /> Copy Dump
                        </button>
                      )}
                    </div>

                    {hasTester && isUntested && !isDead && (
                      <div>
                        {checkingOrderId === order.purchaseId ? (
                          <div className="flex items-center gap-1.5 text-gray-500 py-1 font-bold">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0c5460]" />
                            <span>Contacting diagnostic tester API...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleTestCard(order.purchaseId)}
                            className="bg-[#bee5eb] hover:bg-sky-200 text-gray-950 font-black px-4 py-1.5 border border-[#0c5460] rounded cursor-pointer uppercase text-[10px]"
                          >
                            Verify Validity (Test Card)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ADD FUNDS INSUFFICIENT BALANCE POPUP */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-200">
            <div className="bg-amber-600 text-white px-4 py-3 flex justify-between items-center border-b border-amber-200 font-bold text-sm uppercase">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 animate-bounce" /> Insufficient Balance
              </span>
              <button onClick={() => setShowAddFunds(false)} className="hover:opacity-85 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCartAddFunds} className="p-5 flex flex-col gap-4 text-gray-700">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded text-amber-900 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Your balance is too low for checkout! Please add funds below.</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-2.5 rounded border border-gray-200 font-bold text-gray-800">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase">Cart Total</p>
                  <p className="text-gray-900">${cartTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase">Wallet</p>
                  <p className="text-gray-900">${user.balance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase">Required</p>
                  <p className="text-amber-700">${Math.max(0, cartTotal - user.balance).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-gray-800">Recharge Amount (USD) *</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={fundsToAdd}
                    onChange={e => setFundsToAdd(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 pl-6 focus:outline-none focus:border-amber-500 font-bold font-mono text-gray-900"
                    placeholder="e.g. 50"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFundsToAdd(Math.ceil(cartTotal - user.balance).toString())}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 rounded transition-all cursor-pointer text-[10px] text-center border"
                >
                  Deficit (${Math.ceil(cartTotal - user.balance)})
                </button>
                <button
                  type="button"
                  onClick={() => setFundsToAdd('50')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 rounded transition-all cursor-pointer text-[10px] text-center border"
                >
                  $50.00
                </button>
                <button
                  type="button"
                  onClick={() => setFundsToAdd('100')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 rounded transition-all cursor-pointer text-[10px] text-center border"
                >
                  $100.00
                </button>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 rounded transition-all cursor-pointer border uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition-all cursor-pointer border border-emerald-600 shadow uppercase text-xs"
                >
                  Add Funds & Buy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED ORDER VIEW MODAL */}
      {selectedDetailsOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center font-bold text-sm border-b border-gray-700 uppercase">
              <span className="flex items-center gap-1.5">
                🎁 Purchased Product Details
              </span>
              <button onClick={() => setSelectedDetailsOrder(null)} className="hover:opacity-85 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4 text-gray-700 max-h-[80vh] overflow-y-auto">
              <div className="bg-gray-50 border border-gray-200 p-3 rounded flex flex-col gap-1 text-[11px]">
                <p><span className="font-bold text-gray-500 font-sans">Purchase ID:</span> <span className="font-mono text-gray-900 font-semibold">{selectedDetailsOrder.purchaseId}</span></p>
                <p><span className="font-bold text-gray-500 font-sans">Date Ordered:</span> <span className="text-gray-900 font-semibold">{selectedDetailsOrder.purchaseDate}</span></p>
                <p><span className="font-bold text-gray-500 font-sans">Category:</span> <span className="text-gray-900 font-bold uppercase text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded ml-1 font-sans">{selectedDetailsOrder.category || 'card'}</span></p>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="font-extrabold border-b pb-1 text-gray-800 uppercase tracking-wide flex items-center gap-1">
                  🔑 Credentials & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {renderOrderDetails(selectedDetailsOrder).map((field) => (
                    <div key={field.key} className="bg-gray-50 p-2.5 rounded border border-gray-200 flex flex-col gap-1 select-all">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                        {field.label}
                      </span>
                      {field.key === 'paypalCookies' ? (
                        <textarea
                          readOnly
                          value={field.value}
                          className="w-full h-24 font-mono bg-white border border-gray-200 p-2 rounded text-[10px] resize-none select-all font-semibold mt-1"
                        />
                      ) : (
                        <span className={`text-[12px] font-bold text-gray-950 select-all ${field.isMono ? 'font-mono' : ''}`}>
                          {field.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 mt-4 border-t pt-3">
                <button
                  type="button"
                  onClick={() => handleDownloadTxt(selectedDetailsOrder)}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded transition-all cursor-pointer border border-sky-600 shadow uppercase text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download TXT File
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDetailsOrder(null)}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 rounded transition-all cursor-pointer border uppercase text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
