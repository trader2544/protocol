import { supabase } from '../supabase';
import { CardItem, UserProfile, SupportTicket, NewsItem, WholesalePack, AuctionItem } from '../types';
import { mockCardsList, mockNews, mockWholesalePacks, mockAuctionItems } from '../mockData';

export interface SystemSettings {
  btcAddress: string;
  ltcAddress: string;
  ethAddress: string;
  usdtAddress: string;
  telegramUsername: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ltcAddress: 'LQL9YgSTB968i99684396843968',
  ethAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  usdtAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  telegramUsername: '@protocolcc_bot',
};

// Detect if Supabase is fully configured
export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('placeholder-project') || url.includes('YOUR_PROJECT_ID')) return false;
  if (key.includes('placeholder-anon-key') || key.includes('YOUR_ACTUAL_SUPABASE_ANON_KEY')) return false;
  return true;
};

// --- MAPPING HELPERS ---
function mapProfileToTS(dbProfile: any): UserProfile & { role: 'admin' | 'customer' } {
  const isAdmin = dbProfile.email.toLowerCase() === 'patrickkamande10455@gmail.com';
  const balanceVal = Number(dbProfile.balance ?? 0);
  let status = dbProfile.account_status || (isAdmin ? 'active' : 'inactive');
  
  if (!isAdmin && balanceVal <= 0) {
    status = 'inactive';
  }

  return {
    email: dbProfile.email,
    username: dbProfile.username || dbProfile.email.split('@')[0],
    role: dbProfile.role as 'admin' | 'customer',
    balance: balanceVal,
    crabRating: Number(dbProfile.crab_rating ?? 5),
    crabsDetailsOpen: !!dbProfile.crabs_details_open,
    addFundsOpen: !!dbProfile.add_funds_open,
    lotteryOpen: !!dbProfile.lottery_open,
    giftOpen: !!dbProfile.gift_open,
    accountStatus: status as 'active' | 'inactive',
    creationDate: dbProfile.creation_date || new Date().toISOString().split('T')[0],
    password: dbProfile.password || '',
  };
}

function mapProfileToDB(tsProfile: any): any {
  return {
    email: tsProfile.email,
    username: tsProfile.username,
    role: tsProfile.role,
    balance: tsProfile.balance,
    crab_rating: tsProfile.crabRating,
    crabs_details_open: tsProfile.crabsDetailsOpen,
    add_funds_open: tsProfile.addFundsOpen,
    lottery_open: tsProfile.lotteryOpen,
    gift_open: tsProfile.giftOpen,
    account_status: tsProfile.accountStatus,
    creation_date: tsProfile.creationDate,
    password: tsProfile.password || '',
  };
}

function mapCardToTS(dbCard: any): CardItem {
  const card: CardItem = {
    id: dbCard.id,
    bin: dbCard.bin,
    zip: dbCard.zip,
    bank: dbCard.bank,
    country: dbCard.country,
    state: dbCard.state,
    type: dbCard.type as any,
    creditDebit: dbCard.credit_debit as any,
    subtype: dbCard.subtype as any,
    expDate: dbCard.exp_date,
    discounted: !!dbCard.discounted,
    onlyRefundable: !!dbCard.only_refundable,
    price: Number(dbCard.price),
    ssn: !!dbCard.ssn,
    dob: !!dbCard.dob,
    mmn: !!dbCard.mmn,
    ipAddress: dbCard.ip_address,
    lastPaidAmount: !!dbCard.last_paid_amount,
    driverLicense: !!dbCard.driver_license,
    driverLicenseScan: !!dbCard.driver_license_scan,
    atmPin: !!dbCard.atm_pin,
    attPin: !!dbCard.att_pin,
    fullAddress: !!dbCard.full_address,
    phone: !!dbCard.phone,
    email: !!dbCard.email,
    emailPassword: !!dbCard.email_password,
    withoutCvv2: !!dbCard.without_cvv2,
    base: dbCard.base,
    accountNumber: !!dbCard.account_number,
    routingNumber: !!dbCard.routing_number,
    cardNumber: dbCard.card_number || undefined,
    cvv: dbCard.cvv || undefined,
    fullName: dbCard.full_name || undefined,
    fullAddressStr: dbCard.full_address_str || undefined,
    fullPhone: dbCard.full_phone || undefined,
    fullSsn: dbCard.full_ssn || undefined,
    fullDob: dbCard.full_dob || undefined,
    track1: dbCard.track1 || undefined,
    track2: dbCard.track2 || undefined,
    fullMmn: dbCard.full_mmn || undefined,
    fullAtmPin: dbCard.full_atm_pin || undefined,
    fullDriverLicense: dbCard.full_driver_license || undefined,
    fullEmail: dbCard.full_email || undefined,
    fullEmailPassword: dbCard.full_email_password || undefined,
    fullAccountNumber: dbCard.full_account_number || undefined,
    fullRoutingNumber: dbCard.full_routing_number || undefined,
    
    // Explicit category properties from table columns
    category: dbCard.category || undefined,
    loginUsername: dbCard.login_username || undefined,
    loginPassword: dbCard.login_password || undefined,
    bankBalance: dbCard.bank_balance !== undefined && dbCard.bank_balance !== null ? Number(dbCard.bank_balance) : undefined,
    bankAccountType: dbCard.bank_account_type || undefined,
    bankAccessType: dbCard.bank_access_type || undefined,
    cashappUsername: dbCard.cashapp_username || undefined,
    cashappEmail: dbCard.cashapp_email || undefined,
    cashappPhone: dbCard.cashapp_phone || undefined,
    cashappPin: dbCard.cashapp_pin || undefined,
    cashappHasFunds: dbCard.cashapp_has_funds !== undefined && dbCard.cashapp_has_funds !== null ? !!dbCard.cashapp_has_funds : undefined,
    cashappBalance: dbCard.cashapp_balance !== undefined && dbCard.cashapp_balance !== null ? Number(dbCard.cashapp_balance) : undefined,
    paypalEmail: dbCard.paypal_email || undefined,
    paypalPassword: dbCard.paypal_password || undefined,
    paypalCookies: dbCard.paypal_cookies || undefined,
    paypalHasPaymentMethod: dbCard.paypal_has_payment_method !== undefined && dbCard.paypal_has_payment_method !== null ? !!dbCard.paypal_has_payment_method : undefined,
    paypalBalance: dbCard.paypal_balance !== undefined && dbCard.paypal_balance !== null ? Number(dbCard.paypal_balance) : undefined,
    rdpIp: dbCard.rdp_ip || undefined,
    rdpUsername: dbCard.rdp_username || undefined,
    rdpPassword: dbCard.rdp_password || undefined,
    rdpCountry: dbCard.rdp_country || undefined,
    rdpState: dbCard.rdp_state || undefined,
    rdpCity: dbCard.rdp_city || undefined,
    rdpOs: dbCard.rdp_os || undefined,
    rdpAccessType: dbCard.rdp_access_type || undefined,
    rdpHospeed: dbCard.rdp_hospeed || undefined,
  };

  if (dbCard.full_address_str && dbCard.full_address_str.startsWith('{')) {
    try {
      const extra = JSON.parse(dbCard.full_address_str);
      Object.assign(card, extra);
    } catch (e) {
      // not JSON
    }
  }

  return card;
}

