export type ActiveTab =
  | 'news'
  | 'dumps'
  | 'cvv2'
  | 'fullz'
  | 'wholesale'
  | 'cart'
  | 'orders'
  | 'auction'
  | 'tools'
  | 'tickets'
  | 'help'
  | 'admin'
  | 'banklogs'
  | 'cashapp'
  | 'paypal'
  | 'rdp';

export interface UserProfile {
  email: string;
  balance: number;
  crabRating: number;
  crabsDetailsOpen: boolean;
  addFundsOpen: boolean;
  lotteryOpen: boolean;
  giftOpen: boolean;
  username: string;
  accountStatus: 'inactive' | 'active';
  creationDate: string;
  password?: string;
}

export interface CardItem {
  id: string;
  bin: string;
  zip: string;
  bank: string;
  country: string;
  state: string;
  type: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
  creditDebit: 'Credit' | 'Debit';
  subtype: 'Classic' | 'Platinum' | 'Gold' | 'Signature' | 'Business' | 'Corporate' | 'Infinite';
  expDate: string;
  discounted: boolean;
  onlyRefundable: boolean;
  price: number;
  ssn: boolean;
  dob: boolean;
  mmn: boolean;
  ipAddress: string;
  lastPaidAmount: boolean;
  driverLicense: boolean;
  driverLicenseScan: boolean;
  atmPin: boolean;
  attPin: boolean;
  fullAddress: boolean;
  phone: boolean;
  email: boolean;
  emailPassword: boolean;
  withoutCvv2: boolean;
  base: string;
  accountNumber?: boolean;
  routingNumber?: boolean;
  cardNumber?: string;
  cvv?: string;
  fullName?: string;
  fullAddressStr?: string;
  fullPhone?: string;
  fullSsn?: string;
  fullDob?: string;
  track1?: string;
  track2?: string;
  fullMmn?: string;
  fullAtmPin?: string;
  fullDriverLicense?: string;
  fullEmail?: string;
  fullEmailPassword?: string;
  fullAccountNumber?: string;
  fullRoutingNumber?: string;
  category?: 'dumps' | 'cvv2' | 'fullz' | 'banklogs' | 'cashapp' | 'paypal' | 'rdp';
  ownRent?: 'Own' | 'Rent' | '';
  yearsAtResidence?: string;
  incomeType?: string;
  employer?: string;
  occupation?: string;
  yearsEmployed?: string;
  workPhone?: string;
  netMonthlyIncome?: string;
  loginUsername?: string;
  loginPassword?: string;
  bankBalance?: number;
  bankAccountType?: string;
  bankAccessType?: string;
  cashappUsername?: string;
  cashappEmail?: string;
  cashappPhone?: string;
  cashappPin?: string;
  cashappHasFunds?: boolean;
  cashappBalance?: number;
  paypalEmail?: string;
  paypalPassword?: string;
  paypalCookies?: string;
  paypalHasPaymentMethod?: boolean;
  paypalBalance?: number;
  rdpIp?: string;
  rdpUsername?: string;
  rdpPassword?: string;
  rdpCountry?: string;
  rdpState?: string;
  rdpCity?: string;
  rdpOs?: string;
  rdpAccessType?: string;
  rdpHospeed?: string;
  packCount?: number;
  cardsDetails?: string[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'Closed' | 'Replied';
  createdAt: string;
  messages: {
    sender: 'user' | 'admin';
    text: string;
    timestamp: string;
  }[];
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  important: boolean;
}

export interface WholesalePack {
  id: string;
  name: string;
  count: number;
  price: number;
  description: string;
  country: string;
  type: string;
  cardsDetails?: string[];
}

export interface AuctionItem {
  id: string;
  card: Partial<CardItem>;
  currentBid: number;
  myBid: number;
  bidsCount: number;
  endTime: string; // ISO String
  startingBid?: number;
  highestBidder?: string;
  winnerEmail?: string;
  ended?: boolean;
  cardsCount?: number;
  cardsDetails?: string[];
  biddersList?: { username: string; bidAmount: number; timestamp: string }[];
}
