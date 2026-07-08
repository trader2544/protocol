import React, { useState, useEffect } from 'react';
import { X, Coins, DollarSign, Award, Sparkles, CheckCircle2, CreditCard, Copy, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ModalsProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onAddFunds: (amount: number) => void;
  onAddToast: (msg: string, type: 'success' | 'info') => void;
  paymentAddresses?: {
    btcAddress: string;
    ltcAddress: string;
    ethAddress: string;
    usdtAddress: string;
  };
}

export default function Modals({ user, setUser, onAddFunds, onAddToast, paymentAddresses }: ModalsProps) {
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [depositMethod, setDepositMethod] = useState<'btc' | 'usdt' | 'eth' | 'ltc'>('btc');
  const [depositing, setDepositing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [lotteryNumber, setLotteryNumber] = useState<number | null>(null);
  const [lotteryResult, setLotteryResult] = useState<string | null>(null);
  const [playingLottery, setPlayingLottery] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoBalance, setDemoBalance] = useState(15.00);

  // NOWPayments local state
  const [nowpayment, setNowpayment] = useState<{
    payment_id: string;
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
    payment_status: string;
    price_amount: number;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Initialize payment creation
  const handleCreateNOWPayment = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 30) {
      alert('Minimum deposit amount is $30.');
      return;
    }
    
    setDepositing(true);
    setNowpayment(null);

    // Map method to NOWPayments coin code
    const methodMap = {
      btc: 'btc',
      usdt: 'usdttrc20',
      eth: 'eth',
      ltc: 'ltc'
    };
    const pay_currency = methodMap[depositMethod] || 'btc';

    try {
      const res = await fetch('/api/nowpayments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amt,
          pay_currency,
          email: user.email
        })
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = 'Failed to initialize payment';
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error || errMsg;
        } catch (e) {
          errMsg = `${res.status} ${res.statusText}: ${text.substring(0, 150)}`;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setNowpayment(data);
      onAddToast('Protocol Payment invoice created! Please send the exact amount.', 'success');
    } catch (err: any) {
      console.error(err);
      alert(`Payment Initialization Error: ${err.message || 'Please try again later'}`);
    } finally {
      setDepositing(false);
    }
  };

  // Manually check payment status
  const handleCheckNOWPaymentStatus = async (paymentId: string) => {
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/nowpayments/status/${paymentId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await res.json();
      
      setNowpayment(prev => prev ? { ...prev, payment_status: data.payment_status } : null);

      if (data.payment_status === 'finished' || data.payment_status === 'confirmed') {
        onAddToast(`Success! Payment of $${data.price_amount} credited to your account!`, 'success');
        onAddFunds(data.price_amount);
        setNowpayment(null);
        setUser(prev => ({ ...prev, addFundsOpen: false }));
      } else {
        onAddToast(`Current Payment Status: ${data.payment_status.toUpperCase()}`, 'info');
      }
    } catch (err: any) {
      console.error(err);
      onAddToast('Could not fetch status, please try again.', 'info');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Auto poll status every 8 seconds if invoice is active
  useEffect(() => {
    if (!nowpayment || !user.addFundsOpen) return;

    const interval = setInterval(() => {
      fetch(`/api/nowpayments/status/${nowpayment.payment_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.payment_status) {
            setNowpayment(prev => prev ? { ...prev, payment_status: data.payment_status } : null);
            if (data.payment_status === 'finished' || data.payment_status === 'confirmed') {
              onAddToast(`Success! Payment of $${data.price_amount} credited to your account!`, 'success');
              onAddFunds(data.price_amount);
              setNowpayment(null);
              setUser(prev => ({ ...prev, addFundsOpen: false }));
            }
          }
        })
        .catch(err => console.error('Polling status error:', err));
    }, 8000);

    return () => clearInterval(interval);
  }, [nowpayment, user.addFundsOpen]);

  if (user.addFundsOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
          <div className="bg-[#bee5eb] text-[#0c5460] px-4 py-3 flex justify-between items-center border-b border-[#bee5eb]">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              <Coins className="w-4 h-4" /> Add Live Funds
            </h3>
            <button onClick={() => { setNowpayment(null); setUser(prev => ({ ...prev, addFundsOpen: false })); }} className="hover:opacity-85 text-[#0c5460] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 flex flex-col gap-4 text-xs text-gray-700">
            {nowpayment ? (
              // Real Protocol Payment Invoice Display
              <div className="bg-gray-50 p-4 rounded border border-gray-200 flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="font-bold text-gray-800 text-[13px]">Protocol Payment Invoice</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded uppercase font-mono tracking-wider animate-pulse">
                    {nowpayment.payment_status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-gray-700 block mb-1">Send exact Amount:</span>
                  <div className="flex gap-1.5 items-stretch">
                    <p className="font-mono bg-white p-2 rounded border border-gray-300 break-all select-all text-[12px] text-gray-950 flex-grow font-black flex items-center justify-between">
                      <span>{nowpayment.pay_amount}</span>
                      <span className="text-blue-700 font-bold ml-1 uppercase">{nowpayment.pay_currency}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(nowpayment.pay_amount.toString());
                        setCopiedAmount(true);
                        onAddToast('Amount copied to clipboard!', 'success');
                        setTimeout(() => setCopiedAmount(false), 2000);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border border-gray-300 transition-all flex items-center justify-center cursor-pointer"
                      title="Copy amount"
                    >
                      {copiedAmount ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-gray-700 block mb-1">To Address:</span>
                  <div className="flex gap-1.5 items-stretch">
                    <p className="font-mono bg-white p-2 rounded border border-gray-300 break-all select-all text-[11px] text-gray-950 flex-grow font-semibold">
                      {nowpayment.pay_address}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(nowpayment.pay_address);
                        setCopied(true);
                        onAddToast('Address copied to clipboard!', 'success');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border border-gray-300 transition-all flex items-center justify-center cursor-pointer"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-gray-100 flex flex-col gap-1 font-medium mt-1">
                  <p className="font-bold text-gray-700">📌 Invoice Details:</p>
                  <div className="flex justify-between"><span>Payment ID:</span><span className="font-mono font-semibold text-gray-800">{nowpayment.payment_id}</span></div>
                  <div className="flex justify-between"><span>USD Value:</span><span className="font-mono font-semibold text-gray-800">${nowpayment.price_amount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Autocheck Interval:</span><span className="text-emerald-700 font-bold">Every 8 seconds</span></div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setNowpayment(null)}
                    className="flex-grow bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded border border-gray-300 transition-colors cursor-pointer text-[11px] uppercase text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCheckNOWPaymentStatus(nowpayment.payment_id)}
                    disabled={checkingStatus}
                    className="flex-grow bg-[#bee5eb] hover:bg-[#9ed5db] text-[#0c5460] font-black py-2 px-3 rounded border border-[#0c5460] transition-colors cursor-pointer text-[11px] uppercase flex items-center justify-center gap-1.5"
                  >
                    {checkingStatus ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#0c5460] border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    {checkingStatus ? 'Checking...' : 'Refresh Status'}
                  </button>
                </div>
              </div>
            ) : (
              // Checkout Entry Form
              <>
                <div>
                  <label className="block font-semibold mb-1 text-gray-800">Select Deposit Method:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['btc', 'usdt', 'eth', 'ltc'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => {
                          setDepositMethod(method);
                          setCopied(false);
                        }}
                        className={`py-2 px-1 border rounded text-center cursor-pointer uppercase font-bold text-[10px] ${
                          depositMethod === method
                            ? 'bg-[#add8e6] border-[#0c5460] text-gray-950 font-black'
                            : 'bg-gray-50 border-gray-300 text-gray-600'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1.5">
                    <span className="bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.5 rounded text-[9px]">EXPECTED NETWORK:</span>
                    <span className="underline uppercase tracking-wide">
                      {depositMethod === 'btc' && 'Bitcoin (BTC) Network'}
                      {depositMethod === 'usdt' && 'USDT TRC-20 (TRON Network)'}
                      {depositMethod === 'eth' && 'Ethereum ERC-20 Network'}
                      {depositMethod === 'ltc' && 'Litecoin (LTC) Network'}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    * The payment gateway requires payment on the specific network listed above.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold text-gray-800">Deposit Amount ($):</label>
                    <span className="text-[10px] text-rose-600 font-bold">Min deposit: $30.00</span>
                  </div>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-400 font-semibold"
                    placeholder="Enter deposit amount e.g. 50"
                  />
                </div>

                {depositing ? (
                  <div className="flex flex-col items-center justify-center py-2 gap-2">
                    <div className="w-6 h-6 border-2 border-[#0c5460] border-t-transparent rounded-full animate-spin" />
                    <span className="font-semibold text-[11px] text-gray-500">Connecting to Protocol Payment gateway...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleCreateNOWPayment}
                      className="w-full bg-[#2a6f97] hover:bg-[#014f86] text-white font-black py-2.5 px-4 rounded border border-sky-900 transition-colors cursor-pointer text-xs uppercase shadow-sm"
                    >
                      🚀 Pay with Protocol Payment
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user.crabsDetailsOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
          <div className="bg-amber-100 text-amber-800 px-4 py-3 flex justify-between items-center border-b border-amber-200">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              <Award className="w-4 h-4" /> Crab Rating details
            </h3>
            <button onClick={() => setUser(prev => ({ ...prev, crabsDetailsOpen: false }))} className="hover:opacity-85 text-amber-800 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 text-xs text-gray-700 leading-relaxed flex flex-col gap-3">
            <p className="font-semibold text-gray-900">What is the Crab Rating?</p>
            <p>
              Your <strong>Crab Rating</strong> reflects your account status and volume history in our system.
              Higher crab ratings represent premium status in the community.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[11px] text-amber-900">
              <p className="font-semibold mb-1">How to boost Crab Rating:</p>
              <ul className="list-disc pl-4 flex flex-col gap-1">
                <li>Purchase CVV/BIN packs from CVV2, Dumps, or Fullz (+10 crabs per card)</li>
                <li>Add funds to top-up your account balance (+15 crabs per top-up)</li>
                <li>Activate your account status (+20 crabs bonus)</li>
                <li>Participate in system lottery draws (+5 crabs console prize)</li>
              </ul>
            </div>
            <p className="text-gray-500 text-[10px]">
              * Note: Inactive or empty accounts default to 0 crabs. Keep a healthy balance to maintain an active Crab rating.
            </p>
            <button
              onClick={() => setUser(prev => ({ ...prev, crabsDetailsOpen: false }))}
              className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1.5 px-4 rounded border border-gray-300 text-center cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.lotteryOpen) {
    const activeBalance = isDemo ? demoBalance : user.balance;

    const handleLotteryPlay = (num: number) => {
      if (activeBalance < 1) {
        alert(isDemo ? 'Your demo wallet is empty! Reset your demo balance using the button below.' : 'Insufficient balance. Playing lottery costs $1.00.');
        return;
      }
      setPlayingLottery(true);
      setLotteryNumber(num);
      setLotteryResult(null);

      if (isDemo) {
        setDemoBalance(prev => prev - 1);
      } else {
        setUser(prev => ({ ...prev, balance: prev.balance - 1 }));
      }

      setTimeout(() => {
        setPlayingLottery(false);
        const winningNum = Math.floor(Math.random() * 9) + 1;
        if (num === winningNum) {
          if (isDemo) {
            setDemoBalance(prev => prev + 10);
            setLotteryResult(`🎉 Demo Match! The winning number was ${winningNum}. You won $10.00 in demo cash!`);
            onAddToast('Match! You won $10.00 in Demo Lottery!', 'success');
          } else {
            setUser(prev => ({
              ...prev,
              balance: prev.balance + 10,
              crabRating: prev.crabRating + 25,
            }));
            setLotteryResult(`🎉 Match! The winning number was ${winningNum}. You won $10.00 cash and +25 Crab Rating!`);
            onAddToast('Match! You won $10.00 in the Lottery!', 'success');
          }
        } else {
          if (!isDemo) {
            setUser(prev => ({
              ...prev,
              crabRating: prev.crabRating + 3,
            }));
          }
          setLotteryResult(`❌ Try again! The winning number was ${winningNum}.` + (!isDemo ? ' You received +3 Crab Rating as a console prize!' : ''));
        }
      }, 1000);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-200">
          <div className="bg-[#ffd1d1] text-[#721c24] px-4 py-3 flex justify-between items-center border-b border-[#f5c6cb]">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-rose-600" /> Protocol Lucky Lottery
            </h3>
            <button onClick={() => setUser(prev => ({ ...prev, lotteryOpen: false }))} className="hover:opacity-85 text-[#721c24] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Mode Selector Tabs */}
          <div className="flex border-b border-gray-200 text-xs font-bold bg-gray-50">
            <button
              onClick={() => { setIsDemo(false); setLotteryResult(null); }}
              className={`flex-1 py-2 text-center border-r border-gray-200 transition-colors cursor-pointer ${
                !isDemo
                  ? 'bg-white text-rose-600 border-b-2 border-b-rose-500'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              🟢 Live Mode ($1.00 / play)
            </button>
            <button
              onClick={() => { setIsDemo(true); setLotteryResult(null); }}
              className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                isDemo
                  ? 'bg-white text-rose-600 border-b-2 border-b-rose-500'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              🧪 Demo Mode ($15.00 fake)
            </button>
          </div>

          <div className="p-5 text-xs text-gray-700 flex flex-col gap-4 text-center">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Pick a card from 1 to 9</p>
              <p className="text-gray-500 mt-0.5">Tickets cost $1.00. Match the winning number to win $10.00!</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  disabled={playingLottery}
                  onClick={() => handleLotteryPlay(num)}
                  className={`h-12 border rounded-md font-extrabold text-sm transition-all flex items-center justify-center ${
                    playingLottery && lotteryNumber === num
                      ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                      : 'bg-gray-50 border-gray-300 hover:bg-rose-50 hover:border-rose-400 text-gray-700 cursor-pointer'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {playingLottery && (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-[11px] text-rose-700">Drawing winning card...</span>
              </div>
            )}

            {lotteryResult && (
              <div className="p-3 bg-gray-50 border rounded text-[11px] leading-relaxed text-gray-800 font-medium">
                {lotteryResult}
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] text-gray-600 border-t pt-2.5 font-bold">
              <span>
                {isDemo ? '🧪 Demo Balance:' : '🟢 Live Account Balance:'}
              </span>
              <span className="font-mono text-gray-900">
                ${activeBalance.toFixed(2)}
              </span>
            </div>

            {isDemo && (
              <div className="flex justify-center mt-1">
                <button
                  onClick={() => { setDemoBalance(15.00); setLotteryResult(null); onAddToast('Reset demo wallet to $15.00!', 'info'); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-3 py-1 rounded-sm border border-gray-300 text-[10px] cursor-pointer"
                >
                  Reset Demo Funds to $15.00
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user.giftOpen) {
    const giftClaimKey = `last_gift_claim_${user.email}`;
    const lastClaimStr = localStorage.getItem(giftClaimKey);
    const todayStr = new Date().toDateString();
    const hasClaimedToday = lastClaimStr === todayStr;

    const handleClaimGift = async () => {
      if (hasClaimedToday) {
        onAddToast('You have already claimed your daily gift today!', 'info');
        return;
      }

      const giftAmount = 1.00;
      const newBalance = user.balance + giftAmount;

      try {
        const { updateUserProfile } = await import('../utils/dbService');
        await updateUserProfile(user.email, { balance: newBalance });
      } catch (err) {
        console.error("Failed to persist balance on gift claim:", err);
      }

      localStorage.setItem(giftClaimKey, todayStr);

      setUser(prev => ({
        ...prev,
        balance: newBalance,
        giftOpen: false,
      }));
      onAddToast('Claimed daily loyalty gift of $1.00!', 'success');
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-200">
          <div className="bg-orange-100 text-orange-800 px-4 py-3 flex justify-between items-center border-b border-orange-200">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              🎁 Welcome Loyalty Gift
            </h3>
            <button onClick={() => setUser(prev => ({ ...prev, giftOpen: false }))} className="hover:opacity-85 text-orange-800 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 text-xs text-gray-700 flex flex-col gap-4 text-center">
            <div className="flex justify-center py-2 text-5xl animate-bounce">
              🎁
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Daily Credit Pack</h4>
              <p className="text-gray-500 mt-1">
                {hasClaimedToday
                  ? "You have already claimed your daily gift. Come back tomorrow!"
                  : "Thank you for using Protocol! We have rewarded your loyalty with a free daily credit voucher."}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded p-3 text-orange-950 text-left">
              <p className="font-bold text-[11px] mb-1">🎁 Box Contents:</p>
              <ul className="list-disc pl-4 flex flex-col gap-1 text-[11px]">
                <li>+$1.00 Wallet Funds</li>
                <li>+1 Loyalty Streak credit</li>
              </ul>
            </div>

            {hasClaimedToday ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 font-bold py-2 rounded text-xs uppercase cursor-not-allowed border border-gray-300"
              >
                Claimed Today
              </button>
            ) : (
              <button
                onClick={handleClaimGift}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition-colors cursor-pointer text-xs uppercase shadow border border-orange-500"
              >
                Claim Reward Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