function mapCardToDB(tsCard: any): any {
  const dbCard: any = {
    bin: tsCard.bin,
    zip: tsCard.zip,
    bank: tsCard.bank,
    country: tsCard.country,
    state: tsCard.state,
    type: tsCard.type,
    credit_debit: tsCard.creditDebit,
    subtype: tsCard.subtype,
    exp_date: tsCard.expDate,
    discounted: tsCard.discounted,
    only_refundable: tsCard.onlyRefundable,
    price: tsCard.price,
    ssn: tsCard.ssn,
    dob: tsCard.dob,
    mmn: tsCard.mmn,
    ip_address: tsCard.ipAddress,
    last_paid_amount: tsCard.lastPaidAmount,
    driver_license: tsCard.driverLicense,
    driver_license_scan: tsCard.driverLicenseScan,
    atm_pin: tsCard.atmPin,
    att_pin: tsCard.attPin,
    full_address: tsCard.fullAddress,
    phone: tsCard.phone,
    email: tsCard.email,
    email_password: tsCard.emailPassword,
    without_cvv2: tsCard.withoutCvv2,
    base: tsCard.base,
    account_number: tsCard.accountNumber || false,
    routing_number: tsCard.routingNumber || false,
    card_number: tsCard.cardNumber || null,
    cvv: tsCard.cvv || null,
    full_name: tsCard.fullName || null,
    full_address_str: tsCard.fullAddressStr || null,
    full_phone: tsCard.fullPhone || null,
    full_ssn: tsCard.fullSsn || null,
    full_dob: tsCard.fullDob || null,
    track1: tsCard.track1 || null,
    track2: tsCard.track2 || null,
    full_mmn: tsCard.fullMmn || null,
    full_atm_pin: tsCard.fullAtmPin || null,
    full_driver_license: tsCard.fullDriverLicense || null,
    full_email: tsCard.fullEmail || null,
    full_email_password: tsCard.fullEmailPassword || null,
    full_account_number: tsCard.fullAccountNumber || null,
    full_routing_number: tsCard.fullRoutingNumber || null,
    
    // Explicit category columns mapped natively
    category: tsCard.category || null,
    login_username: tsCard.loginUsername || null,
    login_password: tsCard.loginPassword || null,
    bank_balance: tsCard.bankBalance !== undefined ? tsCard.bankBalance : null,
    bank_account_type: tsCard.bankAccountType || null,
    bank_access_type: tsCard.bankAccessType || null,
    cashapp_username: tsCard.cashappUsername || null,
    cashapp_email: tsCard.cashappEmail || null,
    cashapp_phone: tsCard.cashappPhone || null,
    cashapp_pin: tsCard.cashappPin || null,
    cashapp_has_funds: tsCard.cashappHasFunds !== undefined ? tsCard.cashappHasFunds : null,
    cashapp_balance: tsCard.cashappBalance !== undefined ? tsCard.cashappBalance : null,
    paypal_email: tsCard.paypalEmail || null,
    paypal_password: tsCard.paypalPassword || null,
    paypal_cookies: tsCard.paypalCookies || null,
    paypal_has_payment_method: tsCard.paypalHasPaymentMethod !== undefined ? tsCard.paypalHasPaymentMethod : null,
    paypal_balance: tsCard.paypalBalance !== undefined ? tsCard.paypalBalance : null,
    rdp_ip: tsCard.rdpIp || null,
    rdp_username: tsCard.rdpUsername || null,
    rdp_password: tsCard.rdpPassword || null,
    rdp_country: tsCard.rdpCountry || null,
    rdp_state: tsCard.rdpState || null,
    rdp_city: tsCard.rdpCity || null,
    rdp_os: tsCard.rdpOs || null,
    rdp_access_type: tsCard.rdpAccessType || null,
    rdp_hospeed: tsCard.rdpHospeed || null,
  };

  const extra: any = {};
  if (tsCard.category) extra.category = tsCard.category;
  if (tsCard.loginUsername) extra.loginUsername = tsCard.loginUsername;
  if (tsCard.loginPassword) extra.loginPassword = tsCard.loginPassword;
  if (tsCard.bankBalance !== undefined) extra.bankBalance = tsCard.bankBalance;
  if (tsCard.bankAccountType) extra.bankAccountType = tsCard.bankAccountType;
  if (tsCard.bankAccessType) extra.bankAccessType = tsCard.bankAccessType;
  if (tsCard.cashappUsername) extra.cashappUsername = tsCard.cashappUsername;
  if (tsCard.cashappEmail) extra.cashappEmail = tsCard.cashappEmail;
  if (tsCard.cashappPhone) extra.cashappPhone = tsCard.cashappPhone;
  if (tsCard.cashappPin) extra.cashappPin = tsCard.cashappPin;
  if (tsCard.cashappHasFunds !== undefined) extra.cashappHasFunds = tsCard.cashappHasFunds;
  if (tsCard.cashappBalance !== undefined) extra.cashappBalance = tsCard.cashappBalance;
  if (tsCard.paypalEmail) extra.paypalEmail = tsCard.paypalEmail;
  if (tsCard.paypalPassword) extra.paypalPassword = tsCard.paypalPassword;
  if (tsCard.paypalCookies) extra.paypalCookies = tsCard.paypalCookies;
  if (tsCard.paypalHasPaymentMethod !== undefined) extra.paypalHasPaymentMethod = tsCard.paypalHasPaymentMethod;
  if (tsCard.paypalBalance !== undefined) extra.paypalBalance = tsCard.paypalBalance;
  if (tsCard.rdpIp) extra.rdpIp = tsCard.rdpIp;
  if (tsCard.rdpUsername) extra.rdpUsername = tsCard.rdpUsername;
  if (tsCard.rdpPassword) extra.rdpPassword = tsCard.rdpPassword;
  if (tsCard.rdpCountry) extra.rdpCountry = tsCard.rdpCountry;
  if (tsCard.rdpState) extra.rdpState = tsCard.rdpState;
  if (tsCard.rdpCity) extra.rdpCity = tsCard.rdpCity;
  if (tsCard.rdpOs) extra.rdpOs = tsCard.rdpOs;
  if (tsCard.rdpAccessType) extra.rdpAccessType = tsCard.rdpAccessType;
  if (tsCard.rdpHospeed) extra.rdpHospeed = tsCard.rdpHospeed;

  if (tsCard.ownRent) extra.ownRent = tsCard.ownRent;
  if (tsCard.yearsAtResidence) extra.yearsAtResidence = tsCard.yearsAtResidence;
  if (tsCard.incomeType) extra.incomeType = tsCard.incomeType;
  if (tsCard.employer) extra.employer = tsCard.employer;
  if (tsCard.occupation) extra.occupation = tsCard.occupation;
  if (tsCard.yearsEmployed) extra.yearsEmployed = tsCard.yearsEmployed;
  if (tsCard.workPhone) extra.workPhone = tsCard.workPhone;
  if (tsCard.netMonthlyIncome) extra.netMonthlyIncome = tsCard.netMonthlyIncome;

  if (Object.keys(extra).length > 0 && !tsCard.fullAddressStr) {
    dbCard.full_address_str = JSON.stringify(extra);
  }

  // Prune null or undefined values to avoid column-not-found errors on older schema versions
  Object.keys(dbCard).forEach(key => {
    if (dbCard[key] === null || dbCard[key] === undefined) {
      delete dbCard[key];
    }
  });

  return dbCard;
}

function mapCVVToTS(dbCvv: any): CardItem {
  return {
    id: dbCvv.id,
    bin: dbCvv.bin,
    zip: dbCvv.zip,
    bank: dbCvv.bank,
    country: dbCvv.country,
    state: dbCvv.state,
    type: dbCvv.type as any,
    creditDebit: dbCvv.credit_debit as any,
    subtype: dbCvv.subtype as any,
    expDate: dbCvv.exp_date,
    discounted: !!dbCvv.discounted,
    onlyRefundable: !!dbCvv.only_refundable,
    price: Number(dbCvv.price),
    ssn: !!dbCvv.ssn,
    dob: !!dbCvv.dob,
    mmn: !!dbCvv.mmn,
    ipAddress: dbCvv.ip_address,
    lastPaidAmount: !!dbCvv.last_paid_amount,
    driverLicense: !!dbCvv.driver_license,
    driverLicenseScan: !!dbCvv.driver_license_scan,
    atmPin: !!dbCvv.atm_pin,
    attPin: !!dbCvv.att_pin,
    fullAddress: !!dbCvv.full_address,
    phone: !!dbCvv.phone,
    email: !!dbCvv.email,
    emailPassword: !!dbCvv.email_password,
    withoutCvv2: false,
    base: dbCvv.base,
    cardNumber: dbCvv.card_number || undefined,
    cvv: dbCvv.cvv || undefined,
    fullName: dbCvv.full_name || undefined,
    fullAddressStr: dbCvv.full_address_str || undefined,
    fullPhone: dbCvv.full_phone || undefined,
    fullSsn: dbCvv.full_ssn || undefined,
    fullDob: dbCvv.full_dob || undefined,
    fullMmn: dbCvv.full_mmn || undefined,
    fullAtmPin: dbCvv.full_atm_pin || undefined,
    fullDriverLicense: dbCvv.full_driver_license || undefined,
    fullEmail: dbCvv.full_email || undefined,
    fullEmailPassword: dbCvv.full_email_password || undefined,
    category: 'cvv2',
  };
}

function mapCVVToDB(tsCard: any): any {
  const dbCvv: any = {
    bin: tsCard.bin,
    zip: tsCard.zip,
    bank: tsCard.bank,
    country: tsCard.country,
    state: tsCard.state,
    type: tsCard.type,
    credit_debit: tsCard.creditDebit,
    subtype: tsCard.subtype,
    exp_date: tsCard.expDate,
    discounted: !!tsCard.discounted,
    only_refundable: !!tsCard.onlyRefundable,
    price: tsCard.price,
    ssn: !!tsCard.ssn,
    dob: !!tsCard.dob,
    mmn: !!tsCard.mmn,
    ip_address: tsCard.ipAddress,
    last_paid_amount: !!tsCard.lastPaidAmount,
    driver_license: !!tsCard.driverLicense,
    driver_license_scan: !!tsCard.driverLicenseScan,
    atm_pin: !!tsCard.atmPin,
    att_pin: !!tsCard.attPin,
    full_address: !!tsCard.fullAddress,
    phone: !!tsCard.phone,
    email: !!tsCard.email,
    email_password: !!tsCard.emailPassword,
    base: tsCard.base,
    card_number: tsCard.cardNumber || null,
    cvv: tsCard.cvv || null,
    full_name: tsCard.fullName || null,
    full_address_str: tsCard.fullAddressStr || null,
    full_phone: tsCard.fullPhone || null,
    full_ssn: tsCard.fullSsn || null,
    full_dob: tsCard.fullDob || null,
    full_mmn: tsCard.fullMmn || null,
    full_atm_pin: tsCard.fullAtmPin || null,
    full_driver_license: tsCard.fullDriverLicense || null,
    full_email: tsCard.fullEmail || null,
    full_email_password: tsCard.fullEmailPassword || null,
  };

  Object.keys(dbCvv).forEach(key => {
    if (dbCvv[key] === null || dbCvv[key] === undefined) {
      delete dbCvv[key];
    }
  });

  return dbCvv;
}

