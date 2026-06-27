import React, { useState, useEffect } from 'react';
import { Gavel, Clock, Trophy, RefreshCw } from 'lucide-react';
import { AuctionItem, UserProfile } from '../types';
import { updateAuctionBid, updateUserProfile } from '../utils/dbService';

interface AuctionViewProps {
  auctions: AuctionItem[];
  setAuctions: React.Dispatch<React.SetStateAction<AuctionItem[]>>;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onAddToast: (msg: string, type: 'success' | 'info') => void;
}

export default function AuctionView({ auctions, setAuctions, user, setUser, onAddToast }: AuctionViewProps) {
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [timeStrings, setTimeStrings] = useState<Record<string, string>>({});

  // Active counting timers
  useEffect(() => {
    const updateTimers = () => {
      const strings: Record<string, string> = {};
      auctions.forEach(item => {
        const diff = new Date(item.endTime).getTime() - Date.now();
        if (diff <= 0) {
          strings[item.id] = 'Ended';
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          strings[item.id] = `${hours}h ${mins}m ${secs}s`;
        }
      });
      setTimeStrings(strings);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [auctions]);

  // Simulated adversary bidders bidding against the user!
  useEffect(() => {
    const rivalBidTimer = setInterval(() => {
      // 20% chance of a mock counter-bid every 15 seconds
      if (Math.random() > 0.8) {
        const targetIndex = Math.floor(Math.random() * auctions.length);
        const target = auctions[targetIndex];

        // Only bid if the auction hasn't ended
        const diff = new Date(target.endTime).getTime() - Date.now();
        if (diff <= 0) return;

        const bidIncrease = Math.floor(Math.random() * 3) + 0.5;
        const nextBid = target.currentBid + bidIncrease;

        setAuctions(prev => prev.map((item, idx) => {
          if (idx === targetIndex) {
            // If the user was leading, outbid them!
            if (item.myBid > 0 && item.myBid === item.currentBid) {
              onAddToast(`⚠️ You have been outbid on BIN ${item.card.bin}! New bid: $${nextBid.toFixed(2)}`, 'info');
            }
            return {
              ...item,
              currentBid: nextBid,
              bidsCount: item.bidsCount + 1,
            };
          }
          return item;
        }));
      }
    }, 15000);

    return () => clearInterval(rivalBidTimer);
  }, [auctions, onAddToast]);

  const handlePlaceBid = async (itemId: string) => {
    const item = auctions.find(a => a.id === itemId);
    if (!item) return;

    const bidVal = parseFloat(bidInputs[itemId] || '0');
    const minBid = item.currentBid + 0.50;

    if (isNaN(bidVal) || bidVal < minBid) {
      alert(`Invalid bid. Minimum bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    if (user.balance < bidVal) {
      alert('Insufficient balance in your wallet to place this bid.');
      return;
    }

    try {
      const newBalance = user.balance - bidVal;
      await updateUserProfile(user.email, { balance: newBalance });
      await updateAuctionBid(itemId, bidVal, item.bidsCount + 1, bidVal);

      setUser(prev => ({ ...prev, balance: newBalance }));

      setAuctions(prev => prev.map(a => {
        if (a.id === itemId) {
          return {
            ...a,
            currentBid: bidVal,
            myBid: bidVal,
            bidsCount: a.bidsCount + 1,
          };
        }
        return a;
      }));

      onAddToast(`Placed bid of $${bidVal.toFixed(2)} on BIN ${item.card.bin}!`, 'success');
      setBidInputs(prev => ({ ...prev, [itemId]: '' }));
    } catch (err) {
      console.error("Error placing live bid:", err);
      alert("Failed to place live bid.");
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 mb-4 flex items-center gap-2">
          <Gavel className="w-4 h-4 text-amber-700 animate-pulse" /> Live Carding Auctions
        </h2>
        <p className="text-gray-500 mb-5 leading-relaxed">
          Auction items are exclusive, rare premium profiles containing valid data with high credit limits.
          Bidding increases by minimum increments of $0.50. High bids lock funds from your sandbox wallet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {auctions.map(item => {
            const isLeading = item.myBid > 0 && item.myBid === item.currentBid;
            const hasEnded = timeStrings[item.id] === 'Ended';

            return (
              <div
                key={item.id}
                className={`bg-gray-50 border rounded p-4 flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden ${
                  isLeading ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200'
                }`}
              >
                {/* Timer top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  hasEnded ? 'bg-red-400' : isLeading ? 'bg-emerald-500' : 'bg-amber-400'
                }`} />

                <div className="pt-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-gray-950 text-sm">
                      BIN: {item.card.bin}
                    </h3>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      hasEnded
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{timeStrings[item.id] || 'Loading...'}</span>
                    </div>
                  </div>

                  {/* Card parameters preview */}
                  <div className="bg-white border p-2.5 rounded text-[10px] text-gray-600 mb-4 flex flex-col gap-1.5 font-medium shadow-2xs">
                    <div className="flex justify-between border-b pb-1">
                      <span>Brand / Level:</span>
                      <span className="font-bold text-gray-800">{item.card.type} {item.card.subtype}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Country:</span>
                      <span className="font-bold text-gray-800">{item.card.country} ({item.card.state})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Issuer:</span>
                      <span className="font-bold text-gray-800 truncate max-w-[120px]">{item.card.bank}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-100 p-2.5 rounded border mb-4 text-[11px]">
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase leading-none font-bold">Current Bid</span>
                      <span className="text-gray-900 font-mono font-black text-sm">${item.currentBid.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block text-[9px] uppercase leading-none font-bold">Total Bids</span>
                      <span className="text-gray-700 font-bold font-mono">{item.bidsCount} offers</span>
                    </div>
                  </div>

                  {item.myBid > 0 && (
                    <div className={`p-2 rounded mb-4 text-center text-[10px] font-semibold border ${
                      isLeading
                        ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                        : 'bg-amber-100 border-amber-200 text-amber-800'
                    }`}>
                      {isLeading ? (
                        <span className="flex items-center justify-center gap-1">
                          <Trophy className="w-3 h-3 text-emerald-600" />
                          🎉 You are the highest bidder! (${item.myBid.toFixed(2)})
                        </span>
                      ) : (
                        <span>You bid ${item.myBid.toFixed(2)} (Outbid!)</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-2 border-t pt-3 flex flex-col gap-2">
                  {!hasEnded ? (
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.5"
                          value={bidInputs[item.id] || ''}
                          onChange={e => setBidInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder={(item.currentBid + 0.50).toFixed(2)}
                          className="w-full border border-gray-300 rounded pl-5 pr-2 py-1.5 focus:outline-none focus:border-blue-400 text-xs font-semibold font-mono"
                        />
                      </div>
                      <button
                        onClick={() => handlePlaceBid(item.id)}
                        className="bg-[#0c5460] hover:opacity-90 text-white font-extrabold px-4 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Gavel className="w-3 h-3" /> Bid
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 bg-gray-200 text-gray-500 rounded font-bold uppercase text-[10px]">
                      Auction Closed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
