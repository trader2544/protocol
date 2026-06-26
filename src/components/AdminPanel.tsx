import React, { useState } from 'react';
import { ShieldAlert, Plus, Upload, CheckCircle2, DollarSign, Wallet, RefreshCw, Key } from 'lucide-react';
import { CardItem } from '../types';
import { SystemSettings } from '../utils/dbService';

interface AdminPanelProps {
  onAddCard: (card: Omit<CardItem, 'id'>) => Promise<any>;
  onBulkAddCards: (cards: Omit<CardItem, 'id'>[]) => Promise<any>;
  systemSettings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => Promise<any>;
  onAddToast: (msg: string, type: 'success' | 'info') => void;
}

export default function AdminPanel({
  onAddCard,
  onBulkAddCards,
  systemSettings,
  onUpdateSettings,
  onAddToast,
}: AdminPanelProps) {
  // Tabs inside Admin Panel: 'single' | 'bulk' | 'addresses'
  const [adminTab, setAdminTab] = useState<'single' | 'bulk' | 'addresses'>('single');

  // Single card form state
  const [singleCard, setSingleCard] = useState<Omit<CardItem, 'id'>>({
    bin: '411111',
    zip: '90210',
    bank: 'CHASE BANK',
    country: 'US',
    state: 'CA',
    type: 'Visa',
    creditDebit: 'Credit',
    subtype: 'Platinum',
    expDate: '12/28',
    discounted: false,
    onlyRefundable: true,
    price: 15.00,
    ssn: true,
    dob: true,
    mmn: false,
    ipAddress: '192.168.1.1',
    lastPaidAmount: false,
    driverLicense: false,
    driverLicenseScan: false,
    atmPin: false,
    attPin: false,
    fullAddress: true,
    phone: true,
    email: true,
    emailPassword: false,
    withoutCvv2: false,
    base: 'BASE_PROTOCOL_LIVE_2026',
  });

  // Bulk input text state
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState<'cvv2' | 'dumps' | 'fullz'>('cvv2');
  const [bulkPrice, setBulkPrice] = useState<number>(12.00);
  const [bulkBase, setBulkBase] = useState('BASE_BULK_AUTO_PROTOCOL');

  // Settings state
  const [settingsForm, setSettingsForm] = useState<SystemSettings>({
    btcAddress: systemSettings.btcAddress,
    ltcAddress: systemSettings.ltcAddress,
    ethAddress: systemSettings.ethAddress,
  });

  const [loading, setLoading] = useState(false);

  // Single card submission
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleCard.bin || !singleCard.bank || !singleCard.price) {
      alert('Please fill out all required fields (BIN, Bank, Price).');
      return;
    }
    setLoading(true);
    try {
      await onAddCard(singleCard);
      onAddToast(`Card BIN ${singleCard.bin} added to live database!`, 'success');
    } catch (err) {
      console.error(err);
      alert('Error uploading card.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk cards parsing and submission
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      alert('Please paste some card data first.');
      return;
    }

    setLoading(true);
    try {
      const lines = bulkText.split('\n').filter(line => line.trim());
      const cardsToUpload: Omit<CardItem, 'id'>[] = [];

      for (const line of lines) {
        // Simple delimiters support: comma, pipe, space
        const parts = line.split(/[|,]/).map(p => p.trim());
        if (parts.length === 0) continue;

        // Parse with defaults
        const bin = parts[0] || '400000';
        const zip = parts[1] || '10001';
        const bank = parts[2] || 'STANDARD BANK';
        const country = parts[3] || 'US';
        const state = parts[4] || 'NY';
        const expDate = parts[5] || '12/28';

        cardsToUpload.push({
          bin,
          zip,
          bank: bank.toUpperCase(),
          country: country.toUpperCase(),
          state: state.toUpperCase(),
          type: bulkCategory === 'dumps' ? 'Mastercard' : 'Visa',
          creditDebit: 'Credit',
          subtype: 'Platinum',
          expDate,
          discounted: false,
          onlyRefundable: bulkCategory === 'cvv2',
          price: bulkPrice,
          ssn: bulkCategory === 'fullz',
          dob: bulkCategory === 'fullz',
          mmn: false,
          ipAddress: '127.0.0.1',
          lastPaidAmount: false,
          driverLicense: false,
          driverLicenseScan: false,
          atmPin: false,
          attPin: false,
          fullAddress: true,
          phone: true,
          email: true,
          emailPassword: false,
          withoutCvv2: bulkCategory === 'dumps',
          base: bulkBase,
        });
      }

      if (cardsToUpload.length === 0) {
        alert('Could not parse any cards. Verify input format.');
        setLoading(false);
        return;
      }

      await onBulkAddCards(cardsToUpload);
      onAddToast(`Successfully parsed and loaded ${cardsToUpload.length} items to database!`, 'success');
      setBulkText('');
    } catch (err) {
      console.error(err);
      alert('Error uploading bulk cards.');
    } finally {
      setLoading(false);
    }
  };

  // Settings updating
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateSettings(settingsForm);
      onAddToast('Cryptocurrency payment addresses updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      alert('Error updating payment addresses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 md:p-6 shadow-xs select-text text-xs text-gray-700">
      
      {/* Top Banner */}
      <div className="bg-[#bee5eb]/30 border border-[#bee5eb] text-[#0c5460] p-4 rounded-sm flex items-center gap-3 mb-5">
        <ShieldAlert className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-900">🛡️ Live Protocol Admin Control Center</h3>
          <p className="font-semibold text-gray-600 mt-0.5">
            Logged in as <span className="text-[#0c5460] underline">patrickkamande10455@gmail.com</span>. You have master root database keys. All uploaded records and address updates take effect instantly.
          </p>
        </div>
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex border-b border-gray-300 mb-5 gap-1.5 select-none">
        <button
          onClick={() => setAdminTab('single')}
          className={`px-4 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'single'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Upload Single Card
        </button>
        <button
          onClick={() => setAdminTab('bulk')}
          className={`px-4 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'bulk'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Bulk Paste Upload
        </button>
        <button
          onClick={() => setAdminTab('addresses')}
          className={`px-4 py-2 text-xs font-bold border-t border-x rounded-t cursor-pointer transition-all ${
            adminTab === 'addresses'
              ? 'bg-white border-gray-300 text-gray-900 border-b-white z-10 -mb-[1px]'
              : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Cryptocurrency addresses
        </button>
      </div>

      {/* TAB 1: Single upload */}
      {adminTab === 'single' && (
        <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card BIN (First 6 Digits) *</label>
            <input
              type="text"
              maxLength={6}
              value={singleCard.bin}
              onChange={e => setSingleCard(prev => ({ ...prev, bin: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">ZIP Code / Postal Code *</label>
            <input
              type="text"
              value={singleCard.zip}
              onChange={e => setSingleCard(prev => ({ ...prev, zip: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Issuing Bank Name *</label>
            <input
              type="text"
              value={singleCard.bank}
              onChange={e => setSingleCard(prev => ({ ...prev, bank: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Country Code (e.g. US, CA, GB) *</label>
            <input
              type="text"
              maxLength={2}
              value={singleCard.country}
              onChange={e => setSingleCard(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-bold font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">State / Region (e.g. CA, NY) *</label>
            <input
              type="text"
              maxLength={3}
              value={singleCard.state}
              onChange={e => setSingleCard(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 uppercase font-bold font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Expiry Date (MM/YY) *</label>
            <input
              type="text"
              placeholder="e.g. 12/28"
              value={singleCard.expDate}
              onChange={e => setSingleCard(prev => ({ ...prev, expDate: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card brand / Type *</label>
            <select
              value={singleCard.type}
              onChange={e => setSingleCard(prev => ({ ...prev, type: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
              <option value="Discover">Discover</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800 text-rose-800">Item Category *</label>
            <select
              value={singleCard.withoutCvv2 ? 'dumps' : (singleCard.ssn || singleCard.dob ? 'fullz' : 'cvv2')}
              onChange={e => {
                const cat = e.target.value;
                if (cat === 'dumps') {
                  setSingleCard(prev => ({
                    ...prev,
                    withoutCvv2: true,
                    ssn: false,
                    dob: false,
                    onlyRefundable: false
                  }));
                } else if (cat === 'fullz') {
                  setSingleCard(prev => ({
                    ...prev,
                    withoutCvv2: false,
                    ssn: true,
                    dob: true,
                    onlyRefundable: false
                  }));
                } else {
                  setSingleCard(prev => ({
                    ...prev,
                    withoutCvv2: false,
                    ssn: false,
                    dob: false,
                    onlyRefundable: true
                  }));
                }
              }}
              className="border border-rose-300 bg-rose-50/20 text-rose-900 rounded p-2 bg-white font-bold"
            >
              <option value="cvv2">CVV2 Cards</option>
              <option value="dumps">Dumps Track 1/2</option>
              <option value="fullz">Fullz (Complete profile with SSN/DOB)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Credit or Debit *</label>
            <select
              value={singleCard.creditDebit}
              onChange={e => setSingleCard(prev => ({ ...prev, creditDebit: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Card Subtype *</label>
            <select
              value={singleCard.subtype}
              onChange={e => setSingleCard(prev => ({ ...prev, subtype: e.target.value as any }))}
              className="border border-gray-300 rounded p-2 bg-white font-semibold"
            >
              <option value="Classic">Classic</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Signature">Signature</option>
              <option value="Business">Business</option>
              <option value="Corporate">Corporate</option>
              <option value="Infinite">Infinite</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Selling Price (USD $) *</label>
            <input
              type="number"
              step="0.01"
              value={singleCard.price}
              onChange={e => setSingleCard(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold text-emerald-800 font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Database Base Name *</label>
            <input
              type="text"
              value={singleCard.base}
              onChange={e => setSingleCard(prev => ({ ...prev, base: e.target.value }))}
              className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
              required
            />
          </div>

          {/* Quick diagnostic checkbox options */}
          <div className="md:col-span-3 border-t pt-4 mt-2">
            <h4 className="font-extrabold text-gray-900 mb-2 uppercase text-[10px] tracking-wider">Diagnostic Elements included</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={singleCard.ssn}
                  onChange={e => setSingleCard(prev => ({ ...prev, ssn: e.target.checked }))}
                />
                SSN Included
              </label>
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={singleCard.dob}
                  onChange={e => setSingleCard(prev => ({ ...prev, dob: e.target.checked }))}
                />
                DOB Included
              </label>
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={singleCard.fullAddress}
                  onChange={e => setSingleCard(prev => ({ ...prev, fullAddress: e.target.checked }))}
                />
                Full Billing Address
              </label>
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={singleCard.onlyRefundable}
                  onChange={e => setSingleCard(prev => ({ ...prev, onlyRefundable: e.target.checked }))}
                />
                Only Refundable (15 Min Auto-test)
              </label>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 text-[11px] uppercase border border-emerald-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Save Live Card Item
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Bulk upload */}
      {adminTab === 'bulk' && (
        <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-[11px] leading-relaxed text-amber-900 font-semibold">
            <p className="font-extrabold uppercase mb-1">Bulk Parser format instruction:</p>
            <p>Paste card elements line by line. Supported delimiter is the comma (,) or pipe (|).</p>
            <p className="font-mono mt-1 text-[10px] bg-white border p-1 rounded">BIN | ZIP | BANK | COUNTRY | STATE | EXP_DATE</p>
            <p className="mt-1">Example:<br />411111 | 90210 | CHASE BANK | US | CA | 12/28</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Target Category</label>
              <select
                value={bulkCategory}
                onChange={e => setBulkCategory(e.target.value as any)}
                className="border border-gray-300 rounded p-2 bg-white font-semibold"
              >
                <option value="cvv2">CVV2 Cards</option>
                <option value="dumps">Dumps Track 1/2</option>
                <option value="fullz">Fullz (Complete profile with SSN/DOB)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Selling Price per item ($)</label>
              <input
                type="number"
                step="0.01"
                value={bulkPrice}
                onChange={e => setBulkPrice(parseFloat(e.target.value) || 0)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-bold text-emerald-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800">Target Base Name</label>
              <input
                type="text"
                value={bulkBase}
                onChange={e => setBulkBase(e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-800">Paste records below:</label>
            <textarea
              rows={8}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="border border-gray-300 rounded p-2.5 focus:outline-none focus:border-blue-500 font-mono text-[11px] resize-y leading-relaxed text-gray-800"
              placeholder="411111 | 90210 | CHASE BANK | US | CA | 12/28&#10;512345 | 10019 | CITIBANK | US | NY | 05/27"
              required
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] uppercase border border-blue-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading bulk...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Import & Import Live records
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Addresses */}
      {adminTab === 'addresses' && (
        <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-[11px] leading-relaxed text-blue-900 font-semibold flex items-start gap-2">
            <Wallet className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase">Cryptocurrency Deposit Addresses configuration</p>
              <p>These addresses are loaded live in the "Add Funds" modal whenever clients request to deposit Bitcoin, Litecoin, or Ethereum.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" /> Bitcoin (BTC) address:
              </label>
              <input
                type="text"
                value={settingsForm.btcAddress}
                onChange={e => setSettingsForm(prev => ({ ...prev, btcAddress: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                placeholder="BTC Address"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sky-500 rounded-full" /> Litecoin (LTC) address:
              </label>
              <input
                type="text"
                value={settingsForm.ltcAddress}
                onChange={e => setSettingsForm(prev => ({ ...prev, ltcAddress: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                placeholder="LTC Address"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Ethereum (ETH) address:
              </label>
              <input
                type="text"
                value={settingsForm.ethAddress}
                onChange={e => setSettingsForm(prev => ({ ...prev, ethAddress: e.target.value }))}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 font-mono font-semibold"
                placeholder="ETH Address"
                required
              />
            </div>
          </div>

          <div className="flex justify-end border-t pt-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0c5460] hover:bg-[#083a43] text-white font-extrabold px-6 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] uppercase border border-[#0c5460] shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Live payment Options
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
