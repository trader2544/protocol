import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy 
} from '../firebase';
import { CardItem, UserProfile, SupportTicket, NewsItem, WholesalePack, AuctionItem } from '../types';
import { mockCardsList, mockNews, mockWholesalePacks, mockAuctionItems } from '../mockData';
import { FirestoreError } from 'firebase/firestore';

export interface FirestoreErrorInfo {
  code: string;
  message: string;
  actionableResolution: string;
}

export function handleFirestoreError(error: unknown): never {
  if (error && typeof error === 'object' && 'code' in error) {
    const firestoreError = error as FirestoreError;
    let resolution = "Please try again later.";
    
    switch (firestoreError.code) {
      case 'permission-denied':
        resolution = "Ensure you are authenticated and have appropriate permissions for this action.";
        break;
      case 'resource-exhausted':
        resolution = "Daily quota exceeded. Please wait before attempting further database transactions.";
        break;
      case 'unauthenticated':
        resolution = "Please sign in to complete this operation.";
        break;
      case 'not-found':
        resolution = "The requested record was not found.";
        break;
    }
    
    const info: FirestoreErrorInfo = {
      code: firestoreError.code,
      message: firestoreError.message,
      actionableResolution: resolution
    };
    throw new Error(JSON.stringify(info));
  }
  throw error;
}

