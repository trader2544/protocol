import React, { useState } from 'react';
import { Search, RotateCcw, HelpCircle, Info } from 'lucide-react';
import { mockBanks, mockCountries, mockStates, mockBases } from '../mockData';

interface FilterFormProps {
  activeTab: string;
  searchFilters: any;
  setSearchFilters: React.Dispatch<React.SetStateAction<any>>;
  onSearch: () => void;
  onReset: () => void;
  cardList?: any[];
}

export default function FilterForm({ activeTab, searchFilters, setSearchFilters, onSearch, onReset, cardList }: FilterFormProps) {
  const [liveFiltering, setLiveFiltering] = useState(false);

  // Dynamically extract unique banks, countries, states, and bases from cardList if provided
  const dynamicBanks = cardList 
    ? Array.from(new Set(cardList.filter(c => c.category === activeTab || (!c.category && activeTab === 'cvv2')).map(c => c.bank).filter(Boolean))) as string[]
    : [];
  const dynamicBases = cardList
    ? Array.from(new Set(cardList.filter(c => c.category === activeTab || (!c.category && activeTab === 'cvv2')).map(c => c.base).filter(Boolean))) as string[]
    : [];
  const dynamicCountries = cardList
    ? Array.from(new Set(cardList.filter(c => c.category === activeTab || (!c.category && activeTab === 'cvv2')).map(c => c.country).filter(Boolean))) as string[]
    : [];
  const dynamicStates = cardList
    ? Array.from(new Set(cardList.filter(c => c.category === activeTab || (!c.category && activeTab === 'cvv2')).map(c => c.state).filter(Boolean))) as string[]
    : [];

  const banksList = Array.from(new Set([...dynamicBanks, ...mockBanks])).sort();
  const basesList = Array.from(new Set([...dynamicBases, ...mockBases])).sort();
  const statesList = Array.from(new Set([...dynamicStates, ...mockStates])).sort();

  const countriesList = [...mockCountries];
  dynamicCountries.forEach(code => {
    if (!countriesList.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      countriesList.push({ code: code.toUpperCase(), name: code.toUpperCase() });
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setSearchFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  // Common row wrapper to match the aligned table-row form layout in screenshots
  const FormRow = ({ label, children, border = true }: { label: string | React.ReactNode; children: React.ReactNode; border?: boolean }) => (
    <div className={`flex items-center justify-between py-1.5 px-2 ${border ? 'border-b border-gray-200' : ''} text-gray-700 min-h-[36px]`}>
      <span className="font-bold text-[11px] text-gray-800 pr-2 select-none shrink-0">{label}</span>
      <div className="flex-grow flex justify-end max-w-[70%]">{children}</div>
    </div>
  );

  // Layout 1: FULLZ (`fullz.html`)
  if (activeTab === 'fullz') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-xs select-text">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column 1 */}
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
            <FormRow label="First Name">
              <input
                type="text"
                value={searchFilters.firstName || ''}
                onChange={e => handleInputChange('firstName', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1.5 focus:outline-none focus:border-blue-500 text-xs"
              />
            </FormRow>

            <FormRow label="Last Name">
              <input
                type="text"
                value={searchFilters.lastName || ''}
                onChange={e => handleInputChange('lastName', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1.5 focus:outline-none focus:border-blue-500 text-xs"
              />
            </FormRow>

            <FormRow label="State">
              <select
                value={searchFilters.state}
                onChange={e => handleInputChange('state', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1.5 bg-white text-xs text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                {statesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormRow>

            <FormRow label="Own / Rent">
              <input
                type="checkbox"
                checked={searchFilters.ownRent}
                onChange={e => handleInputChange('ownRent', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Years At Residence">
              <input
                type="checkbox"
                checked={searchFilters.yearsAtResidence}
                onChange={e => handleInputChange('yearsAtResidence', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Income Type">
              <input
                type="checkbox"
                checked={searchFilters.incomeType}
                onChange={e => handleInputChange('incomeType', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Employer">
              <input
                type="checkbox"
                checked={searchFilters.employer}
                onChange={e => handleInputChange('employer', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Occupation">
              <input
                type="checkbox"
                checked={searchFilters.occupation}
                onChange={e => handleInputChange('occupation', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Years Employed">
              <input
                type="checkbox"
                checked={searchFilters.yearsEmployed}
                onChange={e => handleInputChange('yearsEmployed', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Work Phone">
              <input
                type="checkbox"
                checked={searchFilters.workPhone}
                onChange={e => handleInputChange('workPhone', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Net Monthly Income">
              <input
                type="checkbox"
                checked={searchFilters.netMonthlyIncome}
                onChange={e => handleInputChange('netMonthlyIncome', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Phone">
              <input
                type="checkbox"
                checked={searchFilters.phone}
                onChange={e => handleInputChange('phone', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Email" border={false}>
              <input
                type="checkbox"
                checked={searchFilters.email}
                onChange={e => handleInputChange('email', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>
          </div>

          {/* Column 2 */}
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
            <FormRow label="SSN">
              <input
                type="checkbox"
                checked={searchFilters.ssn}
                onChange={e => handleInputChange('ssn', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="DOB">
              <input
                type="checkbox"
                checked={searchFilters.dob}
                onChange={e => handleInputChange('dob', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="MMN">
              <input
                type="checkbox"
                checked={searchFilters.mmn}
                onChange={e => handleInputChange('mmn', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Drivers Number">
              <input
                type="checkbox"
                checked={searchFilters.driverLicense}
                onChange={e => handleInputChange('driverLicense', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="DL State">
              <select
                value={searchFilters.dlState || ''}
                onChange={e => handleInputChange('dlState', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1.5 bg-white text-xs text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                {statesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormRow>

            <FormRow label="Account Number">
              <input
                type="checkbox"
                checked={searchFilters.accountNumber || false}
                onChange={e => handleInputChange('accountNumber', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Routing Number" border={false}>
              <input
                type="checkbox"
                checked={searchFilters.routingNumber || false}
                onChange={e => handleInputChange('routingNumber', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>
          </div>

          {/* Column 3 */}
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
            <FormRow label="Base">
              <select
                value={searchFilters.base}
                onChange={e => handleInputChange('base', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1.5 bg-white text-xs text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                {basesList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </FormRow>

            <FormRow label="Country">
              <select
                value={searchFilters.country}
                onChange={e => handleInputChange('country', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1.5 bg-white text-xs text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                {countriesList.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </FormRow>

            <FormRow label="Discounted" border={false}>
              <input
                type="checkbox"
                checked={searchFilters.discounted}
                onChange={e => handleInputChange('discounted', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>
          </div>

        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 mt-4 pt-3 flex justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-1.5 border border-gray-300 rounded-sm cursor-pointer select-none text-xs transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onSearch}
            className="flex items-center gap-1.5 bg-[#2076d2] hover:bg-[#1976d2] text-white font-bold px-6 py-1.5 border border-[#2076d2] rounded-sm cursor-pointer select-none text-xs transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </div>

        {/* Red warning bar */}
        <div className="mt-4 border border-red-200 bg-red-50/50 p-3 rounded-sm text-center text-red-600 font-extrabold text-[11px] leading-relaxed">
          Fulls information is a set of personal data that cannot be replaced or refunded after the purchase. Please refrain from buying fulls if you're not ready to take the loss due to discrepancies, changed or incorrect information on file, including a person moving to another address, driver's license replaced, etc. We cannot control these changed, thus purchases like that will not be refunded.
        </div>
      </div>
    );
  }

  // Layout 2: CVV2 (`cvv.html`)
  if (activeTab === 'cvv2') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-xs select-text">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-gray-800 font-extrabold text-[11px] mb-1">Bins</label>
              <textarea
                value={searchFilters.bins}
                onChange={e => handleInputChange('bins', e.target.value)}
                className="w-full h-[65px] border border-gray-300 rounded-sm p-2 focus:outline-none focus:border-blue-400 font-mono text-xs resize-none"
                placeholder="Enter BINs (e.g. 411111)"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-extrabold text-[11px] mb-1">Zips</label>
              <textarea
                value={searchFilters.zips}
                onChange={e => handleInputChange('zips', e.target.value)}
                className="w-full h-[65px] border border-gray-300 rounded-sm p-2 focus:outline-none focus:border-blue-400 font-mono text-xs resize-none"
                placeholder="Enter ZIPs"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-extrabold text-[11px] mb-1">Bank</label>
              <select
                value={searchFilters.bank}
                onChange={e => handleInputChange('bank', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1.5 bg-white focus:outline-none focus:border-blue-400 text-xs text-gray-700"
              >
                <option value="">- all -</option>
                {banksList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden h-fit">
            <FormRow label="Country">
              <select
                value={searchFilters.country}
                onChange={e => handleInputChange('country', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                {countriesList.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </FormRow>

            <FormRow label="State">
              <select
                value={searchFilters.state}
                onChange={e => handleInputChange('state', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                {statesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FormRow>

            <FormRow label="ZIP">
              <input
                type="checkbox"
                checked={searchFilters.zipChecked || false}
                onChange={e => handleInputChange('zipChecked', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Full Address">
              <input
                type="checkbox"
                checked={searchFilters.fullAddress}
                onChange={e => handleInputChange('fullAddress', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Phone">
              <input
                type="checkbox"
                checked={searchFilters.phone}
                onChange={e => handleInputChange('phone', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Email">
              <input
                type="checkbox"
                checked={searchFilters.email}
                onChange={e => handleInputChange('email', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Email password">
              <input
                type="checkbox"
                checked={searchFilters.emailPassword}
                onChange={e => handleInputChange('emailPassword', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Without cvv2" border={false}>
              <input
                type="checkbox"
                checked={searchFilters.withoutCvv2}
                onChange={e => handleInputChange('withoutCvv2', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>
          </div>

          {/* Column 3 */}
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden h-fit">
            <FormRow label="Type">
              <select
                value={searchFilters.type}
                onChange={e => handleInputChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">Amex</option>
                <option value="Discover">Discover</option>
              </select>
            </FormRow>

            <FormRow label="Credit/Debit">
              <select
                value={searchFilters.creditDebit}
                onChange={e => handleInputChange('creditDebit', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </FormRow>

            <FormRow label="Subtype">
              <select
                value={searchFilters.subtype}
                onChange={e => handleInputChange('subtype', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700 focus:outline-none focus:border-blue-500"
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
            </FormRow>

            <FormRow label="Exp Date">
              <input
                type="text"
                value={searchFilters.expDate}
                onChange={e => handleInputChange('expDate', e.target.value)}
                placeholder="03/21"
                className="w-full border border-gray-300 rounded-sm p-1 focus:outline-none focus:border-blue-500 text-[11px] font-mono text-right"
              />
            </FormRow>

            <FormRow label="Discounted">
              <input
                type="checkbox"
                checked={searchFilters.discounted}
                onChange={e => handleInputChange('discounted', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <FormRow label="Only refundable">
              <input
                type="checkbox"
                checked={searchFilters.onlyRefundable}
                onChange={e => handleInputChange('onlyRefundable', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </FormRow>

            <div className="p-2 border-b border-gray-200">
              <div className="flex justify-between items-center text-gray-700 font-extrabold text-[10px] mb-1">
                <span>Price Range</span>
                <span className="font-bold text-[#0c5460] font-mono">${searchFilters.priceRange || 150}</span>
              </div>
              <input
                type="range"
                min="1"
                max="150"
                value={searchFilters.priceRange || 150}
                onChange={e => handleInputChange('priceRange', parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1 bg-gray-200 rounded-sm appearance-none"
              />
            </div>
          </div>

          {/* Column 4 */}
          <div className="border border-gray-200 rounded-sm bg-white overflow-hidden h-fit">
            <FormRow label="Base" border={false}>
              <select
                value={searchFilters.base}
                onChange={e => handleInputChange('base', e.target.value)}
                className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">- all -</option>
                {basesList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </FormRow>
          </div>

        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 mt-4 pt-3 flex justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-1.5 border border-gray-300 rounded-sm cursor-pointer select-none text-xs transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onSearch}
            className="flex items-center gap-1.5 bg-[#2076d2] hover:bg-[#1976d2] text-white font-bold px-6 py-1.5 border border-[#2076d2] rounded-sm cursor-pointer select-none text-xs transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </div>

        <div className="mt-4 border border-red-200 bg-red-50/50 p-2 rounded-sm text-center text-red-600 font-extrabold text-[11px] uppercase">
          Please read carefully before buying!
        </div>
      </div>
    );
  }

  // Layout: Bank Logs (`banklogs`)
  if (activeTab === 'banklogs') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-xs select-text">
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 border border-gray-200 rounded-sm">
          <span className="font-extrabold text-[#2076d2] text-[12px] uppercase tracking-wider flex items-center gap-1.5">
            🔍 Filter Bank Logs
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Use filters to narrow down live database entries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          <FormRow label="Bank Name">
            <select
              value={searchFilters.bank}
              onChange={e => handleInputChange('bank', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- any -</option>
              {banksList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Country">
            <select
              value={searchFilters.country}
              onChange={e => handleInputChange('country', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- any -</option>
              {countriesList.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </FormRow>

          <FormRow label="State">
            <select
              value={searchFilters.state}
              onChange={e => handleInputChange('state', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- any -</option>
              {statesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Account Type">
            <select
              value={searchFilters.bankAccountType}
              onChange={e => handleInputChange('bankAccountType', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- any -</option>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Business Checking">Business Checking</option>
            </select>
          </FormRow>

          <FormRow label="Access Type">
            <select
              value={searchFilters.bankAccessType}
              onChange={e => handleInputChange('bankAccessType', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- any -</option>
              <option value="Online Login">Online Login</option>
              <option value="SMS Bypass">SMS Bypass</option>
              <option value="Cookies Attached">Cookies Attached</option>
            </select>
          </FormRow>

          <FormRow label="Min Balance">
            <input
              type="number"
              placeholder="e.g. 5000"
              value={searchFilters.bankBalanceMin || ''}
              onChange={e => handleInputChange('bankBalanceMin', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-right"
            />
          </FormRow>
        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 mt-4 pt-3 flex justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-1.5 border border-gray-300 rounded-sm cursor-pointer text-xs transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onSearch}
            className="flex items-center gap-1.5 bg-[#2076d2] hover:bg-[#1976d2] text-white font-bold px-6 py-1.5 border border-[#2076d2] rounded-sm cursor-pointer text-xs transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </div>
      </div>
    );
  }

  // Layout: CashApp (`cashapp`)
  if (activeTab === 'cashapp') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-xs select-text">
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 border border-gray-200 rounded-sm">
          <span className="font-extrabold text-[#1b5e20] text-[12px] uppercase tracking-wider flex items-center gap-1.5">
            💸 Filter CashApp
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Filter verified CashApp logins and balances</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          <FormRow label="Username ($Cashtag)">
            <input
              type="text"
              placeholder="e.g. $cashking"
              value={searchFilters.cashappUsername}
              onChange={e => handleInputChange('cashappUsername', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            />
          </FormRow>

          <FormRow label="Min Balance ($)">
            <input
              type="number"
              placeholder="e.g. 100"
              value={searchFilters.cashappBalanceMin || ''}
              onChange={e => handleInputChange('cashappBalanceMin', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-right"
            />
          </FormRow>

          <FormRow label="Has Funds?">
            <input
              type="checkbox"
              checked={searchFilters.cashappHasFunds}
              onChange={e => handleInputChange('cashappHasFunds', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
            />
          </FormRow>
        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 mt-4 pt-3 flex justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-1.5 border border-gray-300 rounded-sm cursor-pointer text-xs transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onSearch}
            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-1.5 border border-green-700 rounded-sm cursor-pointer text-xs transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </div>
      </div>
    );
  }

  // Layout: PayPal (`paypal`)
  if (activeTab === 'paypal') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-xs select-text">
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 border border-gray-200 rounded-sm">
          <span className="font-extrabold text-[#0d47a1] text-[12px] uppercase tracking-wider flex items-center gap-1.5">
            🔵 Filter PayPal
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Filter verified PayPal logs with/without payment methods</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          <FormRow label="Email / Keyword">
            <input
              type="text"
              placeholder="e.g. paypaluk"
              value={searchFilters.paypalEmail}
              onChange={e => handleInputChange('paypalEmail', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            />
          </FormRow>

          <FormRow label="Min Balance ($)">
            <input
              type="number"
              placeholder="e.g. 500"
              value={searchFilters.paypalBalanceMin || ''}
              onChange={e => handleInputChange('paypalBalanceMin', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-right"
            />
          </FormRow>

          <FormRow label="Linked PM?">
            <input
              type="checkbox"
              checked={searchFilters.paypalHasPaymentMethod}
              onChange={e => handleInputChange('paypalHasPaymentMethod', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </FormRow>
        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 mt-4 pt-3 flex justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-1.5 border border-gray-300 rounded-sm cursor-pointer text-xs transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onSearch}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-1.5 border border-blue-700 rounded-sm cursor-pointer text-xs transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </div>
      </div>
    );
  }

  // Layout: RDP/VPS (`rdp`)
  if (activeTab === 'rdp') {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-xs select-text">
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 border border-gray-200 rounded-sm">
          <span className="font-extrabold text-purple-800 text-[12px] uppercase tracking-wider flex items-center gap-1.5">
            💻 Filter RDP / VPS
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Filter remote desktop servers and connections</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          <FormRow label="IP Address">
            <input
              type="text"
              placeholder="e.g. 192.168"
              value={searchFilters.rdpIp}
              onChange={e => handleInputChange('rdpIp', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            />
          </FormRow>

          <FormRow label="City">
            <input
              type="text"
              placeholder="e.g. Chicago"
              value={searchFilters.rdpCity}
              onChange={e => handleInputChange('rdpCity', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            />
          </FormRow>

          <FormRow label="Operating System">
            <select
              value={searchFilters.rdpOs}
              onChange={e => handleInputChange('rdpOs', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- any -</option>
              <option value="Windows Server 2022">Windows Server 2022</option>
              <option value="Windows Server 2019">Windows Server 2019</option>
              <option value="Windows 10 Pro">Windows 10 Pro</option>
              <option value="Windows 11 Enterprise">Windows 11 Enterprise</option>
              <option value="Ubuntu Linux 22.04">Ubuntu Linux 22.04</option>
            </select>
          </FormRow>

          <FormRow label="Access Type">
            <select
              value={searchFilters.rdpAccessType}
              onChange={e => handleInputChange('rdpAccessType', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- any -</option>
              <option value="Admin">Administrator</option>
              <option value="User">User</option>
            </select>
          </FormRow>
        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 mt-4 pt-3 flex justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-1.5 border border-gray-300 rounded-sm cursor-pointer text-xs transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onSearch}
            className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-1.5 border border-purple-700 rounded-sm cursor-pointer text-xs transition-colors shadow-xs"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </div>
      </div>
    );
  }

  // Layout 3: DUMPS (`dump.html`)
  // Default fallback is Dumps layout
  if (activeTab === 'dumps') {
    return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 text-xs shadow-xs select-text">
      
      {/* Live Filtering header bar */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 border border-gray-200 rounded-sm">
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={liveFiltering}
            onChange={e => setLiveFiltering(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
          <span className="ml-2 font-bold text-gray-800 text-[11px] uppercase">
            {liveFiltering ? 'On' : 'Off'} Live filtering. Warning! Slows down page loading.
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">Bins:</label>
            <textarea
              value={searchFilters.bins}
              onChange={e => handleInputChange('bins', e.target.value)}
              className="w-full h-[50px] border border-gray-300 rounded-sm p-1.5 focus:outline-none focus:border-blue-400 font-mono text-[11px] resize-none"
              placeholder="e.g. 512365"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-gray-800 font-extrabold text-[11px]">Bins (8 digit):</label>
            </div>
            <textarea
              value={searchFilters.bins8Digit || ''}
              onChange={e => handleInputChange('bins8Digit', e.target.value)}
              className="w-full h-[50px] border border-gray-300 rounded-sm p-1.5 focus:outline-none focus:border-blue-400 font-mono text-[11px] resize-none"
              placeholder="Enter 8 digit BINs"
            />
            <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
              Search by 8 digits is available for users with a rating of 5 crab and above. <span className="text-blue-500 cursor-pointer hover:underline">About rating</span>
            </p>
          </div>

          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">Bank:</label>
            <select
              value={searchFilters.bank}
              onChange={e => handleInputChange('bank', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- all -</option>
              {banksList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">Bank Country:</label>
            <select
              value={searchFilters.bankCountry || ''}
              onChange={e => handleInputChange('bankCountry', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- all -</option>
              {countriesList.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">Card Number:</label>
            <input
              type="text"
              value={searchFilters.cardNumberLast4 || ''}
              onChange={e => handleInputChange('cardNumberLast4', e.target.value)}
              placeholder="Last 4 digits"
              className="w-full border border-gray-300 rounded-sm p-1 text-[11px] font-mono text-right"
            />
            <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
              Search by last 4 digits is available for users with a rating of 2 crab and above. <span className="text-blue-500 cursor-pointer hover:underline">About rating</span>
            </p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">Country:</label>
            <select
              value={searchFilters.country}
              onChange={e => handleInputChange('country', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- all -</option>
              {countriesList.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">State:</label>
            <select
              value={searchFilters.state}
              onChange={e => handleInputChange('state', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- all -</option>
              {statesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">City:</label>
            <select
              value={searchFilters.city || ''}
              onChange={e => handleInputChange('city', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="">- all -</option>
              <option value="Queens Village">Queens Village</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="New York">New York</option>
              <option value="Seoul">Seoul</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 font-extrabold text-[11px] mb-0.5">ZIPs:</label>
            <textarea
              value={searchFilters.zips}
              onChange={e => handleInputChange('zips', e.target.value)}
              className="w-full h-[80px] border border-gray-300 rounded-sm p-1.5 focus:outline-none focus:border-blue-400 font-mono text-[11px] resize-none"
              placeholder="Enter ZIP codes"
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="border border-gray-200 rounded-sm bg-white overflow-hidden h-fit">
          <FormRow label="Type">
            <select
              value={searchFilters.type}
              onChange={e => handleInputChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700"
            >
              <option value="">- all -</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">Amex</option>
              <option value="Discover">Discover</option>
            </select>
          </FormRow>

          <FormRow label="Credit/Debit">
            <select
              value={searchFilters.creditDebit}
              onChange={e => handleInputChange('creditDebit', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700"
            >
              <option value="">- all -</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </FormRow>

          <FormRow label="Subtype">
            <select
              value={searchFilters.subtype}
              onChange={e => handleInputChange('subtype', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700"
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
          </FormRow>

          <FormRow label="Code" border={false}>
            <select
              value={searchFilters.code || ''}
              onChange={e => handleInputChange('code', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700"
            >
              <option value="">- all -</option>
              <option value="201">201</option>
              <option value="206">206</option>
              <option value="221">221</option>
            </select>
          </FormRow>
        </div>

        {/* Column 4 */}
        <div className="border border-gray-200 rounded-sm bg-white overflow-hidden h-fit">
          <FormRow label="Base">
            <select
              value={searchFilters.base}
              onChange={e => handleInputChange('base', e.target.value)}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px] text-gray-700"
            >
              <option value="">- all -</option>
              {basesList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Exp Date">
            <input
              type="text"
              value={searchFilters.expDate}
              onChange={e => handleInputChange('expDate', e.target.value)}
              placeholder="03/21"
              className="w-full border border-gray-300 rounded-sm p-1 focus:outline-none focus:border-blue-500 text-[11px] font-mono text-right"
            />
          </FormRow>

          <FormRow label="Price Range">
            <select
              value={searchFilters.priceRange}
              onChange={e => handleInputChange('priceRange', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-sm p-1 bg-white text-[11px]"
            >
              <option value="150">- all -</option>
              <option value="30">Under $30</option>
              <option value="50">Under $50</option>
              <option value="100">Under $100</option>
            </select>
          </FormRow>

          <FormRow label="Track1">
            <input
              type="checkbox"
              checked={searchFilters.track1 || false}
              onChange={e => handleInputChange('track1', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </FormRow>

          <FormRow label="PIN">
            <input
              type="checkbox"
              checked={searchFilters.pin || false}
              onChange={e => handleInputChange('pin', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </FormRow>

          <FormRow label="refundable only">
            <input
              type="checkbox"
              checked={searchFilters.onlyRefundable}
              onChange={e => handleInputChange('onlyRefundable', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </FormRow>

          <FormRow label="billing zip">
            <input
              type="checkbox"
              checked={searchFilters.billingZip || false}
              onChange={e => handleInputChange('billingZip', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </FormRow>

          <FormRow label={
            <span className="flex items-center gap-1">
              EDD+pin
              <Info className="w-3 h-3 text-gray-400 inline cursor-pointer" title="EDD info" />
            </span>
          } border={false}>
            <input
              type="checkbox"
              checked={searchFilters.eddPin || false}
              onChange={e => handleInputChange('eddPin', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
          </FormRow>
        </div>

      </div>

      {/* Buttons */}
      <div className="border-t border-gray-200 mt-4 pt-3 flex justify-center gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-1.5 border border-gray-300 rounded-sm cursor-pointer select-none text-xs transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onSearch}
          className="flex items-center gap-1.5 bg-[#2076d2] hover:bg-[#1976d2] text-white font-bold px-6 py-1.5 border border-[#2076d2] rounded-sm cursor-pointer select-none text-xs transition-colors shadow-xs"
        >
          <Search className="w-3.5 h-3.5" /> Search
        </button>
      </div>
    </div>
  );
}
}