function mapDumpToTS(dbDump: any): CardItem {
  return {
    id: dbDump.id,
    bin: dbDump.bin,
    zip: dbDump.zip || '',
    bank: dbDump.bank,
    country: dbDump.country,
    state: dbDump.code || '',
    type: dbDump.type as any,
    creditDebit: dbDump.credit_debit as any,
    subtype: dbDump.subtype as any,
    expDate: dbDump.exp_date,
    discounted: false,
    onlyRefundable: !!dbDump.only_refundable,
    price: Number(dbDump.price),
    ssn: false,
    dob: false,
    mmn: false,
    ipAddress: '',
    lastPaidAmount: false,
    driverLicense: false,
    driverLicenseScan: false,
    atmPin: false,
    attPin: false,
    fullAddress: false,
    phone: false,
    email: false,
    emailPassword: false,
    withoutCvv2: true,
    base: dbDump.base,
    track1: dbDump.track1 || undefined,
    track2: dbDump.track2 || undefined,
    fullAddressStr: dbDump.full_address_str || undefined,
    category: 'dumps',
  };
}

function mapDumpToDB(tsCard: any): any {
  const dbDump: any = {
    bin: tsCard.bin,
    type: tsCard.type,
    credit_debit: tsCard.creditDebit,
    subtype: tsCard.subtype,
    exp_date: tsCard.expDate,
    track1: tsCard.track1 || null,
    track2: tsCard.track2 || null,
    zip: tsCard.zip || null,
    code: tsCard.state || null,
    country: tsCard.country,
    full_address_str: tsCard.fullAddressStr || null,
    bank: tsCard.bank,
    price: tsCard.price,
    only_refundable: !!tsCard.onlyRefundable,
    base: tsCard.base,
  };

  Object.keys(dbDump).forEach(key => {
    if (dbDump[key] === null || dbDump[key] === undefined) {
      delete dbDump[key];
    }
  });

  return dbDump;
}

function mapFullzToTS(dbFullz: any): CardItem {
  const card: CardItem = {
    id: dbFullz.id,
    bin: dbFullz.bin,
    zip: dbFullz.zip,
    bank: dbFullz.bank,
    country: dbFullz.country,
    state: dbFullz.state,
    type: dbFullz.type as any,
    creditDebit: dbFullz.credit_debit as any,
    subtype: dbFullz.subtype as any,
    expDate: dbFullz.exp_date,
    discounted: !!dbFullz.discounted,
    onlyRefundable: !!dbFullz.only_refundable,
    price: Number(dbFullz.price),
    ssn: !!dbFullz.ssn,
    dob: !!dbFullz.dob,
    mmn: !!dbFullz.mmn,
    ipAddress: dbFullz.ip_address || '',
    lastPaidAmount: !!dbFullz.last_paid_amount,
    driverLicense: !!dbFullz.driver_license,
    driverLicenseScan: !!dbFullz.driver_license_scan,
    atmPin: !!dbFullz.atm_pin,
    attPin: !!dbFullz.att_pin,
    fullAddress: !!dbFullz.full_address,
    phone: !!dbFullz.phone,
    email: !!dbFullz.email,
    emailPassword: !!dbFullz.email_password,
    withoutCvv2: !!dbFullz.without_cvv2,
    base: dbFullz.base,
    cardNumber: dbFullz.card_number || undefined,
    cvv: dbFullz.cvv || undefined,
    fullName: dbFullz.full_name || undefined,
    fullAddressStr: dbFullz.full_address_str || undefined,
    fullPhone: dbFullz.full_phone || undefined,
    fullSsn: dbFullz.full_ssn || undefined,
    fullDob: dbFullz.full_dob || undefined,
    fullMmn: dbFullz.full_mmn || undefined,
    fullAtmPin: dbFullz.full_atm_pin || undefined,
    fullDriverLicense: dbFullz.full_driver_license || undefined,
    fullEmail: dbFullz.full_email || undefined,
    fullEmailPassword: dbFullz.full_email_password || undefined,
    fullAccountNumber: dbFullz.full_account_number || undefined,
    fullRoutingNumber: dbFullz.full_routing_number || undefined,
    ownRent: dbFullz.own_rent || undefined,
    yearsAtResidence: dbFullz.years_at_residence || undefined,
    incomeType: dbFullz.income_type || undefined,
    employer: dbFullz.employer || undefined,
    occupation: dbFullz.occupation || undefined,
    yearsEmployed: dbFullz.years_employed || undefined,
    workPhone: dbFullz.work_phone || undefined,
    netMonthlyIncome: dbFullz.net_monthly_income || undefined,
    category: 'fullz',
  };

  return card;
}

function mapFullzToDB(tsFullz: any): any {
  const dbFullz: any = {
    bin: tsFullz.bin,
    zip: tsFullz.zip,
    bank: tsFullz.bank,
    country: tsFullz.country,
    state: tsFullz.state,
    type: tsFullz.type,
    credit_debit: tsFullz.creditDebit,
    subtype: tsFullz.subtype,
    exp_date: tsFullz.expDate,
    discounted: !!tsFullz.discounted,
    only_refundable: !!tsFullz.onlyRefundable,
    price: tsFullz.price,
    ssn: !!tsFullz.ssn,
    dob: !!tsFullz.dob,
    mmn: !!tsFullz.mmn,
    ip_address: tsFullz.ipAddress || null,
    last_paid_amount: !!tsFullz.lastPaidAmount,
    driver_license: !!tsFullz.driverLicense,
    driver_license_scan: !!tsFullz.driverLicenseScan,
    atm_pin: !!tsFullz.atmPin,
    att_pin: !!tsFullz.attPin,
    full_address: !!tsFullz.fullAddress,
    phone: !!tsFullz.phone,
    email: !!tsFullz.email,
    email_password: !!tsFullz.emailPassword,
    base: tsFullz.base,
    card_number: tsFullz.cardNumber || null,
    cvv: tsFullz.cvv || null,
    full_name: tsFullz.fullName || null,
    full_address_str: tsFullz.fullAddressStr || null,
    full_phone: tsFullz.fullPhone || null,
    full_ssn: tsFullz.fullSsn || null,
    full_dob: tsFullz.fullDob || null,
    full_mmn: tsFullz.fullMmn || null,
    full_atm_pin: tsFullz.fullAtmPin || null,
    full_driver_license: tsFullz.fullDriverLicense || null,
    full_email: tsFullz.fullEmail || null,
    full_email_password: tsFullz.fullEmailPassword || null,
    full_account_number: tsFullz.fullAccountNumber || null,
    full_routing_number: tsFullz.fullRoutingNumber || null,
    own_rent: tsFullz.ownRent || null,
    years_at_residence: tsFullz.yearsAtResidence || null,
    income_type: tsFullz.incomeType || null,
    employer: tsFullz.employer || null,
    occupation: tsFullz.occupation || null,
    years_employed: tsFullz.yearsEmployed || null,
    work_phone: tsFullz.workPhone || null,
    net_monthly_income: tsFullz.netMonthlyIncome || null,
  };

  Object.keys(dbFullz).forEach(key => {
    if (dbFullz[key] === null || dbFullz[key] === undefined) {
      delete dbFullz[key];
    }
  });

  return dbFullz;
}

function mapBanklogToTS(db: any): CardItem {
  return {
    id: db.id,
    bin: 'N/A',
    zip: 'N/A',
    bank: db.bank,
    country: db.country || 'US',
    state: db.state || 'N/A',
    type: 'Visa',
    creditDebit: 'Debit',
    subtype: 'Classic',
    expDate: 'N/A',
    discounted: false,
    onlyRefundable: false,
    price: Number(db.price),
    ssn: false,
    dob: false,
    mmn: false,
    ipAddress: 'N/A',
    lastPaidAmount: false,
    driverLicense: false,
    driverLicenseScan: false,
    atmPin: false,
    attPin: false,
    fullAddress: false,
    phone: false,
    email: false,
    emailPassword: false,
    withoutCvv2: true,
    base: db.base || 'BASE_PROTOCOL_LIVE_2026',
    category: 'banklogs',
    loginUsername: db.login_username || undefined,
    loginPassword: db.login_password || undefined,
    bankBalance: Number(db.bank_balance || 0),
    bankAccountType: db.bank_account_type || undefined,
    bankAccessType: db.bank_access_type || undefined,
  };
}