// System settings for payment addresses
export interface SystemSettings {
  btcAddress: string;
  ltcAddress: string;
  ethAddress: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ltcAddress: 'LQP92mxC9G9888AsXgH66688hS7sdfsF',
  ethAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

/**
 * 1. User profile operations
 */
export async function getUserProfile(email: string): Promise<UserProfile & { role: 'admin' | 'customer' }> {
  try {
    const docRef = doc(db, 'users', email.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as any;
    } else {
      // Create profile
      const isAdmin = email.toLowerCase() === 'patrickkamande10455@gmail.com';
      const newProfile: UserProfile & { role: 'admin' | 'customer' } = {
        email: email.toLowerCase(),
        username: email.split('@')[0],
        balance: isAdmin ? 1000.00 : 0.00, // admins get starting balance or custom balance
        crabRating: isAdmin ? 100 : 0,
        crabsDetailsOpen: false,
        addFundsOpen: false,
        lotteryOpen: false,
        giftOpen: false,
        accountStatus: isAdmin ? 'active' : 'inactive',
        creationDate: new Date().toISOString().split('T')[0],
        role: isAdmin ? 'admin' : 'customer',
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function registerUserProfile(email: string, username: string, password?: string): Promise<UserProfile & { role: 'admin' | 'customer' }> {
  try {
    const docRef = doc(db, 'users', email.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      throw new Error("An account with this email address already exists.");
    }

    const isAdmin = email.toLowerCase() === 'patrickkamande10455@gmail.com';
    const newProfile: UserProfile & { role: 'admin' | 'customer' } = {
      email: email.toLowerCase(),
      username: username.trim() || email.split('@')[0],
      balance: isAdmin ? 1000.00 : 0.00,
      crabRating: isAdmin ? 100 : 0,
      crabsDetailsOpen: false,
      addFundsOpen: false,
      lotteryOpen: false,
      giftOpen: false,
      accountStatus: isAdmin ? 'active' : 'inactive',
      creationDate: new Date().toISOString().split('T')[0],
      role: isAdmin ? 'admin' : 'customer',
      password: password || '',
    };
    await setDoc(docRef, newProfile);
    return newProfile;
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      throw error;
    }
    return handleFirestoreError(error);
  }
}

export async function updateUserProfile(email: string, updates: Partial<UserProfile & { role: 'admin' | 'customer' }>): Promise<void> {
  try {
    const docRef = doc(db, 'users', email.toLowerCase());
    await updateDoc(docRef, updates as any);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/**
 * 2. Card database operations (CVV2, Dumps, Fullz)
 */
export async function getCards(): Promise<CardItem[]> {
  try {
    const colRef = collection(db, 'cards');
    const snap = await getDocs(colRef);
    let items: CardItem[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as CardItem);
    });

    if (items.length === 0) {
      // Seed initial cards
      for (const card of mockCardsList) {
        const { id, ...cardData } = card;
        const newDocRef = doc(colRef, id);
        await setDoc(newDocRef, cardData);
        items.push(card);
      }
    }
    return items;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function addCard(card: Omit<CardItem, 'id'>): Promise<CardItem> {
  try {
    const colRef = collection(db, 'cards');
    const docRef = await addDoc(colRef, card);
    return { id: docRef.id, ...card } as CardItem;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteCard(cardId: string): Promise<void> {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'cards', cardId);
    await deleteDoc(docRef);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/**
 * 3. News bulletins
 */
export async function getNews(): Promise<NewsItem[]> {
  try {
    const colRef = collection(db, 'news');
    const snap = await getDocs(colRef);
    let items: NewsItem[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as NewsItem);
    });

    if (items.length === 0) {
      for (const news of mockNews) {
        const { id, ...newsData } = news;
        const newDocRef = doc(colRef, id);
        await setDoc(newDocRef, newsData);
        items.push(news);
      }
    }
    return items;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/**
 * 4. Wholesale packs
 */
export async function getWholesalePacks(): Promise<WholesalePack[]> {
  try {
    const colRef = collection(db, 'wholesalePacks');
    const snap = await getDocs(colRef);
    let items: WholesalePack[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as WholesalePack);
    });

    if (items.length === 0) {
      for (const pack of mockWholesalePacks) {
        const { id, ...packData } = pack;
        const newDocRef = doc(colRef, id);
        await setDoc(newDocRef, packData);
        items.push(pack);
      }
    }
    return items;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/**
 * 5. Auction items
 */
export async function getAuctions(): Promise<AuctionItem[]> {
  try {
    const colRef = collection(db, 'auctions');
    const snap = await getDocs(colRef);
    let items: AuctionItem[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as AuctionItem);
    });

    if (items.length === 0) {
      const initialAuctions = mockAuctionItems();
      for (const auc of initialAuctions) {
        const { id, ...aucData } = auc;
        const newDocRef = doc(colRef, id);
        await setDoc(newDocRef, aucData);
        items.push(auc);
      }
    }
    return items;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateAuctionBid(auctionId: string, currentBid: number, bidsCount: number, myBid: number): Promise<void> {
  try {
    const docRef = doc(db, 'auctions', auctionId);
    await updateDoc(docRef, { currentBid, bidsCount, myBid });
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/**
 * 6. Support Tickets
 */
export async function getTickets(email: string): Promise<SupportTicket[]> {
  try {
    const colRef = collection(db, 'tickets');
    let snap;
    if (email.toLowerCase() === 'patrickkamande10455@gmail.com') {
      // Admins see all user tickets
      snap = await getDocs(colRef);
    } else {
      // Customers see only their own tickets
      const q = query(colRef, where('userEmail', '==', email.toLowerCase()));
      snap = await getDocs(q);
    }

    let items: SupportTicket[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as any);
    });

    if (items.length === 0 && email.toLowerCase() !== 'patrickkamande10455@gmail.com') {
      // Seed default ticket
      const defaultTicket: any = {
        subject: 'Welcome to Protocol Clone!',
        status: 'Replied',
        createdAt: new Date().toISOString().split('T')[0],
        userEmail: email.toLowerCase(),
        messages: [
          {
            sender: 'admin',
            text: 'Welcome to Protocol. Feel free to top up and view active listings.',
            timestamp: '12:00 PM',
          }
        ]
      };
      const docRef = await addDoc(colRef, defaultTicket);
      items.push({ id: docRef.id, ...defaultTicket });
    }
    return items;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function createTicket(ticket: Omit<SupportTicket, 'id'> & { userEmail: string }): Promise<SupportTicket> {
  try {
    const colRef = collection(db, 'tickets');
    const docRef = await addDoc(colRef, ticket);
    return { id: docRef.id, ...ticket } as any;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateTicketMessages(ticketId: string, messages: any[], status: 'Open' | 'Closed' | 'Replied'): Promise<void> {
  try {
    const docRef = doc(db, 'tickets', ticketId);
    await updateDoc(docRef, { messages, status });
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/**
 * 7. Orders/Transactions
 */
export async function getOrders(email: string): Promise<any[]> {
  try {
    const colRef = collection(db, 'orders');
    let snap;
    if (email.toLowerCase() === 'patrickkamande10455@gmail.com') {
      snap = await getDocs(colRef);
    } else {
      const q = query(colRef, where('userEmail', '==', email.toLowerCase()));
      snap = await getDocs(q);
    }
    let items: any[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function createOrder(order: any): Promise<void> {
  try {
    const colRef = collection(db, 'orders');
    await addDoc(colRef, order);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/**
 * 8. System settings (Payment addresses)
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const docRef = doc(db, 'settings', 'payment');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateSystemSettings(settings: SystemSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'payment');
    await setDoc(docRef, settings);
  } catch (error) {
    return handleFirestoreError(error);
  }
}
