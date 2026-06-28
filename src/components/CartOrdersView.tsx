import React, { useState } from 'react';
import { ShoppingCart, Trash2, CheckCircle2, ShieldCheck, Download, AlertCircle, RefreshCw, FileCode, X, Eye, Coins } from 'lucide-react';
import { CardItem, UserProfile } from '../types';
import { updateUserProfile } from '../utils/dbService';

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
    const purchasedItems = cart.map(item => {
      // Generate realistic carding mock credentials
      let prefix = item.bin;
      let ccNum = prefix;
      while (ccNum.length < 16) {
        ccNum += Math.floor(Math.random() * 10).toString();
      }
      const formattedNum = item.cardNumber || ccNum.replace(/(\d{4})/g, '$1 ').trim();
      const cvv = item.cvv || (Math.floor(Math.random() * 900) + 100).toString();
      const names = ['John Miller', 'Sarah Connor', 'Michael Scott', 'Patrick Kamande', 'Emily Davis', 'Robert Vance'];
      const addresses = ['742 Evergreen Terrace', '1725 Slough Avenue', '10455 Magnolia Ave', '221B Baker St', '1600 Amphitheatre Pkwy'];
      
      const selectName = item.fullName || names[Math.floor(Math.random() * names.length)];
      const selectAddr = addresses[Math.floor(Math.random() * addresses.length)];
      const cities: Record<string, string> = { CA: 'Los Angeles', NY: 'New York', TX: 'Houston', FL: 'Miami', ON: 'Toronto', LND: 'London' };
      const selectCity = cities[item.state] || 'Springfield';
      const addressString = item.fullAddressStr || `${selectAddr}, ${selectCity}, ${item.state}, ${item.zip}, ${item.country}`;
      const phoneString = item.fullPhone || `+1 ${Math.floor(Math.random() * 900) + 100}-555-0199`;

      const genSsn = item.fullSsn || (item.ssn ? `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}` : null);
      const genDob = item.fullDob || (item.dob ? `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 30) + 1975}` : null);

      const t1 = item.track1 || `B${formattedNum.replace(/\s+/g, '')}^${selectName.toUpperCase().replace(/\s+/g, '/')}^${item.expDate.replace('/', '')}10100000`;
      const t2 = item.track2 || `${formattedNum.replace(/\s+/g, '')}=${item.expDate.replace('/', '')}10100000`;

      return {
        ...item,
        purchaseId: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        purchaseDate: new Date().toLocaleString(),
        revealed: false,
        tested: 'untested', // 'untested' | 'valid' | 'dead'
        fullCc: formattedNum,
        fullCvv: cvv,
        fullName: selectName,
        fullAddressStr: addressString,
        fullPhone: phoneString,
        fullSsn: genSsn,
        fullDob: genDob,
        track1: t1,
        track2: t2,
      };
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
      dump = order.withoutCvv2
        ? `TRACK1: ${order.track1 || ''}\r\nTRACK2: ${order.track2 || ''}\r\nEXP: ${order.expDate || ''}`
        : `${order.fullCc ? order.fullCc.replace(/\s+/g, '') : ''}|${order.expDate ? order.expDate.replace('/', '|') : ''}|${order.fullCvv || ''}|${order.fullName || ''}|${order.fullAddressStr || ''}|${order.fullPhone || ''}`;
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
  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs text-xs flex flex-col gap-4">
      <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Purchased Sandbox Cards ({orders.length} inventory)
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-medium">
          You have not purchased any cards yet. Completed items in your checkout are saved here.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {orders.map(order => {
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
                    <span className="font-extrabold text-gray-900 font-mono">BIN {order.bin}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] font-medium text-gray-600 leading-relaxed">
                  <div>
                    <p className="font-bold text-gray-400 uppercase text-[9px] mb-1">Secure CC details</p>
                    {order.revealed && !isDead ? (
                      <div className="flex flex-col gap-1 select-all font-mono">
                        {order.withoutCvv2 ? (
                          <>
                            <p className="truncate" title={order.track1}><span className="text-gray-400 text-[10px]">Track1:</span> <span className="font-bold text-gray-900 text-[10px]">{order.track1}</span></p>
                            <p className="truncate" title={order.track2}><span className="text-gray-400 text-[10px]">Track2:</span> <span className="font-bold text-gray-900 text-[10px]">{order.track2}</span></p>
                            <p><span className="text-gray-400 text-[10px]">Exp:</span> <span className="font-bold text-gray-900 text-[10px]">{order.expDate}</span></p>
                          </>
                        ) : (
                          <>
                            <p><span className="text-gray-400">Card:</span> <span className="font-bold text-gray-900">{order.fullCc}</span></p>
                            <p><span className="text-gray-400">Exp:</span> <span className="font-bold text-gray-900">{order.expDate}</span></p>
                            <p><span className="text-gray-400">CVV:</span> <span className="font-bold text-gray-900">{order.fullCvv}</span></p>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="italic text-gray-400">Details are hidden. Click "Reveal" below to decode.</p>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-gray-400 uppercase text-[9px] mb-1">Billing holder info</p>
                    {order.revealed && !isDead ? (
                      <div className="flex flex-col gap-1 select-all">
                        <p><span className="text-gray-400">Name:</span> <span className="font-bold text-gray-900">{order.fullName}</span></p>
                        <p className="truncate" title={order.fullAddressStr}><span className="text-gray-400">Addr:</span> <span className="font-bold text-gray-900">{order.fullAddressStr}</span></p>
                        <p><span className="text-gray-400">Phone:</span> <span className="font-bold text-gray-900">{order.fullPhone}</span></p>
                      </div>
                    ) : (
                      <p className="italic text-gray-400">Billing details hidden.</p>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-gray-400 uppercase text-[9px] mb-1">Diagnostic items</p>
                    {order.revealed && !isDead ? (
                      <div className="flex flex-col gap-1">
                        <p><span className="text-gray-400">Bank:</span> <span className="font-semibold text-gray-700">{order.bank}</span></p>
                        <p><span className="text-gray-400">SSN:</span> <span className="font-mono text-gray-900 font-bold">{order.fullSsn || 'NOT INCLUDED'}</span></p>
                        <p><span className="text-gray-400">DOB:</span> <span className="font-mono text-gray-900 font-bold">{order.fullDob || 'NOT INCLUDED'}</span></p>
                      </div>
                    ) : (
                      <p className="italic text-gray-400">Diagnostic variables hidden.</p>
                    )}
                  </div>
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
          })}
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

              {selectedDetailsOrder.category === 'banklogs' ? (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-1 text-gray-800 uppercase tracking-wide">🏦 Bank Log Credentials</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Bank Name</p>
                      <p className="font-extrabold text-gray-900">{selectedDetailsOrder.bank}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Account Balance</p>
                      <p className="font-extrabold text-emerald-700">${selectedDetailsOrder.bankBalance || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Account Type</p>
                      <p className="font-bold text-gray-900">{selectedDetailsOrder.bankAccountType || 'Checking'}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Access Type</p>
                      <p className="font-bold text-gray-900">{selectedDetailsOrder.bankAccessType || 'Online Login'}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded flex flex-col gap-2 font-mono">
                    <p className="font-bold text-amber-900 text-[10px]">🔒 Login Credentials:</p>
                    <div className="flex justify-between items-center bg-white p-1.5 rounded border border-amber-100 text-[11px]">
                      <span>Username: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.loginUsername || 'N/A'}</span></span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-1.5 rounded border border-amber-100 text-[11px]">
                      <span>Password: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.loginPassword || 'N/A'}</span></span>
                    </div>
                  </div>
                </div>
              ) : selectedDetailsOrder.category === 'cashapp' ? (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-1 text-gray-800 uppercase tracking-wide">💸 CashApp Account Credentials</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Username ($Cashtag)</p>
                      <p className="font-extrabold text-gray-900">{selectedDetailsOrder.cashappUsername}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Balance</p>
                      <p className="font-extrabold text-emerald-700">${selectedDetailsOrder.cashappBalance || 0}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded flex flex-col gap-2 font-mono">
                    <p className="font-bold text-emerald-900 text-[10px]">🔒 Secure Credentials:</p>
                    <p>Email: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.cashappEmail || 'N/A'}</span></p>
                    <p>Phone: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.cashappPhone || 'N/A'}</span></p>
                    <p>PIN: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.cashappPin || 'N/A'}</span></p>
                  </div>
                </div>
              ) : selectedDetailsOrder.category === 'paypal' ? (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-1 text-gray-800 uppercase tracking-wide">💸 PayPal Log Credentials</h4>
                  <div className="bg-gray-50 p-2 rounded border">
                    <p className="font-bold text-gray-400 uppercase text-[9px]">Paypal Balance</p>
                    <p className="font-extrabold text-emerald-700 text-sm">${selectedDetailsOrder.paypalBalance || 0}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded flex flex-col gap-2 font-mono">
                    <p className="font-bold text-amber-900 text-[10px]">🔒 Login Details:</p>
                    <p>Email/Username: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.paypalEmail || 'N/A'}</span></p>
                    <p>Password: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.paypalPassword || 'N/A'}</span></p>
                  </div>
                  {selectedDetailsOrder.paypalCookies && (
                    <div className="flex flex-col gap-1">
                      <p className="font-bold text-gray-500 uppercase text-[9px]">Cookies Session Code</p>
                      <textarea
                        readOnly
                        value={selectedDetailsOrder.paypalCookies}
                        className="w-full h-24 font-mono bg-gray-50 border p-2 rounded text-[10px] resize-none select-all font-semibold"
                      />
                    </div>
                  )}
                </div>
              ) : selectedDetailsOrder.category === 'rdp' ? (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-1 text-gray-800 uppercase tracking-wide">🖥️ RDP Server Credentials</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">IP / Address</p>
                      <p className="font-extrabold text-gray-900 font-mono">{selectedDetailsOrder.rdpIp}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Location</p>
                      <p className="font-bold text-gray-900">{selectedDetailsOrder.rdpCity || 'Chicago'}, {selectedDetailsOrder.rdpState || 'IL'}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Operating System</p>
                      <p className="font-bold text-gray-900">{selectedDetailsOrder.rdpOs || 'Windows 10'}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Access Type</p>
                      <p className="font-bold text-gray-900">{selectedDetailsOrder.rdpAccessType || 'Admin'}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded flex flex-col gap-2 font-mono">
                    <p className="font-bold text-blue-900 text-[10px]">🔒 Login Details:</p>
                    <p>Username: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.rdpUsername || 'Administrator'}</span></p>
                    <p>Password: <span className="font-bold text-gray-900 select-all">{selectedDetailsOrder.rdpPassword || 'N/A'}</span></p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold border-b pb-1 text-gray-800 uppercase tracking-wide">💳 Credit Card Credentials</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-bold text-gray-400 uppercase text-[9px]">Card Number</p>
                      <p className="font-extrabold text-gray-900 font-mono">{selectedDetailsOrder.fullCc}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border grid grid-cols-2 gap-1">
                      <div>
                        <p className="font-bold text-gray-400 uppercase text-[9px]">Exp Date</p>
                        <p className="font-bold text-gray-900 font-mono">{selectedDetailsOrder.expDate}</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-400 uppercase text-[9px]">CVV Code</p>
                        <p className="font-bold text-gray-900 font-mono">{selectedDetailsOrder.fullCvv}</p>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold border-b pb-1 text-gray-800 uppercase tracking-wide mt-2">👤 Billing Cardholder Info</h4>
                  <div className="bg-gray-50 p-3 rounded border flex flex-col gap-2">
                    <p><span className="font-bold text-gray-400 uppercase text-[9px]">Full Name:</span> <span className="font-bold text-gray-900">{selectedDetailsOrder.fullName}</span></p>
                    <p><span className="font-bold text-gray-400 uppercase text-[9px]">Billing Address:</span> <span className="font-bold text-gray-900">{selectedDetailsOrder.fullAddressStr}</span></p>
                    <p><span className="font-bold text-gray-400 uppercase text-[9px]">Phone Number:</span> <span className="font-bold text-gray-900">{selectedDetailsOrder.fullPhone}</span></p>
                  </div>

                  {(selectedDetailsOrder.fullSsn || selectedDetailsOrder.fullDob) && (
                    <>
                      <h4 className="font-bold border-b pb-1 text-gray-800 uppercase tracking-wide mt-2 font-sans">🔍 Additional SSN/DOB Details</h4>
                      <div className="bg-gray-50 p-3 rounded border flex flex-col gap-2 font-mono">
                        {selectedDetailsOrder.fullSsn && <p><span className="font-bold text-gray-400 uppercase text-[9px]">SSN:</span> <span className="font-bold text-gray-950">{selectedDetailsOrder.fullSsn}</span></p>}
                        {selectedDetailsOrder.fullDob && <p><span className="font-bold text-gray-400 uppercase text-[9px]">DOB:</span> <span className="font-bold text-gray-950">{selectedDetailsOrder.fullDob}</span></p>}
                      </div>
                    </>
                  )}
                </div>
              )}

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