function mapBanklogToDB(ts: any): any {
  const db: any = {
    bank: ts.bank,
    bank_account_type: ts.bankAccountType || 'Checking',
    bank_access_type: ts.bankAccessType || 'Online Login',
    bank_balance: ts.bankBalance || 0,
    country: ts.country || 'US',
    state: ts.state || null,
    login_username: ts.loginUsername || null,
    login_password: ts.loginPassword || null,
    base: ts.base || 'BASE_PROTOCOL_LIVE_2026',
    price: ts.price || 0,
  };
  Object.keys(db).forEach(key => {
    if (db[key] === null || db[key] === undefined) {
      delete db[key];
    }
  });
  return db;
}

function mapCashAppToTS(db: any): CardItem {
  return {
    id: db.id,
    bin: 'N/A',
    zip: 'N/A',
    bank: 'CashApp',
    country: 'US',
    state: 'N/A',
    type: 'Visa',
    creditDebit: 'Debit',
    subtype: 'Classic',
    expDate: 'N/A',
    discounted: false,
    onlyRefundable: false,
    price: Number(db.price),
    ssn: false,
    dob: false,
    mmn: false,
    ipAddress: 'N/A',
    lastPaidAmount: false,
    driverLicense: false,
    driverLicenseScan: false,
    atmPin: false,
    attPin: false,
    fullAddress: false,
    phone: false,
    email: false,
    emailPassword: false,
    withoutCvv2: true,
    base: db.base || 'BASE_PROTOCOL_LIVE_2026',
    category: 'cashapp',
    cashappUsername: db.cashapp_username || undefined,
    cashappBalance: Number(db.cashapp_balance || 0),
    cashappPin: db.cashapp_pin || undefined,
    cashappPhone: db.cashapp_phone || undefined,
    cashappEmail: db.cashapp_email || undefined,
    cashappHasFunds: !!db.cashapp_has_funds,
  };
}

function mapCashAppToDB(ts: any): any {
  const db: any = {
    cashapp_username: ts.cashappUsername,
    cashapp_balance: ts.cashappBalance || 0,
    cashapp_pin: ts.cashappPin || null,
    cashapp_phone: ts.cashappPhone || null,
    cashapp_email: ts.cashappEmail || null,
    cashapp_has_funds: !!ts.cashappHasFunds,
    base: ts.base || 'BASE_PROTOCOL_LIVE_2026',
    price: ts.price || 0,
  };
  Object.keys(db).forEach(key => {
    if (db[key] === null || db[key] === undefined) {
      delete db[key];
    }
  });
  return db;
}

function mapPayPalToTS(db: any): CardItem {
  return {
    id: db.id,
    bin: 'N/A',
    zip: 'N/A',
    bank: 'PayPal',
    country: 'US',
    state: 'N/A',
    type: 'Visa',
    creditDebit: 'Debit',
    subtype: 'Classic',
    expDate: 'N/A',
    discounted: false,
    onlyRefundable: false,
    price: Number(db.price),
    ssn: false,
    dob: false,
    mmn: false,
    ipAddress: 'N/A',
    lastPaidAmount: false,
    driverLicense: false,
    driverLicenseScan: false,
    atmPin: false,
    attPin: false,
    fullAddress: false,
    phone: false,
    email: false,
    emailPassword: false,
    withoutCvv2: true,
    base: db.base || 'BASE_PROTOCOL_LIVE_2026',
    category: 'paypal',
    paypalEmail: db.paypal_email || undefined,
    paypalPassword: db.paypal_password || undefined,
    paypalBalance: Number(db.paypal_balance || 0),
    paypalHasPaymentMethod: !!db.paypal_has_payment_method,
    paypalCookies: db.paypal_cookies || undefined,
  };
}

function mapPayPalToDB(ts: any): any {
  const db: any = {
    paypal_email: ts.paypalEmail,
    paypal_password: ts.paypalPassword || null,
    paypal_balance: ts.paypalBalance || 0,
    paypal_has_payment_method: !!ts.paypalHasPaymentMethod,
    paypal_cookies: ts.paypalCookies || null,
    base: ts.base || 'BASE_PROTOCOL_LIVE_2026',
    price: ts.price || 0,
  };
  Object.keys(db).forEach(key => {
    if (db[key] === null || db[key] === undefined) {
      delete db[key];
    }
  });
  return db;
}

function mapRDPToTS(db: any): CardItem {
  return {
    id: db.id,
    bin: 'N/A',
    zip: 'N/A',
    bank: 'RDP',
    country: db.rdp_country || 'US',
    state: db.rdp_state || 'N/A',
    type: 'Visa',
    creditDebit: 'Debit',
    subtype: 'Classic',
    expDate: 'N/A',
    discounted: false,
    onlyRefundable: false,
    price: Number(db.price),
    ssn: false,
    dob: false,
    mmn: false,
    ipAddress: db.rdp_ip || 'N/A',
    lastPaidAmount: false,
    driverLicense: false,
    driverLicenseScan: false,
    atmPin: false,
    attPin: false,
    fullAddress: false,
    phone: false,
    email: false,
    emailPassword: false,
    withoutCvv2: true,
    base: db.base || 'BASE_PROTOCOL_LIVE_2026',
    category: 'rdp',
    rdpIp: db.rdp_ip || undefined,
    rdpUsername: db.rdp_username || undefined,
    rdpPassword: db.rdp_password || undefined,
    rdpCountry: db.rdp_country || undefined,
    rdpState: db.rdp_state || undefined,
    rdpCity: db.rdp_city || undefined,
    rdpOs: db.rdp_os || undefined,
    rdpAccessType: db.rdp_access_type || undefined,
    rdpHospeed: db.rdp_hospeed || undefined,
  };
}

function mapRDPToDB(ts: any): any {
  const db: any = {
    rdp_ip: ts.rdpIp,
    rdp_username: ts.rdpUsername,
    rdp_password: ts.rdpPassword,
    rdp_country: ts.rdpCountry || 'US',
    rdp_state: ts.rdpState || null,
    rdp_city: ts.rdpCity || null,
    rdp_os: ts.rdpOs || 'Windows Server 2022',
    rdp_access_type: ts.rdpAccessType || 'Admin',
    rdp_hospeed: ts.rdpHospeed || null,
    base: ts.base || 'BASE_PROTOCOL_LIVE_2026',
    price: ts.price || 0,
  };
  Object.keys(db).forEach(key => {
    if (db[key] === null || db[key] === undefined) {
      delete db[key];
    }
  });
  return db;
}

function mapAuctionToTS(dbAuc: any): AuctionItem {
  return {
    id: dbAuc.id,
    card: {
      bin: dbAuc.bin,
      type: dbAuc.brand as any, // Brand (Visa, Mastercard, etc.)
      subtype: dbAuc.type as any, // Subtype (Classic, Platinum, etc.)
      bank: dbAuc.bank,
      country: dbAuc.country,
      state: dbAuc.state,
      expDate: dbAuc.expiry,
    },
    currentBid: Number(dbAuc.current_bid),
    myBid: Number(dbAuc.my_bid),
    bidsCount: Number(dbAuc.bids_count),
    endTime: dbAuc.end_time,
  };
}

// LOCAL STORAGE FALLBACKS (to keep the AI studio demo perfectly online if keys aren't set)
function getLocalProfile(email: string): any {
  const key = `profile_${email.toLowerCase()}`;
  const stored = localStorage.getItem(key);
  const isAdmin = email.toLowerCase() === 'patrickkamande10455@gmail.com';
  
  if (stored) {
    const prof = JSON.parse(stored);
    if (!isAdmin && (prof.balance ?? 0) <= 0) {
      prof.accountStatus = 'inactive';
    }
    return prof;
  }
  
  const newProf = {
    email: email.toLowerCase(),
    username: email.split('@')[0],
    role: isAdmin ? 'admin' : 'customer',
    balance: isAdmin ? 1000.00 : 0.00,
    crabRating: isAdmin ? 100 : 5,
    crabsDetailsOpen: false,
    addFundsOpen: false,
    lotteryOpen: false,
    giftOpen: false,
    accountStatus: isAdmin ? 'active' : 'inactive',
    creationDate: new Date().toISOString().split('T')[0],
  };
  localStorage.setItem(key, JSON.stringify(newProf));
  return newProf;
}

function saveLocalProfile(email: string, profile: any) {
  localStorage.setItem(`profile_${email.toLowerCase()}`, JSON.stringify(profile));
}

