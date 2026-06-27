import React from 'react';
import { ShoppingCart, Check, ShieldAlert, FileText } from 'lucide-react';
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

  const getCountryName = (code: string) => {
    const names: Record<string, string> = {
      US: 'United States',
      CA: 'Canada',
      GB: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
      AU: 'Australia',
      IT: 'Italy',
      ES: 'Spain',
    };
    return names[code.toUpperCase()] || code || 'Global';
  };

  // Stable helper to generate fake string/data based on card ID
  const getStableValue = (id: string, index: number, options: string[]) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash + index) % options.length;
    return options[idx];
  };

  // Common purchase handler
  const renderBuyButton = (card: CardItem) => {
    const inCart = isCardInCart(card.id);
    return (
      <button
        onClick={() => onAddToCart(card)}
        disabled={inCart}
        className={`p-2 rounded-sm transition-all cursor-pointer ${
          inCart
            ? 'bg-gray-100 text-gray-400 border border-gray-200'
            : 'bg-gray-50 border border-gray-300 hover:bg-gray-200 text-gray-700 hover:text-black shadow-2xs active:translate-y-[0.5px]'
        }`}
        title={inCart ? "In Cart" : "Add to Cart"}
      >
        {inCart ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <ShoppingCart className="w-3.5 h-3.5 text-gray-700" />
        )}
      </button>
    );
  };

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-8 text-center text-gray-500 shadow-2xs select-text">
        <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <span className="font-bold text-gray-700 text-sm block">No sandbox cards found matching filters.</span>
        <span className="text-xs">Adjust your search criteria above or reset filters to load items.</span>
      </div>
    );
  }

  // --- RENDERING TABLE 1: FULLZ (`fullz.html`) ---
  if (activeTab === 'fullz') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden select-text text-[11px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold h-[40px] select-none text-[11px]">
                <th className="p-2 border-r border-gray-200 text-center w-8">
                  <input type="checkbox" className="rounded-sm" disabled />
                </th>
                <th className="p-2 border-r border-gray-200">Person</th>
                <th className="p-2 border-r border-gray-200">Object</th>
                <th className="p-2 border-r border-gray-200">Extra</th>
                <th className="p-2 border-r border-gray-200">Base</th>
                <th className="p-2 border-r border-gray-200">Price</th>
                <th className="p-2 text-center w-12">Cart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans text-gray-700">
              {cards.map((card, idx) => {
                // Ensure nice fallback values for mock data representation
                const flag = getCountryEmoji(card.country);
                const countryName = getCountryName(card.country);
                const fullName = card.fullName || getStableValue(card.id, idx, ['SHANTEL', 'KAREN', 'ROBERT', 'JAMES', 'PATRICIA', 'ELIZABETH', 'JENNIFER', 'LINDA']) + ' ***';
                const city = getStableValue(card.id, idx + 1, ['Queens Village', 'Los Angeles', 'Miami', 'Brooklyn', 'Chicago', 'Houston', 'Atlanta']);
                const zipStr = card.zip || getStableValue(card.id, idx + 2, ['11427-2923', '90012-3011', '33101-4452', '11201-1123', '60601-2093']);
                const baseName = card.base || '1231_FULLZ_SSN_DOB_DLN_STATE_ZIP';

                // Red/green text style helper
                const renderYesNo = (val: boolean | string) => {
                  const isYes = val === true || val === 'yes' || val === 'Own' || val === 'Rent';
                  return (
                    <span className={isYes ? "text-green-600 font-extrabold" : "text-red-500 font-bold"}>
                      {val === true ? 'yes' : val === false ? 'no' : String(val).toLowerCase()}
                    </span>
                  );
                };

                return (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors h-[110px]">
                    <td className="p-2 border-r border-gray-200 text-center select-none">
                      <input type="checkbox" className="rounded-sm" />
                    </td>
                    <td className="p-2 border-r border-gray-200 leading-relaxed font-sans min-w-[240px]">
                      <div>Name: <span className="font-bold text-gray-900">{fullName}</span></div>
                      <div className="flex items-center gap-1">
                        city/zip: <span className="inline-block shrink-0">{flag}</span> {countryName}, {card.state || 'NY'}, {city} , {zipStr}
                      </div>
                      <div>full address: {renderYesNo(card.fullAddress)}</div>
                      <div>phone: {renderYesNo(card.phone)}</div>
                      <div>email: {renderYesNo(card.email)}</div>
                    </td>
                    <td className="p-2 border-r border-gray-200 leading-relaxed font-sans min-w-[180px]">
                      <div>Own/Rent: {renderYesNo(card.fullAddress ? 'Own' : 'no')}</div>
                      <div>Years At Residence: {renderYesNo(false)}</div>
                      <div>Income Type: {renderYesNo(false)}</div>
                      <div>Employer: {renderYesNo(false)}</div>
                      <div>Occupation: {renderYesNo(false)}</div>
                      <div>Years Employed: {renderYesNo(false)}</div>
                      <div>Work Phone: {renderYesNo(false)}</div>
                      <div>Net Monthly Income: {renderYesNo(false)}</div>
                    </td>
                    <td className="p-2 border-r border-gray-200 leading-relaxed font-sans min-w-[180px]">
                      <div>Credit Card: {renderYesNo(false)}</div>
                      <div>Checking Account: {renderYesNo(false)}</div>
                      <div>SSN: {renderYesNo(card.ssn)}</div>
                      <div>DOB: {renderYesNo(card.dob)}</div>
                      <div>MMN: {renderYesNo(card.mmn)}</div>
                      <div>Driver License ({card.state || 'NY'}): {renderYesNo(card.driverLicense)}</div>
                      <div>Account: {renderYesNo(card.accountNumber || false)}</div>
                      <div>Routing: {renderYesNo(card.routingNumber || false)}</div>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-500 font-medium min-w-[150px]">
                      {baseName}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-extrabold text-gray-900 font-mono text-xs select-all">
                      {card.price.toFixed(2)} $
                    </td>
                    <td className="p-2 text-center select-none shrink-0">
                      {renderBuyButton(card)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- RENDERING TABLE 2: CVV2 (`ccv.html`) ---
  if (activeTab === 'cvv2') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden select-text text-[11px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold h-[40px] select-none text-[11px]">
                <th className="p-2 border-r border-gray-200 text-center w-8">
                  <input type="checkbox" className="rounded-sm" disabled />
                </th>
                <th className="p-2 border-r border-gray-200">Bin</th>
                <th className="p-2 border-r border-gray-200">Type</th>
                <th className="p-2 border-r border-gray-200">Subtype</th>
                <th className="p-2 border-r border-gray-200">Expiry</th>
                <th className="p-2 border-r border-gray-200">Name</th>
                <th className="p-2 border-r border-gray-200">Country</th>
                <th className="p-2 border-r border-gray-200">State</th>
                <th className="p-2 border-r border-gray-200">Full Address</th>
                <th className="p-2 border-r border-gray-200">Zip</th>
                <th className="p-2 border-r border-gray-200">Extra</th>
                <th className="p-2 border-r border-gray-200">Bank</th>
                <th className="p-2 border-r border-gray-200">Base</th>
                <th className="p-2 border-r border-gray-200">Price</th>
                <th className="p-2 text-center w-12">Cart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans text-gray-700">
              {cards.map((card, idx) => {
                const flag = getCountryEmoji(card.country);
                const countryName = getCountryName(card.country);
                const fullName = card.fullName || getStableValue(card.id, idx, ['KAREN', 'SHANTEL', 'JOHN', 'DAVID', 'SARAH', 'MICHAEL']) + ' ***';
                const zipMasked = card.zip ? card.zip.substring(0, 3) + '***' : '45***';
                const baseName = card.base || '0823_US_IP';

                // Compile dynamic extra details matching screenshot e.g. "Phone Email IP"
                const extras: string[] = [];
                if (card.phone) extras.push('Phone');
                if (card.email) extras.push('Email');
                if (card.ipAddress) extras.push('IP');
                if (extras.length === 0) extras.push('-');

                return (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors h-[45px]">
                    <td className="p-2 border-r border-gray-200 text-center select-none">
                      <input type="checkbox" className="rounded-sm" />
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono font-bold text-gray-900 select-all">
                      {card.bin}
                    </td>
                    <td className="p-2 border-r border-gray-200 select-none">
                      <span className={`px-1 py-0.5 rounded-[2px] font-extrabold text-[9px] uppercase tracking-wide ${
                        card.type === 'Visa' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        card.type === 'Mastercard' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        card.type === 'Amex' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        'bg-zinc-100 text-zinc-800 border border-zinc-200'
                      }`}>
                        {card.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-bold uppercase text-[10px]">
                      {card.creditDebit} {card.subtype}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-600 font-semibold select-all">
                      {card.expDate}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-bold text-gray-800">
                      {fullName}
                    </td>
                    <td className="p-2 border-r border-gray-200 flex items-center gap-1 h-[45px]">
                      <span className="shrink-0">{flag}</span>
                      <span>{countryName}</span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono font-semibold text-gray-800">
                      {card.state || '-'}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center">
                      <span className={card.fullAddress ? "text-green-600 font-extrabold" : "text-red-500 font-bold"}>
                        {card.fullAddress ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-500">
                      {zipMasked}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-gray-500 font-semibold text-[10px]">
                      {extras.join(' ')}
                    </td>
                    <td className="p-2 border-r border-gray-200 min-w-[150px]">
                      <span className="font-semibold text-gray-800">{card.bank}</span>;{' '}
                      <span className={card.onlyRefundable ? "text-green-600 font-bold text-[10px]" : "text-red-500 font-bold text-[10px]"}>
                        {card.onlyRefundable ? 'replaceable' : 'not replaceable'}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-zinc-500 font-medium select-all">
                      {baseName}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-extrabold text-gray-900 font-mono text-xs select-all">
                      {card.price.toFixed(2)} $
                    </td>
                    <td className="p-2 text-center select-none shrink-0">
                      {renderBuyButton(card)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- RENDERING TABLE: BANK LOGS (`banklogs`) ---
  if (activeTab === 'banklogs') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden select-text text-[11px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold h-[40px] select-none text-[11px]">
                <th className="p-2 border-r border-gray-200 text-center w-8">
                  <input type="checkbox" className="rounded-sm" disabled />
                </th>
                <th className="p-2 border-r border-gray-200">Bank & Country</th>
                <th className="p-2 border-r border-gray-200">Account Type</th>
                <th className="p-2 border-r border-gray-200">Balance</th>
                <th className="p-2 border-r border-gray-200">Access Type</th>
                <th className="p-2 border-r border-gray-200">Base</th>
                <th className="p-2 border-r border-gray-200">Price</th>
                <th className="p-2 text-center w-12">Cart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans text-gray-700">
              {cards.map((card, idx) => {
                const flag = getCountryEmoji(card.country);
                const countryName = getCountryName(card.country);
                const bankName = card.bank || 'CHASE SAVINGS LOG';
                const accType = card.bankAccountType || 'Checking';
                const balance = card.bankBalance !== undefined ? `$${card.bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
                const access = card.bankAccessType || 'Online Login';
                const baseName = card.base || 'BASE_BANK_ONLINE';

                return (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors h-[45px]">
                    <td className="p-2 border-r border-gray-200 text-center select-none">
                      <input type="checkbox" className="rounded-sm" />
                    </td>
                    <td className="p-2 border-r border-gray-200 leading-tight">
                      <div className="font-bold text-gray-900">{bankName}</div>
                      <div className="text-gray-500 flex items-center gap-1 text-[10px]">
                        <span>{flag}</span> {countryName} {card.state ? `, ${card.state}` : ''}
                      </div>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-semibold text-gray-700">
                      {accType}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono font-bold text-green-600 text-xs">
                      {balance}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-gray-600 font-semibold">
                      {access}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-500 font-semibold">
                      {baseName}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-extrabold text-gray-900 font-mono text-xs">
                      {card.price.toFixed(2)} $
                    </td>
                    <td className="p-2 text-center select-none shrink-0">
                      {renderBuyButton(card)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- RENDERING TABLE: CASHAPP (`cashapp`) ---
  if (activeTab === 'cashapp') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden select-text text-[11px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold h-[40px] select-none text-[11px]">
                <th className="p-2 border-r border-gray-200 text-center w-8">
                  <input type="checkbox" className="rounded-sm" disabled />
                </th>
                <th className="p-2 border-r border-gray-200">Username ($Cashtag)</th>
                <th className="p-2 border-r border-gray-200">Contact Details</th>
                <th className="p-2 border-r border-gray-200">Has Funds?</th>
                <th className="p-2 border-r border-gray-200">Balance</th>
                <th className="p-2 border-r border-gray-200">PIN Included</th>
                <th className="p-2 border-r border-gray-200">Base</th>
                <th className="p-2 border-r border-gray-200">Price</th>
                <th className="p-2 text-center w-12">Cart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans text-gray-700">
              {cards.map((card, idx) => {
                const username = card.cashappUsername || `$user_${card.id.substring(0, 4)}`;
                const email = card.cashappEmail || 'hidden_email@domain.com';
                const phone = card.cashappPhone || '+1 *** *** ****';
                const hasFunds = card.cashappHasFunds !== false;
                const balance = card.cashappBalance !== undefined ? `$${card.cashappBalance.toFixed(2)}` : '$0.00';
                const pin = card.cashappPin || 'Included';
                const baseName = card.base || 'BASE_CASH_MOBILE';

                return (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors h-[45px]">
                    <td className="p-2 border-r border-gray-200 text-center select-none">
                      <input type="checkbox" className="rounded-sm" />
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono font-bold text-emerald-700">
                      {username}
                    </td>
                    <td className="p-2 border-r border-gray-200 leading-tight">
                      <div className="text-gray-800 font-semibold">{email}</div>
                      <div className="text-gray-500 text-[10px] font-mono">{phone}</div>
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center">
                      <span className={hasFunds ? "text-green-600 font-extrabold" : "text-red-500 font-bold"}>
                        {hasFunds ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono font-bold text-green-600 text-xs">
                      {balance}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center">
                      <span className="bg-gray-100 text-gray-700 font-mono font-bold px-1.5 py-0.5 rounded border border-gray-200">
                        {pin}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-500 font-semibold">
                      {baseName}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-extrabold text-gray-900 font-mono text-xs">
                      {card.price.toFixed(2)} $
                    </td>
                    <td className="p-2 text-center select-none shrink-0">
                      {renderBuyButton(card)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- RENDERING TABLE: PAYPAL (`paypal`) ---
  if (activeTab === 'paypal') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden select-text text-[11px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold h-[40px] select-none text-[11px]">
                <th className="p-2 border-r border-gray-200 text-center w-8">
                  <input type="checkbox" className="rounded-sm" disabled />
                </th>
                <th className="p-2 border-r border-gray-200">PayPal Email</th>
                <th className="p-2 border-r border-gray-200">Has Payment Method?</th>
                <th className="p-2 border-r border-gray-200">Balance</th>
                <th className="p-2 border-r border-gray-200">Cookies Attached?</th>
                <th className="p-2 border-r border-gray-200">Base</th>
                <th className="p-2 border-r border-gray-200">Price</th>
                <th className="p-2 text-center w-12">Cart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans text-gray-700">
              {cards.map((card, idx) => {
                const email = card.paypalEmail || 'hidden_paypal@domain.com';
                const hasPM = card.paypalHasPaymentMethod !== false;
                const balance = card.paypalBalance !== undefined ? `$${card.paypalBalance.toFixed(2)}` : '$0.00';
                const hasCookies = !!card.paypalCookies;
                const baseName = card.base || 'BASE_PAYPAL_GLOBAL';

                return (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors h-[45px]">
                    <td className="p-2 border-r border-gray-200 text-center select-none">
                      <input type="checkbox" className="rounded-sm" />
                    </td>
                    <td className="p-2 border-r border-gray-200 font-semibold text-blue-800 font-mono">
                      {email}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center">
                      <span className={hasPM ? "text-green-600 font-extrabold" : "text-red-500 font-bold"}>
                        {hasPM ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono font-bold text-green-600 text-xs">
                      {balance}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-600">
                      {hasCookies ? 'Cookies Included' : 'Login Credentials only'}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-500 font-semibold">
                      {baseName}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-extrabold text-gray-900 font-mono text-xs">
                      {card.price.toFixed(2)} $
                    </td>
                    <td className="p-2 text-center select-none shrink-0">
                      {renderBuyButton(card)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- RENDERING TABLE: RDP/VPS (`rdp`) ---
  if (activeTab === 'rdp') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden select-text text-[11px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold h-[40px] select-none text-[11px]">
                <th className="p-2 border-r border-gray-200 text-center w-8">
                  <input type="checkbox" className="rounded-sm" disabled />
                </th>
                <th className="p-2 border-r border-gray-200">Server Location</th>
                <th className="p-2 border-r border-gray-200">IP Address</th>
                <th className="p-2 border-r border-gray-200">Operating System</th>
                <th className="p-2 border-r border-gray-200">Access Type</th>
                <th className="p-2 border-r border-gray-200">Connection Speed</th>
                <th className="p-2 border-r border-gray-200">Base</th>
                <th className="p-2 border-r border-gray-200">Price</th>
                <th className="p-2 text-center w-12">Cart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans text-gray-700">
              {cards.map((card, idx) => {
                const flag = getCountryEmoji(card.rdpCountry || 'US');
                const location = `${card.rdpCity || 'Chicago'}, ${card.rdpState || 'IL'}`;
                const ip = card.rdpIp || '127.0.0.1';
                const os = card.rdpOs || 'Windows Server';
                const access = card.rdpAccessType || 'Admin';
                const speed = card.rdpHospeed || '1 Gbps';
                const baseName = card.base || 'BASE_RDP_ADMIN';

                return (
                  <tr key={card.id} className="hover:bg-gray-50/50 transition-colors h-[45px]">
                    <td className="p-2 border-r border-gray-200 text-center select-none">
                      <input type="checkbox" className="rounded-sm" />
                    </td>
                    <td className="p-2 border-r border-gray-200 flex items-center gap-1.5 font-bold text-gray-800 h-[45px]">
                      <span>{flag}</span>
                      <span>{location}</span>
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono font-bold text-gray-900 select-all">
                      {ip}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-semibold text-gray-600">
                      {os}
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center">
                      <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {access}
                      </span>
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center font-semibold font-mono text-gray-500">
                      {speed}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-mono text-gray-500 font-semibold">
                      {baseName}
                    </td>
                    <td className="p-2 border-r border-gray-200 font-extrabold text-gray-900 font-mono text-xs">
                      {card.price.toFixed(2)} $
                    </td>
                    <td className="p-2 text-center select-none shrink-0">
                      {renderBuyButton(card)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- RENDERING TABLE 3: DUMPS (`dump.html`) ---
  return (
    <div className="bg-white border border-gray-300 rounded-sm shadow-xs overflow-hidden select-text text-[11px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold h-[40px] select-none text-[11px]">
              <th className="p-2 border-r border-gray-200 text-center w-8">
                <input type="checkbox" className="rounded-sm" disabled />
              </th>
              <th className="p-2 border-r border-gray-200">Bin</th>
              <th className="p-2 border-r border-gray-200">Type</th>
              <th className="p-2 border-r border-gray-200">Debit/Credit</th>
              <th className="p-2 border-r border-gray-200">Subtype</th>
              <th className="p-2 border-r border-gray-200">Exp Date</th>
              <th className="p-2 border-r border-gray-200">Track1</th>
              <th className="p-2 border-r border-gray-200">Billing zip</th>
              <th className="p-2 border-r border-gray-200">Code</th>
              <th className="p-2 border-r border-gray-200">Country</th>
              <th className="p-2 border-r border-gray-200">Address</th>
              <th className="p-2 border-r border-gray-200">Bank</th>
              <th className="p-2 border-r border-gray-200">Base</th>
              <th className="p-2 border-r border-gray-200">Price</th>
              <th className="p-2 text-center w-12">Cart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-sans text-gray-700">
            {cards.map((card, idx) => {
              const flag = getCountryEmoji(card.country);
              const countryName = getCountryName(card.country);
              const expYearOnly = card.expDate ? 'XX/' + card.expDate.split('/')[1] : 'XX/21';
              const codeVal = card.track1 ? '201' : getStableValue(card.id, idx, ['201', '206', '221']);
              const baseName = card.base || 'Triangle';

              return (
                <tr key={card.id} className="hover:bg-gray-50/50 transition-colors h-[45px]">
                  <td className="p-2 border-r border-gray-200 text-center select-none">
                    <input type="checkbox" className="rounded-sm" />
                  </td>
                  <td className="p-2 border-r border-gray-200 font-mono font-bold text-gray-900 select-all">
                    {card.bin}
                  </td>
                  <td className="p-2 border-r border-gray-200 select-none">
                    <span className={`px-1 py-0.5 rounded-[2px] font-extrabold text-[9px] uppercase tracking-wide ${
                      card.type === 'Visa' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      card.type === 'Mastercard' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      card.type === 'Amex' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      'bg-zinc-100 text-zinc-800 border border-zinc-200'
                    }`}>
                      {card.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2 border-r border-gray-200 font-bold uppercase text-[10px]">
                    {card.creditDebit.toUpperCase()}
                  </td>
                  <td className="p-2 border-r border-gray-200 font-bold uppercase text-[10px]">
                    {card.subtype.toUpperCase()}
                  </td>
                  <td className="p-2 border-r border-gray-200 font-mono text-gray-600 font-semibold select-all">
                    {expYearOnly}
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-600">
                    {card.track1 ? 'yes' : '-'}
                  </td>
                  <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-600">
                    {card.zip ? 'yes' : '-'}
                  </td>
                  <td className="p-2 border-r border-gray-200 font-mono font-bold text-gray-700">
                    {codeVal}
                  </td>
                  <td className="p-2 border-r border-gray-200 flex items-center gap-1 h-[45px]">
                    <span className="shrink-0">{flag}</span>
                    <span>{countryName}</span>
                  </td>
                  <td className="p-2 border-r border-gray-200 font-semibold text-gray-500">
                    {card.fullAddressStr ? 'Yes' : 'N/A'}
                  </td>
                  <td className="p-2 border-r border-gray-200 min-w-[200px] leading-tight">
                    <span className="font-semibold text-gray-800">{card.bank}</span>;{' '}
                    {card.country !== 'US' && (
                      <span className="inline-flex shrink-0 ml-1">{flag}</span>
                    )}
                    <span className="text-red-500 font-bold text-[10px] ml-1">
                      {card.onlyRefundable ? 'refundable' : 'non refundable'}
                    </span>
                  </td>
                  <td className="p-2 border-r border-gray-200 font-mono text-zinc-500 font-semibold select-all">
                    {baseName}
                  </td>
                  <td className="p-2 border-r border-gray-200 font-extrabold text-gray-900 font-mono text-xs select-all">
                    {card.price.toFixed(2)} $
                  </td>
                  <td className="p-2 text-center select-none shrink-0">
                    {renderBuyButton(card)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
