import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { mockBanks, mockCountries, mockStates, mockBases } from '../mockData';

interface FilterFormProps {
  searchFilters: any;
  setSearchFilters: React.Dispatch<React.SetStateAction<any>>;
  onSearch: () => void;
  onReset: () => void;
}

export default function FilterForm({ searchFilters, setSearchFilters, onSearch, onReset }: FilterFormProps) {
  const handleInputChange = (field: string, value: any) => {
    setSearchFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-800 font-bold mb-1.5 uppercase tracking-wide">Bins</label>
            <textarea
              value={searchFilters.bins}
              onChange={e => handleInputChange('bins', e.target.value)}
              className="w-full h-16 border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-400 font-mono text-xs resize-none"
              placeholder="Enter BINs (e.g. 411111, 542418)"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1.5 uppercase tracking-wide">Zips</label>
            <textarea
              value={searchFilters.zips}
              onChange={e => handleInputChange('zips', e.target.value)}
              className="w-full h-16 border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-400 font-mono text-xs resize-none"
              placeholder="Enter ZIPs (e.g. 90210, 10019)"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">Bank</label>
            <select
              value={searchFilters.bank}
              onChange={e => handleInputChange('bank', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
            >
              <option value="">- all -</option>
              {mockBanks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">Country</label>
            <select
              value={searchFilters.country}
              onChange={e => handleInputChange('country', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
            >
              <option value="">- all -</option>
              {mockCountries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">State</label>
            <select
              value={searchFilters.state}
              onChange={e => handleInputChange('state', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
            >
              <option value="">- all -</option>
              {mockStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-1 font-medium text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.fullAddress}
                onChange={e => handleInputChange('fullAddress', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Full Address</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.phone}
                onChange={e => handleInputChange('phone', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Phone</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.email}
                onChange={e => handleInputChange('email', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Email</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.emailPassword}
                onChange={e => handleInputChange('emailPassword', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Email password</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.withoutCvv2}
                onChange={e => handleInputChange('withoutCvv2', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Without cvv2</span>
            </label>
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">Type</label>
            <select
              value={searchFilters.type}
              onChange={e => handleInputChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
            >
              <option value="">- all -</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">Amex</option>
              <option value="Discover">Discover</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">Credit/Debit</label>
            <select
              value={searchFilters.creditDebit}
              onChange={e => handleInputChange('creditDebit', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
            >
              <option value="">- all -</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">Subtype</label>
            <select
              value={searchFilters.subtype}
              onChange={e => handleInputChange('subtype', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
            >
              <option value="">- all -</option>
              <option value="Classic">Classic</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Signature">Signature</option>
              <option value="Business">Business</option>
              <option value="Corporate">Corporate</option>
              <option value="Infinite">Infinite</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">Exp Date</label>
            <input
              type="text"
              value={searchFilters.expDate}
              onChange={e => handleInputChange('expDate', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-400 font-mono text-xs"
              placeholder="MM/YY (e.g. 12/28)"
            />
          </div>

          <div className="flex flex-col gap-2 font-medium text-gray-700 mt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.discounted}
                onChange={e => handleInputChange('discounted', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Discounted</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.onlyRefundable}
                onChange={e => handleInputChange('onlyRefundable', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Only refundable</span>
            </label>
          </div>

          <div className="pt-1.5 border-t border-gray-200 mt-1">
            <div className="flex justify-between items-center text-gray-700 font-semibold mb-1">
              <span>Price Range</span>
              <span className="font-bold text-[#0c5460] font-mono">$1 - ${searchFilters.priceRange}</span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              value={searchFilters.priceRange}
              onChange={e => handleInputChange('priceRange', parseInt(e.target.value))}
              className="w-full accent-[#0c5460] cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
              <span>$1</span>
              <span>$150</span>
            </div>
          </div>
        </div>

        {/* Column 4 */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-gray-800 font-bold mb-1 uppercase tracking-wide">Base</label>
            <select
              value={searchFilters.base}
              onChange={e => handleInputChange('base', e.target.value)}
              className="w-full border border-gray-300 rounded p-2 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
            >
              <option value="">- all -</option>
              {mockBases.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2.5 pt-1.5 font-medium text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.dob}
                onChange={e => handleInputChange('dob', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>DOB</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.ssn}
                onChange={e => handleInputChange('ssn', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>SSN</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.mmn}
                onChange={e => handleInputChange('mmn', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>MMN</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.ipAddress}
                onChange={e => handleInputChange('ipAddress', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>IP address</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.lastPaidAmount}
                onChange={e => handleInputChange('lastPaidAmount', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Last Paid Amount</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.driverLicense}
                onChange={e => handleInputChange('driverLicense', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Driver License Number</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.driverLicenseScan}
                onChange={e => handleInputChange('driverLicenseScan', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>Driver License Scan</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.atmPin}
                onChange={e => handleInputChange('atmPin', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>ATM PIN</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchFilters.attPin}
                onChange={e => handleInputChange('attPin', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-400 border-gray-300 w-3.5 h-3.5"
              />
              <span>AT&T PIN</span>
            </label>
          </div>
        </div>

      </div>

      {/* Form Action Controls */}
      <div className="border-t border-gray-200 mt-5 pt-3.5 flex justify-end gap-2.5">
        <button
          onClick={onReset}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 border border-gray-300 rounded cursor-pointer transition-colors select-none"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
        </button>
        <button
          onClick={onSearch}
          className="flex items-center gap-1 bg-[#0c5460] hover:opacity-90 text-white font-bold px-6 py-2 rounded border border-[#0c5460] cursor-pointer transition-colors select-none shadow-xs"
        >
          <Search className="w-3.5 h-3.5" /> Filter Search Results
        </button>
      </div>
    </div>
  );
}