// --- CORE EXPORTED DATABASE SERVICES ---

// 1. User profile operations
export async function getUserProfile(email: string): Promise<UserProfile & { role: 'admin' | 'customer' }> {
  const normEmail = email.toLowerCase();
  
  if (!isSupabaseConfigured()) {
    return getLocalProfile(normEmail);
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normEmail)
      .single();

    if (error || !data) {
      // Create user profile in profiles table
      const isAdmin = normEmail === 'patrickkamande10455@gmail.com';
      const newProfile = {
        id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
        email: normEmail,
        username: email.split('@')[0],
        role: isAdmin ? 'admin' : 'customer',
        balance: isAdmin ? 1000.00 : 0.00,
        crab_rating: isAdmin ? 100 : 5,
        crabs_details_open: false,
        add_funds_open: false,
        lottery_open: false,
        gift_open: false,
        account_status: isAdmin ? 'active' : 'inactive',
        creation_date: new Date().toISOString().split('T')[0],
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile);

      if (insertError) {
        console.warn("Failed to insert profile, using local:", insertError);
        return getLocalProfile(normEmail);
      }
      return mapProfileToTS(newProfile);
    }
    return mapProfileToTS(data);
  } catch (err) {
    console.error("Supabase profile error, falling back:", err);
    return getLocalProfile(normEmail);
  }
}

export async function registerUserProfile(email: string, username: string, password?: string): Promise<UserProfile & { role: 'admin' | 'customer' }> {
  const normEmail = email.toLowerCase();

  if (!isSupabaseConfigured()) {
    const profile = getLocalProfile(normEmail);
    profile.username = username.trim() || profile.username;
    if (password) profile.password = password;
    saveLocalProfile(normEmail, profile);
    return profile;
  }

  try {
    // Check if exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', normEmail)
      .single();

    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    // SignUp in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normEmail,
      password: password || 'defaultpassword123',
      options: {
        data: {
          username: username.trim(),
        }
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Signup failed");
    }

    // Trigger should auto-insert profile, let's select it
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normEmail)
      .single();

    if (profError || !profile) {
      // Manual fallback insert if trigger wasn't run
      const isAdmin = normEmail === 'patrickkamande10455@gmail.com';
      const newProf = {
        id: authData.user.id,
        email: normEmail,
        username: username.trim(),
        role: isAdmin ? 'admin' : 'customer',
        balance: isAdmin ? 1000.00 : 0.00,
        crab_rating: isAdmin ? 100 : 5,
        crabs_details_open: false,
        add_funds_open: false,
        lottery_open: false,
        gift_open: false,
        account_status: isAdmin ? 'active' : 'inactive',
        creation_date: new Date().toISOString().split('T')[0],
      };
      await supabase.from('profiles').insert(newProf);
      return mapProfileToTS(newProf);
    }

    return mapProfileToTS(profile);
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      throw err;
    }
    console.error("Supabase register error, fallback to local:", err);
    const local = getLocalProfile(normEmail);
    local.username = username;
    if (password) local.password = password;
    saveLocalProfile(normEmail, local);
    return local;
  }
}

export async function updateUserProfile(email: string, updates: Partial<UserProfile & { role: 'admin' | 'customer' }>): Promise<void> {
  const normEmail = email.toLowerCase();

  if (!isSupabaseConfigured()) {
    const prof = getLocalProfile(normEmail);
    Object.assign(prof, updates);
    saveLocalProfile(normEmail, prof);
    return;
  }

  try {
    const dbUpdates = mapProfileToDB(updates);
    // Remove undefined
    Object.keys(dbUpdates).forEach(k => dbUpdates[k] === undefined && delete dbUpdates[k]);

    // Handle password update via auth if specified, then delete from profiles update
    if (updates.password) {
      try {
        await supabase.auth.updateUser({ password: updates.password });
      } catch (authErr) {
        console.error("Supabase auth password update failed:", authErr);
      }
    }
    delete dbUpdates.password;

    // Do not update email in profiles either to avoid errors
    delete dbUpdates.email;

    await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('email', normEmail);
  } catch (err) {
    console.error("Supabase update profile failed:", err);
    const prof = getLocalProfile(normEmail);
    Object.assign(prof, updates);
    saveLocalProfile(normEmail, prof);
  }
}

// 2. Card database operations (CVV2, Dumps, Fullz, and non-card types like banklogs, cashapp, paypal, rdp)
export async function getCards(): Promise<CardItem[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('cards_list');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('cards_list', JSON.stringify(mockCardsList));
    return mockCardsList;
  }

  try {
    const [cardsRes, cvvsRes, dumpsRes, fullzRes, banklogsRes, cashappRes, paypalRes, rdpRes] = await Promise.all([
      supabase.from('cards').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
      supabase.from('cvvs').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
      supabase.from('dumps').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
      supabase.from('fullz').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
      supabase.from('banklogs').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
      supabase.from('cashapp').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
      supabase.from('paypal').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
      supabase.from('rdp').select('*').eq('status', 'live').then(res => res, err => ({ data: [], error: err })),
    ]);

    const cardsList = (cardsRes.data || []).map(mapCardToTS);
    const cvvsList = (cvvsRes.data || []).map(mapCVVToTS);
    const dumpsList = (dumpsRes.data || []).map(mapDumpToTS);
    const fullzList = (fullzRes.data || []).map(mapFullzToTS);
    const banklogsList = (banklogsRes.data || []).map(mapBanklogToTS);
    const cashappList = (cashappRes.data || []).map(mapCashAppToTS);
    const paypalList = (paypalRes.data || []).map(mapPayPalToTS);
    const rdpList = (rdpRes.data || []).map(mapRDPToTS);

    const combined = [
      ...cvvsList,
      ...dumpsList,
      ...fullzList,
      ...banklogsList,
      ...cashappList,
      ...paypalList,
      ...rdpList,
      ...cardsList
    ];

    return combined;
  } catch (err) {
    console.error("Supabase getCards failed, using local:", err);
    const stored = localStorage.getItem('cards_list');
    if (stored) return JSON.parse(stored);
    return mockCardsList;
  }
}

