import React from 'react';
import { ShoppingCart, Check, ShieldAlert } from 'lucide-react';
import { CardItem } from '../types';

interface CardTableProps {
  cards: CardItem[];
  cart: CardItem[];
  onAddToCart: (card: CardItem) => void;
  activeTab: string;
}

export default function CardTable({ cards, cart, onAddToCart, activeTab }: CardTableProps) {
  const isCardInCart = (cardId: string) => cart.some(item => item.id === cardId);

  const getCountryEmoji = (code: string) => {
    const emojis: Record<string, string> = {
      US: '🇺🇸',
      CA: '🇨🇦',
      GB: '🇬🇧',
      DE: '🇩🇪',
      FR: '🇫🇷',
      AU: '🇦🇺',
      IT: '🇮🇹',
      ES: '🇪🇸',
    };
    return emojis[code.toUpperCase()] || '🌐';
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return '💳 Visa';
      case 'mastercard': return '💳 MC';
      case 'amex': return '💳 Amex';
      case 'discover': return '💳 Disc';
      default: return '💳';
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden mt-4">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
        <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wide">
          Available Sandbox Items ({cards.length} results matching filter)
        </h3>
        <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-semibold uppercase">
          Category: {activeTab}
        </span>
      </div>

      <div className="overflow-x-auto text-xs">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 gap-1 text-gray-500">
            <ShieldAlert className="w-8 h-8 text-gray-400" />
            <span className="font-bold text-gray-700">No cards matched your filter.</span>
            <span>Try loosening your search criteria or resetting filters.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-bold text-[10px] uppercase">
                <th className="p-3">BIN</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Level / Type</th>
                <th className="p-3">Class</th>
                <th className="p-3">Country</th>
                <th className="p-3">State</th>
                <th className="p-3">Zip</th>
                <th className="p-3 text-center">DOB/SSN</th>
                <th className="p-3">Issuer Bank</th>
                <th className="p-3">Base Name</th>
                <th className="p-3 font-mono">Price</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {cards.map(card => {
                const inCart = isCardInCart(card.id);
                return (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-gray-900">{card.bin}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        card.type === 'Visa' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        card.type === 'Mastercard' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        card.type === 'Amex' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {getCardIcon(card.type)}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[11px]">{card.subtype}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-medium ${
                        card.creditDebit === 'Credit' ? 'text-emerald-700' : 'text-sky-700'
                      }`}>
                        {card.creditDebit}
                      </span>
                    </td>
                    <td className="p-3 font-medium">
                      <span className="mr-1">{getCountryEmoji(card.country)}</span>
                      <span>{card.country}</span>
                    </td>
                    <td className="p-3 font-mono">{card.state || '-'}</td>
                    <td className="p-3 font-mono text-gray-500">{card.zip || '-'}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        {card.dob && (
                          <span className="px-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-[2px] text-[9px] font-bold" title="Contains Date of Birth">DOB</span>
                        )}
                        {card.ssn && (
                          <span className="px-1 bg-purple-100 border border-purple-200 text-purple-800 rounded-[2px] text-[9px] font-bold" title="Contains Social Security Number">SSN</span>
                        )}
                        {!card.dob && !card.ssn && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="p-3 font-semibold truncate max-w-[130px] text-gray-600" title={card.bank}>
                      {card.bank}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-zinc-500 truncate max-w-[120px]" title={card.base}>
                      {card.base}
                    </td>
                    <td className="p-3 font-mono font-extrabold text-emerald-800">${card.price.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onAddToCart(card)}
                        disabled={inCart}
                        className={`py-1 px-3.5 rounded text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ml-auto cursor-pointer ${
                          inCart
                            ? 'bg-gray-100 text-gray-400 border border-gray-200'
                            : 'bg-[#bee5eb] hover:bg-sky-200 text-gray-900 border border-[#0c5460] shadow-2xs active:translate-y-[0.5px]'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            <span>Buy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
