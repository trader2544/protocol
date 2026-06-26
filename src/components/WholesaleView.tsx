import React from 'react';
import { ShoppingCart, Check, ShieldCheck, Box } from 'lucide-react';
import { WholesalePack, CardItem } from '../types';

interface WholesaleViewProps {
  packs: WholesalePack[];
  cart: CardItem[];
  onAddPackToCart: (pack: WholesalePack) => void;
}

export default function WholesaleView({ packs, cart, onAddPackToCart }: WholesaleViewProps) {
  const isPackInCart = (packId: string) => cart.some(item => item.id === packId);

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 mb-4 flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-600" /> Bulk Wholesale Pack Offerings
        </h2>
        <p className="text-gray-500 mb-5 leading-relaxed">
          Wholesale bundles offer high volumes of unsearched BINs at highly discounted price per unit.
          All packs are covered by our standard diagnostic tester. High validity rate guaranteed!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packs.map(pack => {
            const inCart = isPackInCart(pack.id);
            const unitPrice = pack.price / pack.count;

            return (
              <div
                key={pack.id}
                className="bg-gray-50 border border-gray-200 rounded p-4 flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#bee5eb]" />

                <div className="pt-2">
                  <h3 className="font-extrabold text-gray-900 text-sm mb-1.5 flex items-center gap-1">
                    {pack.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded font-black">
                      {pack.count} Cards
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-extrabold">
                      ${unitPrice.toFixed(2)}/card
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px] mb-4">
                    {pack.description}
                  </p>
                  
                  <div className="border-t border-gray-200 pt-3 flex flex-col gap-1 text-[11px] text-gray-500 font-medium">
                    <div className="flex justify-between">
                      <span>Origin:</span>
                      <span className="font-bold text-gray-700">{pack.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mix Type:</span>
                      <span className="font-bold text-gray-700">{pack.type}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 font-bold block text-[9px] uppercase leading-none">Total Bundle Price</span>
                    <span className="text-emerald-800 font-mono font-extrabold text-base">${pack.price.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => onAddPackToCart(pack)}
                    disabled={inCart}
                    className={`py-1.5 px-4 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      inCart
                        ? 'bg-gray-100 text-gray-400 border border-gray-200'
                        : 'bg-[#bee5eb] hover:bg-sky-200 text-gray-950 border border-[#0c5460]'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        <span>In Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Buy Pack</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