export async function updateCard(cardId: string, updates: Partial<CardItem>): Promise<CardItem> {
  if (!isSupabaseConfigured()) {
    const cards = await getCards();
    const idx = cards.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      cards[idx] = { ...cards[idx], ...updates };
      localStorage.setItem('cards_list', JSON.stringify(cards));
      return cards[idx];
    }
    throw new Error("Card not found");
  }

  try {
    // If the category is cvv2, update the cvvs table first
    if (updates.category === 'cvv2' || updates.cvv !== undefined) {
      const dbCvv = mapCVVToDB(updates);
      Object.keys(dbCvv).forEach(k => dbCvv[k] === undefined && delete dbCvv[k]);
      const { data, error } = await supabase.from('cvvs').update(dbCvv).eq('id', cardId).select('*').single();
      if (!error && data) return mapCVVToTS(data);
    }
    
    // If the category is dumps, update the dumps table first
    if (updates.category === 'dumps' || updates.track1 !== undefined || updates.track2 !== undefined) {
      const dbDump = mapDumpToDB(updates);
      Object.keys(dbDump).forEach(k => dbDump[k] === undefined && delete dbDump[k]);
      const { data, error } = await supabase.from('dumps').update(dbDump).eq('id', cardId).select('*').single();
      if (!error && data) return mapDumpToTS(data);
    }

    // If the category is fullz
    if (updates.category === 'fullz') {
      const dbFullz = mapFullzToDB(updates);
      Object.keys(dbFullz).forEach(k => dbFullz[k] === undefined && delete dbFullz[k]);
      const { data, error } = await supabase.from('fullz').update(dbFullz).eq('id', cardId).select('*').single();
      if (!error && data) return mapFullzToTS(data);
    }

    // If the category is banklogs
    if (updates.category === 'banklogs') {
      const dbBanklog = mapBanklogToDB(updates);
      Object.keys(dbBanklog).forEach(k => dbBanklog[k] === undefined && delete dbBanklog[k]);
      const { data, error } = await supabase.from('banklogs').update(dbBanklog).eq('id', cardId).select('*').single();
      if (!error && data) return mapBanklogToTS(data);
    }

    // If the category is cashapp
    if (updates.category === 'cashapp') {
      const dbCashApp = mapCashAppToDB(updates);
      Object.keys(dbCashApp).forEach(k => dbCashApp[k] === undefined && delete dbCashApp[k]);
      const { data, error } = await supabase.from('cashapp').update(dbCashApp).eq('id', cardId).select('*').single();
      if (!error && data) return mapCashAppToTS(data);
    }

    // If the category is paypal
    if (updates.category === 'paypal') {
      const dbPayPal = mapPayPalToDB(updates);
      Object.keys(dbPayPal).forEach(k => dbPayPal[k] === undefined && delete dbPayPal[k]);
      const { data, error } = await supabase.from('paypal').update(dbPayPal).eq('id', cardId).select('*').single();
      if (!error && data) return mapPayPalToTS(data);
    }

    // If the category is rdp
    if (updates.category === 'rdp') {
      const dbRdp = mapRDPToDB(updates);
      Object.keys(dbRdp).forEach(k => dbRdp[k] === undefined && delete dbRdp[k]);
      const { data, error } = await supabase.from('rdp').update(dbRdp).eq('id', cardId).select('*').single();
      if (!error && data) return mapRDPToTS(data);
    }

    // Try updating the general cards table
    const dbCard = mapCardToDB(updates);
    Object.keys(dbCard).forEach(k => dbCard[k] === undefined && delete dbCard[k]);
    const { data, error } = await supabase.from('cards').update(dbCard).eq('id', cardId).select('*').single();
    if (!error && data) {
      return mapCardToTS(data);
    }

    // Secondary sequential updates as fallback
    const dbCvv = mapCVVToDB(updates);
    Object.keys(dbCvv).forEach(k => dbCvv[k] === undefined && delete dbCvv[k]);
    const cvvUpdate = await supabase.from('cvvs').update(dbCvv).eq('id', cardId).select('*').single();
    if (!cvvUpdate.error && cvvUpdate.data) return mapCVVToTS(cvvUpdate.data);

    const dbDump = mapDumpToDB(updates);
    Object.keys(dbDump).forEach(k => dbDump[k] === undefined && delete dbDump[k]);
    const dumpUpdate = await supabase.from('dumps').update(dbDump).eq('id', cardId).select('*').single();
    if (!dumpUpdate.error && dumpUpdate.data) return mapDumpToTS(dumpUpdate.data);

    const dbFullz = mapFullzToDB(updates);
    Object.keys(dbFullz).forEach(k => dbFullz[k] === undefined && delete dbFullz[k]);
    const fullzUpdate = await supabase.from('fullz').update(dbFullz).eq('id', cardId).select('*').single();
    if (!fullzUpdate.error && fullzUpdate.data) return mapFullzToTS(fullzUpdate.data);

    const dbBanklog = mapBanklogToDB(updates);
    Object.keys(dbBanklog).forEach(k => dbBanklog[k] === undefined && delete dbBanklog[k]);
    const banklogUpdate = await supabase.from('banklogs').update(dbBanklog).eq('id', cardId).select('*').single();
    if (!banklogUpdate.error && banklogUpdate.data) return mapBanklogToTS(banklogUpdate.data);

    const dbCashApp = mapCashAppToDB(updates);
    Object.keys(dbCashApp).forEach(k => dbCashApp[k] === undefined && delete dbCashApp[k]);
    const cashappUpdate = await supabase.from('cashapp').update(dbCashApp).eq('id', cardId).select('*').single();
    if (!cashappUpdate.error && cashappUpdate.data) return mapCashAppToTS(cashappUpdate.data);

    const dbPayPal = mapPayPalToDB(updates);
    Object.keys(dbPayPal).forEach(k => dbPayPal[k] === undefined && delete dbPayPal[k]);
    const paypalUpdate = await supabase.from('paypal').update(dbPayPal).eq('id', cardId).select('*').single();
    if (!paypalUpdate.error && paypalUpdate.data) return mapPayPalToTS(paypalUpdate.data);

    const dbRdp = mapRDPToDB(updates);
    Object.keys(dbRdp).forEach(k => dbRdp[k] === undefined && delete dbRdp[k]);
    const rdpUpdate = await supabase.from('rdp').update(dbRdp).eq('id', cardId).select('*').single();
    if (!rdpUpdate.error && rdpUpdate.data) return mapRDPToTS(rdpUpdate.data);

    throw error || new Error("Failed to update card across all tables");
  } catch (err) {
    console.error("Supabase updateCard error:", err);
    const cards = await getCards();
    const idx = cards.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      cards[idx] = { ...cards[idx], ...updates };
      localStorage.setItem('cards_list', JSON.stringify(cards));
      return cards[idx];
    }
    throw err;
  }
}

