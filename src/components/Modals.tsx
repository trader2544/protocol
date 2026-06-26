import React, { useState } from 'react';
import { X, Coins, DollarSign, Award, Sparkles, CheckCircle2, CreditCard } from 'lucide-react';
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
  };
}

export default function Modals({ user, setUser, onAddFunds, onAddToast, paymentAddresses }: ModalsProps) {
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [depositMethod, setDepositMethod] = useState<'btc' | 'ltc' | 'eth' | 'cc'>('btc');
  const [depositing, setDepositing] = useState(false);
  const [lotteryNumber, setLotteryNumber] = useState<number | null>(null);
  const [lotteryResult, setLotteryResult] = useState<string | null>(null);
  const [playingLottery, setPlayingLottery] = useState(false);

  if (user.addFundsOpen) {
    const addressMap = {
      btc: paymentAddresses?.btcAddress || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ltc: paymentAddresses?.ltcAddress || 'LQP92mxC9G9888AsXgH66688hS7sdfsF',
      eth: paymentAddresses?.ethAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      cc: 'Simulated Credit Gateway',
    };

    const handleDeposit = () => {
      const amt = parseFloat(depositAmount);
      if (isNaN(amt) || amt <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      setDepositing(true);
      setTimeout(() => {
        setDepositing(false);
        onAddFunds(amt);
        setUser(prev => ({ ...prev, addFundsOpen: false }));
      }, 1500);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
          <div className="bg-[#bee5eb] text-[#0c5460] px-4 py-3 flex justify-between items-center border-b border-[#bee5eb]">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              <Coins className="w-4 h-4" /> Add Live Funds
            </h3>
            <button onClick={() => setUser(prev => ({ ...prev, addFundsOpen: false }))} className="hover:opacity-85 text-[#0c5460] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 flex flex-col gap-4 text-xs text-gray-700">
            <div>
              <label className="block font-semibold mb-1 text-gray-800">Select Deposit Method:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['btc', 'ltc', 'eth', 'cc'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setDepositMethod(method)}
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

            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="font-semibold text-gray-800 mb-1">Send funds to address:</p>
              <p className="font-mono bg-white p-2 rounded border border-gray-300 break-all select-all text-[10px] text-gray-600">
                {addressMap[depositMethod]}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                * Send crypto to this address. Simulated deposits are instantly credited to your wallet balance.
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-800">Deposit Amount ($):</label>
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
                <span className="font-semibold text-[11px] text-gray-500">Checking blockchain confirmations...</span>
              </div>
            ) : (
              <button
                onClick={handleDeposit}
                className="w-full bg-[#add8e6] hover:bg-sky-200 text-gray-950 font-bold py-2 px-4 rounded border border-[#0c5460] transition-colors cursor-pointer text-xs uppercase"
              >
                Simulate Payment Verification
              </button>
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
              Your <strong>Crab Rating</strong> reflects your account status and volume history in our diagnostic sandbox.
              Higher crab ratings represent premium status in the community.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[11px] text-amber-900">
              <p className="font-semibold mb-1">How to boost Crab Rating:</p>
              <ul className="list-disc pl-4 flex flex-col gap-1">
                <li>Purchase CVV/BIN packs from CVV2, Dumps, or Fullz (+10 crabs per card)</li>
                <li>Add funds to top-up your sandbox balance (+15 crabs per top-up)</li>
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
    const handleLotteryPlay = (num: number) => {
      if (user.balance < 2) {
        alert('Insufficient balance. Playing lottery costs $2.00.');
        return;
      }
      setPlayingLottery(true);
      setLotteryNumber(num);
      setLotteryResult(null);

      setUser(prev => ({ ...prev, balance: prev.balance - 2 }));

      setTimeout(() => {
        setPlayingLottery(false);
        const winningNum = Math.floor(Math.random() * 9) + 1;
        if (num === winningNum) {
          setUser(prev => ({
            ...prev,
            balance: prev.balance + 50,
            crabRating: prev.crabRating + 25,
          }));
          setLotteryResult(`🎉 Match! The winning number was ${winningNum}. You won $50.00 cash and +25 Crab Rating!`);
          onAddToast('Match! You won $50.00 in the Lottery!', 'success');
        } else {
          setUser(prev => ({
            ...prev,
            crabRating: prev.crabRating + 3,
          }));
          setLotteryResult(`❌ Try again! The winning number was ${winningNum}. You received +3 Crab Rating as a console prize!`);
        }
      }, 1200);
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
          <div className="p-5 text-xs text-gray-700 flex flex-col gap-4 text-center">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Pick a card from 1 to 9</p>
              <p className="text-gray-500 mt-0.5">Tickets cost $2.00. Match the winning number to win $50.00!</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  disabled={playingLottery}
                  onClick={() => handleLotteryPlay(num)}
                  className={`h-12 border rounded-md font-extrabold text-sm transition-all flex items-center justify-center ${
                    playingLottery && lotteryNumber === num
                      ? 'bg-rose-500 border-rose-600 text-white animate-pulseScale'
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

            <div className="text-[10px] text-gray-400 border-t pt-2">
              Current Sandbox Balance: ${user.balance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.giftOpen) {
    const handleClaimGift = () => {
      setUser(prev => ({
        ...prev,
        balance: prev.balance + 10,
        crabRating: prev.crabRating + 5,
        giftOpen: false,
      }));
      onAddToast('Claimed daily loyalty gift of $10.00!', 'success');
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
                Thank you for using Protocol! We have rewarded your loyalty with a free credit voucher.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded p-3 text-orange-950 text-left">
              <p className="font-bold text-[11px] mb-1">🎁 Box Contents:</p>
              <ul className="list-disc pl-4 flex flex-col gap-1 text-[11px]">
                <li>+$10.00 Wallet Funds</li>
                <li>+5 Crabs Rating multiplier</li>
              </ul>
            </div>

            <button
              onClick={handleClaimGift}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition-colors cursor-pointer text-xs uppercase shadow"
            >
              Claim Reward Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
