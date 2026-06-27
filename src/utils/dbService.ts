import { supabase } from '../supabase';
import { CardItem, UserProfile, SupportTicket, NewsItem, WholesalePack, AuctionItem } from '../types';
import { mockCardsList, mockNews, mockWholesalePacks, mockAuctionItems } from '../mockData';

export interface SystemSettings {
  btcAddress: string;
  ltcAddress: string;
  ethAddress: string;
  usdtAddress: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ltcAddress: 'LQL9YgSTB968i99684396843968',
  ethAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  usdtAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

// Detect if Supabase is fully configured
export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  return !!(url && url !== 'https://placeholder-project.supabase.co' && key && key !== 'placeholder-anon-key');
};

// --- MAPPING HELPERS ---
function mapProfileToTS(dbProfile: any): UserProfile & { role: 'admin' | 'customer' } {
  return {
    email: dbProfile.email,
    username: dbProfile.username || dbProfile.email.split('@')[0],
    role: dbProfile.role as 'admin' | 'customer',
    balance: Number(dbProfile.balance ?? 0),
    crabRating: Number(dbProfile.crab_rating ?? 5),
    crabsDetailsOpen: !!dbProfile.crabs_details_open,
    addFundsOpen: !!dbProfile.add_funds_open,
    lotteryOpen: !!dbProfile.lottery_open,
    giftOpen: !!dbProfile.gift_open,
    accountStatus: dbProfile.account_status || 'active',
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

  if (Object.keys(extra).length > 0) {
    dbCard.full_address_str = JSON.stringify(extra);
  }

  return dbCard;
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
  if (stored) return JSON.parse(stored);
  
  const isAdmin = email.toLowerCase() === 'patrickkamande10455@gmail.com';
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
    accountStatus: 'active',
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
        account_status: 'active',
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
        account_status: 'active',
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

// 2. Card database operations (CVV2, Dumps, Fullz)
export async function getCards(): Promise<CardItem[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('cards_list');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('cards_list', JSON.stringify(mockCardsList));
    return mockCardsList;
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('status', 'live');

    if (error || !data || data.length === 0) {
      // Seed cards if empty
      for (const card of mockCardsList) {
        await supabase.from('cards').insert({
          ...mapCardToDB(card),
          id: card.id,
          status: 'live'
        });
      }
      return mockCardsList;
    }

    return data.map(mapCardToTS);
  } catch (err) {
    console.error("Supabase getCards failed, using local:", err);
    const stored = localStorage.getItem('cards_list');
    if (stored) return JSON.parse(stored);
    return mockCardsList;
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
    const dbCard = mapCardToDB(card);
    const { data, error } = await supabase
      .from('cards')
      .insert({ ...dbCard, status: 'live' })
      .select('*')
      .single();

    if (error) throw error;
    return mapCardToTS(data);
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
    await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);
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

    if (error || !data || data.length === 0) {
      for (const n of mockNews) {
        await supabase.from('news').insert({
          id: n.id,
          title: n.title,
          content: n.content,
          important: n.important,
          date: new Date(n.date).toISOString(),
        });
      }
      return mockNews;
    }

    return data.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      important: n.important,
      date: n.date.split('T')[0],
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

    if (error || !data || data.length === 0) {
      for (const p of mockWholesalePacks) {
        await supabase.from('wholesale_packs').insert({
          id: p.id,
          name: p.name,
          count: p.count,
          price: p.price,
          description: p.description,
          country: p.country,
          type: p.type
        });
      }
      return mockWholesalePacks;
    }

    return data.map(p => ({
      id: p.id,
      name: p.name,
      count: Number(p.count),
      price: Number(p.price),
      description: p.description,
      country: p.country,
      type: p.type,
    }));
  } catch (err) {
    console.error("Supabase getWholesale failed, using local:", err);
    return mockWholesalePacks;
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
    const initial = mockAuctionItems();
    localStorage.setItem('auctions_list', JSON.stringify(initial));
    return initial;
  }

  try {
    const { data, error } = await supabase
      .from('auctions')
      .select('*');

    if (error || !data || data.length === 0) {
      const initial = mockAuctionItems();
      for (const a of initial) {
        await supabase.from('auctions').insert({
          id: a.id,
          bin: a.card.bin,
          brand: a.card.type || 'Visa',
          type: a.card.subtype || 'Classic',
          country: a.card.country || 'US',
          state: a.card.state || 'NY',
          bank: a.card.bank || 'CHASE',
          expiry: a.card.expDate || '12/28',
          starting_bid: a.currentBid,
          current_bid: a.currentBid,
          my_bid: a.myBid,
          bids_count: a.bidsCount,
          end_time: a.endTime,
        });
      }
      return initial;
    }

    return data.map(mapAuctionToTS);
  } catch (err) {
    console.error("Supabase getAuctions failed, using local:", err);
    const stored = localStorage.getItem('auctions_list');
    if (stored) return JSON.parse(stored);
    return mockAuctionItems();
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

    return data.map(o => ({
      id: o.id,
      userEmail: o.user_email,
      bin: o.bin,
      bank: o.bank,
      price: Number(o.price),
      purchaseId: o.purchase_id,
      testStatus: o.test_status,
      details: o.details,
      timestamp: o.created_at,
    }));
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
