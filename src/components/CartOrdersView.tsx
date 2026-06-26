import React, { useState } from 'react';
import { ShoppingCart, Trash2, CheckCircle2, ShieldCheck, Download, AlertCircle, RefreshCw, FileCode } from 'lucide-react';
import { CardItem, UserProfile } from '../types';

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

  // Computed totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleRemoveFromCart = (cardId: string) => {
    setCart(prev => prev.filter(item => item.id !== cardId));
    onAddToast('Removed item from shopping cart.', 'info');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (user.balance < cartTotal) {
      alert('Insufficient balance. Please click "[ add funds ]" in the header to increase your wallet.');
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
      const formattedNum = ccNum.replace(/(\d{4})/g, '$1 ').trim();
      const cvv = Math.floor(Math.random() * 900) + 100;
      const names = ['John Miller', 'Sarah Connor', 'Michael Scott', 'Patrick Kamande', 'Emily Davis', 'Robert Vance'];
      const addresses = ['742 Evergreen Terrace', '1725 Slough Avenue', '10455 Magnolia Ave', '221B Baker St', '1600 Amphitheatre Pkwy'];
      
      const selectName = names[Math.floor(Math.random() * names.length)];
      const selectAddr = addresses[Math.floor(Math.random() * addresses.length)];
      const cities: Record<string, string> = { CA: 'Los Angeles', NY: 'New York', TX: 'Houston', FL: 'Miami', ON: 'Toronto', LND: 'London' };
      const selectCity = cities[item.state] || 'Springfield';

      return {
        ...item,
        purchaseId: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        purchaseDate: new Date().toLocaleString(),
        revealed: false,
        tested: 'untested', // 'untested' | 'valid' | 'dead'
        fullCc: formattedNum,
        fullCvv: cvv.toString(),
        fullName: selectName,
        fullAddressStr: `${selectAddr}, ${selectCity}, ${item.state}, ${item.zip}, ${item.country}`,
        fullPhone: `+1 ${Math.floor(Math.random() * 900) + 100}-555-0199`,
        fullSsn: item.ssn ? `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}` : null,
        fullDob: item.dob ? `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 30) + 1975}` : null,
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
    const dump = `${order.fullCc.replace(/\s+/g, '')}|${order.expDate.replace('/', '|')}|${order.fullCvv}|${order.fullName}|${order.fullAddressStr}|${order.fullPhone}`;
    const element = document.createElement('a');
    const file = new Blob([dump], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Protocol_${order.bin}_${order.purchaseId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onAddToast('Downloaded card credential pack!', 'success');
  };

  if (activeTab === 'cart') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs text-xs flex flex-col gap-4">
        <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#0c5460]" /> Shopping Cart ({cart.length} items)
        </h2>

        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">
            Your shopping cart is currently empty. Go to CVV2 or Dumps to add sandbox items!
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
                        <p><span className="text-gray-400">Card:</span> <span className="font-bold text-gray-900">{order.fullCc}</span></p>
                        <p><span className="text-gray-400">Exp:</span> <span className="font-bold text-gray-900">{order.expDate}</span></p>
                        <p><span className="text-gray-400">CVV:</span> <span className="font-bold text-gray-900">{order.fullCvv}</span></p>
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

                    {order.revealed && !isDead && (
                      <>
                        <button
                          onClick={() => handleDownloadTxt(order)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border rounded px-3 py-1.5 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                          title="Download CC Dump TXT file"
                        >
                          <Download className="w-3.5 h-3.5 text-gray-500" /> Download TXT
                        </button>
                        <button
                          onClick={() => {
                            const dump = `${order.fullCc.replace(/\s+/g, '')}|${order.expDate.replace('/', '|')}|${order.fullCvv}|${order.fullName}|${order.fullAddressStr}`;
                            navigator.clipboard.writeText(dump);
                            onAddToast('Copied standard carding format to clipboard!', 'success');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border rounded px-3 py-1.5 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                        >
                          <FileCode className="w-3.5 h-3.5 text-gray-500" /> Copy Dump
                        </button>
                      </>
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
    </div>
  );
}
