import React, { useState, useEffect } from 'react';
import { Coins, Award, Sparkles, Gift, LogOut, Clock } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onLogout: () => void;
  cartCount: number;
}

export default function Header({ user, setUser, onLogout, cartCount }: HeaderProps) {
  const [serverTime, setServerTime] = useState<string>('06:00:17');

  // Dynamic ticking clock representing "Current server time" in the screenshot
  useEffect(() => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const tick = () => {
      const now = new Date();
      // Maintain a consistent server-like simulation or actual ticking
      const h = pad(now.getHours());
      const m = pad(now.getMinutes());
      const s = pad(now.getSeconds());
      setServerTime(`${h}:${m}:${s}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 py-3.5 px-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
      {/* Left side details */}
      <div className="flex flex-col gap-1.5 select-text">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-normal text-gray-800 tracking-tight">
            Welcome, <span className="text-[#0c5460] font-semibold italic">{user.username || 'anonymous'}.</span>
          </h1>
          {user.accountStatus === 'active' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-black uppercase tracking-widest shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Member
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-black uppercase tracking-widest shadow-xs animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Inactive Member (Restricted Mode)
            </span>
          )}
        </div>

        {user.accountStatus !== 'active' && (
          <div className="my-1.5 bg-amber-50 border border-amber-300 rounded p-2.5 text-[11px] text-amber-800 max-w-xl shadow-2xs leading-relaxed flex items-start gap-2">
            <span className="text-base select-none shrink-0">⚠️</span>
            <div>
              <span className="font-extrabold uppercase tracking-wide">RESTRICTED VIEW ACTIVE:</span>{' '}
              Sensitive database records, live bid options, and purchase checkouts are currently locked. Make a deposit of <span className="font-extrabold text-amber-900 underline">$20.00 or more</span> to instantly activate your account and gain unrestricted lifetime access.
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-600">
          {/* Balance info */}
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700">Balance:</span>
            <span className="font-extrabold text-[#0c5460] font-mono">${user.balance.toFixed(2)}</span>
            <button
              onClick={() => setUser(prev => ({ ...prev, addFundsOpen: true }))}
              className="text-[#0056b3] hover:underline hover:text-blue-800 font-bold ml-1 cursor-pointer"
            >
              [ add funds ]
            </button>
          </div>

          {/* Crab Rating info */}
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700">Crab Rating:</span>
            <span className="font-extrabold text-amber-700 font-mono">{user.crabRating} crabs</span>
            <button
              onClick={() => setUser(prev => ({ ...prev, crabsDetailsOpen: true }))}
              className="text-[#0056b3] hover:underline hover:text-blue-800 font-bold ml-1 cursor-pointer"
            >
              [ details ]
            </button>
          </div>

          {/* Current server time ticking */}
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Current server time:</span>
            <span className="font-mono font-bold text-gray-700">{serverTime}</span>
          </div>
        </div>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Lottery Button */}
        <button
          onClick={() => setUser(prev => ({ ...prev, lotteryOpen: true }))}
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Lottery</span>
          <span className="text-emerald-600 font-black">$</span>
        </button>

        {/* My Gift Button */}
        <button
          onClick={() => setUser(prev => ({ ...prev, giftOpen: true }))}
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Gift className="w-3.5 h-3.5 text-orange-500" />
          <span>My Gift</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-white hover:bg-red-50 border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-red-700 hover:border-red-300 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