export async function addCard(card: Omit<CardItem, 'id'>): Promise<CardItem> {
  if (!isSupabaseConfigured()) {
    const cards = await getCards();
    const newCard = { id: Math.random().toString(36).substring(2), ...card } as CardItem;
    cards.push(newCard);
    localStorage.setItem('cards_list', JSON.stringify(cards));
    return newCard;
  }

  try {
    if (card.category === 'cvv2') {
      const dbCvv = mapCVVToDB(card);
      const { data, error } = await supabase.from('cvvs').insert({ ...dbCvv, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapCVVToTS(data);
    } else if (card.category === 'dumps') {
      const dbDump = mapDumpToDB(card);
      const { data, error } = await supabase.from('dumps').insert({ ...dbDump, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapDumpToTS(data);
    } else if (card.category === 'fullz') {
      const dbFullz = mapFullzToDB(card);
      const { data, error } = await supabase.from('fullz').insert({ ...dbFullz, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapFullzToTS(data);
    } else if (card.category === 'banklogs') {
      const dbBanklog = mapBanklogToDB(card);
      const { data, error } = await supabase.from('banklogs').insert({ ...dbBanklog, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapBanklogToTS(data);
    } else if (card.category === 'cashapp') {
      const dbCashApp = mapCashAppToDB(card);
      const { data, error } = await supabase.from('cashapp').insert({ ...dbCashApp, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapCashAppToTS(data);
    } else if (card.category === 'paypal') {
      const dbPayPal = mapPayPalToDB(card);
      const { data, error } = await supabase.from('paypal').insert({ ...dbPayPal, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapPayPalToTS(data);
    } else if (card.category === 'rdp') {
      const dbRdp = mapRDPToDB(card);
      const { data, error } = await supabase.from('rdp').insert({ ...dbRdp, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapRDPToTS(data);
    } else {
      const dbCard = mapCardToDB(card);
      const { data, error } = await supabase.from('cards').insert({ ...dbCard, status: 'live' }).select('*').single();
      if (error) throw error;
      return mapCardToTS(data);
    }
  } catch (err) {
    console.error("Supabase addCard error, falling back:", err);
    const cards = await getCards();
    const newCard = { id: Math.random().toString(36).substring(2), ...card } as CardItem;
    cards.push(newCard);
    localStorage.setItem('cards_list', JSON.stringify(cards));
    return newCard;
  }
}

export async function deleteCard(cardId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const cards = await getCards();
    const filtered = cards.filter(c => c.id !== cardId);
    localStorage.setItem('cards_list', JSON.stringify(filtered));
    return;
  }

  try {
    await Promise.all([
      supabase.from('cards').delete().eq('id', cardId),
      supabase.from('cvvs').delete().eq('id', cardId),
      supabase.from('dumps').delete().eq('id', cardId),
      supabase.from('fullz').delete().eq('id', cardId),
      supabase.from('banklogs').delete().eq('id', cardId),
      supabase.from('cashapp').delete().eq('id', cardId),
      supabase.from('paypal').delete().eq('id', cardId),
      supabase.from('rdp').delete().eq('id', cardId)
    ]);
  } catch (err) {
    console.error("Supabase deleteCard failed:", err);
  }
}

// 3. News bulletins
export async function getNews(): Promise<NewsItem[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('news_list');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('news_list', JSON.stringify(mockNews));
    return mockNews;
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    const list = data || [];

    return list.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      important: n.important,
      date: typeof n.date === 'string' ? n.date.split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  } catch (err) {
    console.error("Supabase getNews failed, using local:", err);
    const stored = localStorage.getItem('news_list');
    if (stored) return JSON.parse(stored);
    return mockNews;
  }
}

export async function addNewsItem(news: Omit<NewsItem, 'id'>): Promise<NewsItem> {
  if (!isSupabaseConfigured()) {
    const list = await getNews();
    const item = { id: Math.random().toString(36).substring(2), ...news } as NewsItem;
    list.unshift(item);
    localStorage.setItem('news_list', JSON.stringify(list));
    return item;
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .insert({
        title: news.title,
        content: news.content,
        important: news.important,
        date: new Date(news.date).toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      important: data.important,
      date: data.date.split('T')[0],
    };
  } catch (err) {
    console.error("Supabase addNews failed:", err);
    const list = await getNews();
    const item = { id: Math.random().toString(36).substring(2), ...news } as NewsItem;
    list.unshift(item);
    localStorage.setItem('news_list', JSON.stringify(list));
    return item;
  }
}

export async function deleteNewsItem(newsId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const list = await getNews();
    const filtered = list.filter(n => n.id !== newsId);
    localStorage.setItem('news_list', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase deleteNewsItem error:", err);
  }
}

export async function updateNewsItem(newsId: string, updates: Partial<NewsItem>): Promise<NewsItem> {
  if (!isSupabaseConfigured()) {
    const list = await getNews();
    const idx = list.findIndex(n => n.id === newsId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('news_list', JSON.stringify(list));
      return list[idx];
    }
    throw new Error("News item not found");
  }

  try {
    const dbNews: any = {};
    if (updates.title !== undefined) dbNews.title = updates.title;
    if (updates.content !== undefined) dbNews.content = updates.content;
    if (updates.important !== undefined) dbNews.important = updates.important;
    if (updates.date !== undefined) dbNews.date = new Date(updates.date).toISOString();

    const { data, error } = await supabase
      .from('news')
      .update(dbNews)
      .eq('id', newsId)
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      important: data.important,
      date: data.date.split('T')[0],
    };
  } catch (err) {
    console.error("Supabase updateNewsItem error:", err);
    const list = await getNews();
    const idx = list.findIndex(n => n.id === newsId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('news_list', JSON.stringify(list));
      return list[idx];
    }
    throw err;
  }
}

// 4. Wholesale packs
export async function getWholesalePacks(): Promise<WholesalePack[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('wholesale_list');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('wholesale_list', JSON.stringify(mockWholesalePacks));
    return mockWholesalePacks;
  }

  try {
    const { data, error } = await supabase
      .from('wholesale_packs')
      .select('*');

    if (error) throw error;
    const list = data || [];

    return list.map(p => ({
      id: p.id,
      name: p.name,
      count: Number(p.count),
      price: Number(p.price),
      description: p.description,
      country: p.country,
      type: p.type,
      cardsDetails: p.cardsDetails || (p.cards_details ? (typeof p.cards_details === 'string' ? JSON.parse(p.cards_details) : p.cards_details) : undefined),
    }));
  } catch (err) {
    console.error("Supabase getWholesale failed, using local:", err);
    const stored = localStorage.getItem('wholesale_list');
    if (stored) return JSON.parse(stored);
    return mockWholesalePacks;
  }
}

export async function deleteWholesalePack(packId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const list = await getWholesalePacks();
    const filtered = list.filter(p => p.id !== packId);
    localStorage.setItem('wholesale_list', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('wholesale_packs')
      .delete()
      .eq('id', packId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase deleteWholesalePack error:", err);
  }
}

export async function updateWholesalePack(packId: string, updates: Partial<WholesalePack>): Promise<WholesalePack> {
  if (!isSupabaseConfigured()) {
    const list = await getWholesalePacks();
    const idx = list.findIndex(p => p.id === packId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('wholesale_list', JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Wholesale pack not found");
  }

  try {
    const dbPack: any = {};
    if (updates.name !== undefined) dbPack.name = updates.name;
    if (updates.count !== undefined) dbPack.count = updates.count;
    if (updates.price !== undefined) dbPack.price = updates.price;
    if (updates.description !== undefined) dbPack.description = updates.description;
    if (updates.country !== undefined) dbPack.country = updates.country;
    if (updates.type !== undefined) dbPack.type = updates.type;
    if (updates.cardsDetails !== undefined) dbPack.cards_details = JSON.stringify(updates.cardsDetails);

    const { data, error } = await supabase
      .from('wholesale_packs')
      .update(dbPack)
      .eq('id', packId)
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      count: Number(data.count),
      price: Number(data.price),
      description: data.description,
      country: data.country,
      type: data.type,
      cardsDetails: data.cards_details ? (typeof data.cards_details === 'string' ? JSON.parse(data.cards_details) : data.cards_details) : undefined,
    };
  } catch (err) {
    console.error("Supabase updateWholesalePack error:", err);
    const list = await getWholesalePacks();
    const idx = list.findIndex(p => p.id === packId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('wholesale_list', JSON.stringify(list));
      return list[idx];
    }
    throw err;
  }
}

export async function addWholesalePack(pack: Omit<WholesalePack, 'id'>): Promise<WholesalePack> {
  if (!isSupabaseConfigured()) {
    const list = await getWholesalePacks();
    const item = { id: Math.random().toString(36).substring(2), ...pack } as WholesalePack;
    list.push(item);
    localStorage.setItem('wholesale_list', JSON.stringify(list));
    return item;
  }

  try {
    const { data, error } = await supabase
      .from('wholesale_packs')
      .insert({
        name: pack.name,
        count: pack.count,
        price: pack.price,
        description: pack.description,
        country: pack.country,
        type: pack.type,
        cards_details: pack.cardsDetails ? JSON.stringify(pack.cardsDetails) : null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      count: Number(data.count),
      price: Number(data.price),
      description: data.description,
      country: data.country,
      type: data.type,
      cardsDetails: data.cards_details ? (typeof data.cards_details === 'string' ? JSON.parse(data.cards_details) : data.cards_details) : undefined,
    };
  } catch (err) {
    console.error("Supabase addWholesale failed:", err);
    const list = await getWholesalePacks();
    const item = { id: Math.random().toString(36).substring(2), ...pack } as WholesalePack;
    list.push(item);
    localStorage.setItem('wholesale_list', JSON.stringify(list));
    return item;
  }
}

// 5. Auction items
export async function getAuctions(): Promise<AuctionItem[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('auctions_list');
    if (stored) return JSON.parse(stored);
    const items = mockAuctionItems();
    localStorage.setItem('auctions_list', JSON.stringify(items));
    return items;
  }

  try {
    const { data, error } = await supabase
      .from('auctions')
      .select('*');

    if (error) throw error;
    const list = data || [];

    return list.map(mapAuctionToTS);
  } catch (err) {
    console.error("Supabase getAuctions failed, using local:", err);
    const stored = localStorage.getItem('auctions_list');
    if (stored) return JSON.parse(stored);
    return mockAuctionItems();
  }
}

export async function deleteAuctionItem(auctionId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const list = await getAuctions();
    const filtered = list.filter(a => a.id !== auctionId);
    localStorage.setItem('auctions_list', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase deleteAuctionItem error:", err);
  }
}

export async function updateAuctionItem(auctionId: string, updates: Partial<AuctionItem>): Promise<AuctionItem> {
  if (!isSupabaseConfigured()) {
    const list = await getAuctions();
    const idx = list.findIndex(a => a.id === auctionId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('auctions_list', JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Auction item not found");
  }

  try {
    const dbAuc: any = {};
    if (updates.card?.bin !== undefined) dbAuc.bin = updates.card.bin;
    if (updates.card?.type !== undefined) dbAuc.brand = updates.card.type;
    if (updates.card?.subtype !== undefined) dbAuc.type = updates.card.subtype;
    if (updates.card?.country !== undefined) dbAuc.country = updates.card.country;
    if (updates.card?.state !== undefined) dbAuc.state = updates.card.state;
    if (updates.card?.bank !== undefined) dbAuc.bank = updates.card.bank;
    if (updates.card?.expDate !== undefined) dbAuc.expiry = updates.card.expDate;
    if (updates.currentBid !== undefined) dbAuc.current_bid = updates.currentBid;
    if (updates.myBid !== undefined) dbAuc.my_bid = updates.myBid;
    if (updates.bidsCount !== undefined) dbAuc.bids_count = updates.bidsCount;
    if (updates.endTime !== undefined) dbAuc.end_time = updates.endTime;

    const { data, error } = await supabase
      .from('auctions')
      .update(dbAuc)
      .eq('id', auctionId)
      .select('*')
      .single();

    if (error) throw error;
    return mapAuctionToTS(data);
  } catch (err) {
    console.error("Supabase updateAuctionItem error:", err);
    const list = await getAuctions();
    const idx = list.findIndex(a => a.id === auctionId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('auctions_list', JSON.stringify(list));
      return list[idx];
    }
    throw err;
  }
}

export async function addAuctionItem(auction: Omit<AuctionItem, 'id'>): Promise<AuctionItem> {
  if (!isSupabaseConfigured()) {
    const list = await getAuctions();
    const item = { id: Math.random().toString(36).substring(2), ...auction } as AuctionItem;
    list.push(item);
    localStorage.setItem('auctions_list', JSON.stringify(list));
    return item;
  }

  try {
    const { data, error } = await supabase
      .from('auctions')
      .insert({
        bin: auction.card.bin,
        brand: auction.card.type || 'Visa',
        type: auction.card.subtype || 'Classic',
        country: auction.card.country || 'US',
        state: auction.card.state || 'NY',
        bank: auction.card.bank || 'CHASE',
        expiry: auction.card.expDate || '12/28',
        starting_bid: auction.currentBid,
        current_bid: auction.currentBid,
        my_bid: auction.myBid,
        bids_count: auction.bidsCount,
        end_time: auction.endTime,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapAuctionToTS(data);
  } catch (err) {
    console.error("Supabase addAuction failed:", err);
    const list = await getAuctions();
    const item = { id: Math.random().toString(36).substring(2), ...auction } as AuctionItem;
    list.push(item);
    localStorage.setItem('auctions_list', JSON.stringify(list));
    return item;
  }
}

export async function updateAuctionBid(auctionId: string, currentBid: number, bidsCount: number, myBid: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const list = await getAuctions();
    const idx = list.findIndex(a => a.id === auctionId);
    if (idx !== -1) {
      list[idx].currentBid = currentBid;
      list[idx].bidsCount = bidsCount;
      list[idx].myBid = myBid;
      localStorage.setItem('auctions_list', JSON.stringify(list));
    }
    return;
  }

  try {
    await supabase
      .from('auctions')
      .update({
        current_bid: currentBid,
        bids_count: bidsCount,
        my_bid: myBid
      })
      .eq('id', auctionId);
  } catch (err) {
    console.error("Supabase update bid failed:", err);
  }
}

// 6. Support Tickets
export async function getTickets(email: string): Promise<SupportTicket[]> {
  const normEmail = email.toLowerCase();

  if (!isSupabaseConfigured()) {
    const key = `tickets_${normEmail}`;
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);

    const defaultTicket: SupportTicket = {
      id: 'default-ticket',
      subject: 'Welcome to Protocol Clone!',
      status: 'Replied',
      createdAt: new Date().toISOString().split('T')[0],
      messages: [
        {
          sender: 'admin',
          text: 'Welcome to Protocol. Feel free to top up and view active listings.',
          timestamp: '12:00 PM',
        }
      ]
    };
    localStorage.setItem(key, JSON.stringify([defaultTicket]));
    return [defaultTicket];
  }

  try {
    let query = supabase.from('tickets').select('*');
    if (normEmail !== 'patrickkamande10455@gmail.com') {
      query = query.eq('user_email', normEmail);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(t => ({
      id: t.id,
      subject: t.subject,
      status: t.status as any,
      createdAt: t.created_at.split('T')[0],
      messages: t.messages,
    }));
  } catch (err) {
    console.error("Supabase getTickets failed:", err);
    return [];
  }
}

export async function createTicket(ticket: Omit<SupportTicket, 'id'> & { userEmail: string }): Promise<SupportTicket> {
  if (!isSupabaseConfigured()) {
    const list = await getTickets(ticket.userEmail);
    const item = { id: Math.random().toString(36).substring(2), ...ticket } as any;
    list.push(item);
    localStorage.setItem(`tickets_${ticket.userEmail.toLowerCase()}`, JSON.stringify(list));
    return item;
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_email: ticket.userEmail.toLowerCase(),
        subject: ticket.subject,
        status: ticket.status,
        messages: ticket.messages,
      })
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      subject: data.subject,
      status: data.status as any,
      createdAt: data.created_at.split('T')[0],
      messages: data.messages,
    };
  } catch (err) {
    console.error("Supabase createTicket failed:", err);
    return { id: Math.random().toString(36).substring(2), ...ticket };
  }
}

export async function updateTicketMessages(ticketId: string, messages: any[], status: 'Open' | 'Closed' | 'Replied'): Promise<void> {
  if (!isSupabaseConfigured()) {
    // Search all local storage keys to find and update
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tickets_')) {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = list.findIndex((t: any) => t.id === ticketId);
        if (idx !== -1) {
          list[idx].messages = messages;
          list[idx].status = status;
          localStorage.setItem(key, JSON.stringify(list));
          break;
        }
      }
    }
    return;
  }

  try {
    await supabase
      .from('tickets')
      .update({ messages, status })
      .eq('id', ticketId);
  } catch (err) {
    console.error("Supabase updateTicket failed:", err);
  }
}

// 7. Orders/Transactions
export async function getOrders(email: string): Promise<any[]> {
  const normEmail = email.toLowerCase();

  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(`orders_${normEmail}`);
    return stored ? JSON.parse(stored) : [];
  }

  try {
    let query = supabase.from('orders').select('*');
    if (normEmail !== 'patrickkamande10455@gmail.com') {
      query = query.eq('user_email', normEmail);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(o => {
      let extra = {};
      if (o.details) {
        try {
          extra = typeof o.details === 'string' ? JSON.parse(o.details) : o.details;
        } catch (e) {
          console.error("Failed to parse order details:", e);
        }
      }
      return {
        id: o.id,
        userEmail: o.user_email,
        bin: o.bin,
        bank: o.bank,
        price: Number(o.price),
        purchaseId: o.purchase_id,
        testStatus: o.test_status || 'untested',
        tested: o.test_status || 'untested',
        details: o.details,
        timestamp: o.created_at,
        ...extra,
      };
    });
  } catch (err) {
    console.error("Supabase getOrders failed:", err);
    return [];
  }
}

export async function createOrder(order: any): Promise<void> {
  const normEmail = order.userEmail.toLowerCase();

  if (!isSupabaseConfigured()) {
    const list = await getOrders(normEmail);
    list.push({ id: Math.random().toString(36).substring(2), ...order, timestamp: new Date().toISOString() });
    localStorage.setItem(`orders_${normEmail}`, JSON.stringify(list));
    return;
  }

  try {
    await supabase
      .from('orders')
      .insert({
        user_email: normEmail,
        bin: order.bin,
        bank: order.bank,
        price: order.price,
        purchase_id: order.purchaseId,
        test_status: order.testStatus || 'untested',
        details: order.details,
      });
  } catch (err) {
    console.error("Supabase createOrder failed:", err);
  }
}

export async function updateOrderTestStatus(orderId: string, testStatus: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    // Local storage fallback
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('orders_')) {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = list.findIndex((o: any) => o.id === orderId || o.purchaseId === orderId);
        if (idx !== -1) {
          list[idx].testStatus = testStatus;
          localStorage.setItem(key, JSON.stringify(list));
          break;
        }
      }
    }
    return;
  }

  try {
    await supabase
      .from('orders')
      .update({ test_status: testStatus })
      .eq('id', orderId);
  } catch (err) {
    console.error("Supabase updateOrderTestStatus failed:", err);
  }
}

// 8. System settings (Payment addresses)
export async function getSystemSettings(): Promise<SystemSettings> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('system_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    return {
      btcAddress: data.btc_address,
      ltcAddress: data.ltc_address,
      ethAddress: data.eth_address || DEFAULT_SETTINGS.ethAddress,
      usdtAddress: data.usdt_address,
      telegramUsername: data.telegram_username || DEFAULT_SETTINGS.telegramUsername,
    };
  } catch (err) {
    console.error("Supabase getSettings failed:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSystemSettings(settings: SystemSettings): Promise<void> {
  if (!isSupabaseConfigured()) {
    localStorage.setItem('system_settings', JSON.stringify(settings));
    return;
  }

  try {
    await supabase
      .from('system_settings')
      .upsert({
        id: 'global',
        btc_address: settings.btcAddress,
        ltc_address: settings.ltcAddress,
        eth_address: settings.ethAddress,
        usdt_address: settings.usdtAddress,
        telegram_username: settings.telegramUsername,
      });
  } catch (err) {
    console.error("Supabase updateSettings failed:", err);
  }
}

// 9. Payments Ledger
export async function getPayments(email: string): Promise<any[]> {
  const normEmail = email.toLowerCase();

  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(`payments_${normEmail}`);
    return stored ? JSON.parse(stored) : [];
  }

  try {
    let query = supabase.from('payments').select('*');
    if (normEmail !== 'patrickkamande10455@gmail.com') {
      query = query.eq('user_email', normEmail);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(p => ({
      id: p.id,
      userEmail: p.user_email,
      amount: Number(p.amount),
      cryptoMethod: p.crypto_method,
      transactionHash: p.transaction_hash,
      status: p.status,
      timestamp: p.created_at,
    })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (err) {
    console.error("Supabase getPayments failed:", err);
    return [];
  }
}

export async function createPayment(payment: any): Promise<void> {
  const normEmail = payment.userEmail.toLowerCase();

  if (!isSupabaseConfigured()) {
    const list = await getPayments(normEmail);
    list.unshift({ id: Math.random().toString(36).substring(2), ...payment, timestamp: new Date().toISOString() });
    localStorage.setItem(`payments_${normEmail}`, JSON.stringify(list));
    return;
  }

  try {
    await supabase
      .from('payments')
      .insert({
        user_email: normEmail,
        amount: payment.amount,
        crypto_method: payment.cryptoMethod,
        transaction_hash: payment.transactionHash,
        status: payment.status || 'Pending',
      });
  } catch (err) {
    console.error("Supabase createPayment failed:", err);
  }
}

export async function updatePaymentStatus(paymentId: string, status: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    // Search all local storage payment lists to update
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('payments_')) {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = list.findIndex((p: any) => p.id === paymentId);
        if (idx !== -1) {
          list[idx].status = status;
          localStorage.setItem(key, JSON.stringify(list));
          break;
        }
      }
    }
    return;
  }

  try {
    await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);
  } catch (err) {
    console.error("Supabase updatePaymentStatus failed:", err);
  }
}
