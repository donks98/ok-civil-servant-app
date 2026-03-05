import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USER, MOCK_WALLET, MOCK_TRANSACTIONS, User, WalletState, Transaction } from '../data/mockData';
import { ColorScheme } from '../constants/colors';
import { Locale } from '../constants/i18n';

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice: number;
  checked: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  nationalId: string;
  subLimit: number;
  amountUsed: number;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  isRegistered: boolean;
  user: User | null;

  // Wallet
  wallet: WalletState;

  // Transactions
  transactions: Transaction[];

  // Theme
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;

  // i18n
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Biometric
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Dark Mode Schedule
  darkModeSchedule: { enabled: boolean; startTime: string; endTime: string };
  setDarkModeSchedule: (schedule: { enabled: boolean; startTime: string; endTime: string }) => void;

  // Shopping List
  shoppingList: ShoppingItem[];
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCheckedItems: () => void;

  // Family Sub-accounts
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeFamilyMember: (id: string) => void;

  // Credit Request
  creditRequestStatus: 'idle' | 'submitted' | 'approved';
  submitCreditRequest: (desired: number, reason: string) => Promise<void>;

  // Actions
  login: (phone: string, pin: string) => Promise<boolean>;
  register: (userData: Partial<User>, pin: string) => Promise<void>;
  logout: () => void;
  verifyEmployment: () => Promise<void>;
}

const INITIAL_FAMILY: FamilyMember[] = [
  { id: 'FM-001', name: 'Mary Moyo', relationship: 'Spouse', nationalId: '63-9876543X18', subLimit: 30, amountUsed: 12.50 },
  { id: 'FM-002', name: 'Tinashe Moyo', relationship: 'Child', nationalId: 'N/A', subLimit: 20, amountUsed: 5.00 },
];

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  isRegistered: false,
  user: null,
  wallet: MOCK_WALLET,
  transactions: MOCK_TRANSACTIONS,

  colorScheme: 'dark',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),

  locale: 'en',
  setLocale: (locale) => {
    set({ locale });
    AsyncStorage.setItem('locale', locale);
  },

  biometricEnabled: false,
  setBiometricEnabled: (enabled) => {
    set({ biometricEnabled: enabled });
    AsyncStorage.setItem('biometric_enabled', String(enabled));
  },

  notificationsEnabled: true,
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

  darkModeSchedule: { enabled: false, startTime: '22:00', endTime: '06:00' },
  setDarkModeSchedule: (schedule) => set({ darkModeSchedule: schedule }),

  shoppingList: [],
  addShoppingItem: (item) =>
    set((s) => ({
      shoppingList: [...s.shoppingList, { ...item, id: `SL-${Date.now()}`, checked: false }],
    })),
  toggleShoppingItem: (id) =>
    set((s) => ({
      shoppingList: s.shoppingList.map((i) => i.id === id ? { ...i, checked: !i.checked } : i),
    })),
  removeShoppingItem: (id) =>
    set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) })),
  clearCheckedItems: () =>
    set((s) => ({ shoppingList: s.shoppingList.filter((i) => !i.checked) })),

  familyMembers: INITIAL_FAMILY,
  addFamilyMember: (member) =>
    set((s) => ({
      familyMembers: [...s.familyMembers, { ...member, id: `FM-${Date.now()}` }],
    })),
  removeFamilyMember: (id) =>
    set((s) => ({ familyMembers: s.familyMembers.filter((m) => m.id !== id) })),

  creditRequestStatus: 'idle',
  submitCreditRequest: async (_desired, _reason) => {
    await new Promise((r) => setTimeout(r, 1500));
    set({ creditRequestStatus: 'submitted' });
  },

  login: async (phone: string, _pin: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    if (phone.length >= 9) {
      const user = MOCK_USER;
      set({ isAuthenticated: true, user });
      await AsyncStorage.setItem('saved_phone', phone);
      // Cache QR data for offline use
      await AsyncStorage.setItem('cached_qr', JSON.stringify({
        walletId: user.walletId, name: user.name,
        available: MOCK_WALLET.availableCredit, ts: Date.now(),
      }));
      return true;
    }
    return false;
  },

  register: async (userData: Partial<User>, _pin: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (userData.phone) await AsyncStorage.setItem('saved_phone', userData.phone);
    set({ isRegistered: true, user: { ...MOCK_USER, ...userData } as User });
  },

  logout: () => {
    set({ isAuthenticated: false, isRegistered: false, user: null, creditRequestStatus: 'idle' });
  },

  verifyEmployment: async () => {
    await new Promise((r) => setTimeout(r, 3000));
    set({ isAuthenticated: true });
  },
}));
