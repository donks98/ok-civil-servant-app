import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WalletState, Transaction } from '../data/mockData';
import { ColorScheme } from '../constants/colors';
import { Locale } from '../constants/i18n';
import { api } from '../services/api';

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
  pendingPhone: string | null;

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
  loadShoppingList: () => Promise<void>;
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  removeShoppingItem: (id: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;

  // Family Sub-accounts
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'amountUsed'>) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;

  // Credit Request
  creditRequestStatus: 'idle' | 'submitted' | 'approved';
  submitCreditRequest: (desired: number, reason: string) => Promise<void>;

  // Direct Debit
  directDebitActive: boolean;
  setDirectDebitActive: (active: boolean) => void;
  loadDirectDebitStatus: () => Promise<void>;

  // Actions
  login: (phone: string, pin: string) => Promise<boolean>;
  register: (userData: Partial<User>, pin: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
  verifyEmployment: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  loadFamilyMembers: () => Promise<void>;
}

// ─── Data mappers ──────────────────────────────────────────────────────────────

function mapUser(u: any): User {
  const w = u.wallet ?? {};
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    nationalId: u.nationalId ?? '',
    department: u.department,
    ministry: u.ministry,
    employerCode: u.employerCode ?? '',
    employeeId: u.employeeId ?? '',
    monthlySalary: Number(u.monthlySalary ?? 0),
    creditLimit: Number(w.creditLimit ?? 0),
    walletId: w.walletId ?? '',
    joinedDate: u.createdAt ? u.createdAt.slice(0, 10) : '',
    avatarInitials: u.avatarInitials ?? u.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'OK',
  };
}

function mapWallet(w: any): WalletState {
  const ndd = w.nextDeductionDate ? new Date(w.nextDeductionDate).toISOString().slice(0, 10) : '';
  return {
    creditLimit: Number(w.creditLimit ?? 0),
    amountUsed: Number(w.amountUsed ?? 0),
    availableCredit: Number(w.availableCredit ?? 0),
    nextDeductionDate: ndd,
    nextDeductionAmount: Number(w.nextDeductionAmount ?? 0),
    cycleStart: w.cycleStart ?? '',
    cycleEnd: w.cycleEnd ?? '',
  };
}

function mapTransaction(t: any): Transaction {
  const dt = new Date(t.createdAt);
  const date = dt.toISOString().slice(0, 10);
  const time = dt.toTimeString().slice(0, 5);
  return {
    id: t.id,
    storeName: t.storeName,
    storeLocation: t.store?.address ?? '',
    amount: Number(t.amount),
    date,
    time,
    category: t.category as Transaction['category'],
    reference: t.reference,
    balance: Number(t.balance),
  };
}

function mapFamilyMember(m: any): FamilyMember {
  return {
    id: m.id,
    name: m.name,
    relationship: m.relationship,
    nationalId: m.nationalId ?? '',
    subLimit: Number(m.subLimit ?? 0),
    amountUsed: Number(m.amountUsed ?? 0),
  };
}

function mapShoppingItem(i: any): ShoppingItem {
  return {
    id: i.id,
    name: i.name,
    estimatedPrice: Number(i.estimatedPrice ?? 0),
    checked: Boolean(i.checked),
  };
}

async function storeTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    ['access_token', accessToken],
    ['refresh_token', refreshToken],
  ]);
}

const EMPTY_WALLET: WalletState = {
  creditLimit: 0, amountUsed: 0, availableCredit: 0,
  nextDeductionDate: '', nextDeductionAmount: 0, cycleStart: '', cycleEnd: '',
};

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  isRegistered: false,
  user: null,
  pendingPhone: null,
  wallet: EMPTY_WALLET,
  transactions: [],
  familyMembers: [],
  directDebitActive: false,

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

  // ─── Shopping List ───────────────────────────────────────────────────────────
  shoppingList: [],

  loadShoppingList: async () => {
    try {
      const res = await api.shoppingList.get();
      set({ shoppingList: (res.items ?? []).map(mapShoppingItem) });
    } catch {}
  },

  addShoppingItem: async (item) => {
    // Optimistic add with temp id
    const tempId = `tmp-${Date.now()}`;
    set((s) => ({
      shoppingList: [...s.shoppingList, { ...item, id: tempId, checked: false }],
    }));
    try {
      const added = await api.shoppingList.addItem(item.name, item.estimatedPrice);
      // Replace temp item with server item
      set((s) => ({
        shoppingList: s.shoppingList.map((i) => i.id === tempId ? mapShoppingItem(added) : i),
      }));
    } catch {
      // Revert on failure
      set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== tempId) }));
    }
  },

  toggleShoppingItem: async (id) => {
    // Optimistic toggle
    set((s) => ({
      shoppingList: s.shoppingList.map((i) => i.id === id ? { ...i, checked: !i.checked } : i),
    }));
    try {
      await api.shoppingList.toggleItem(id);
    } catch {
      // Revert
      set((s) => ({
        shoppingList: s.shoppingList.map((i) => i.id === id ? { ...i, checked: !i.checked } : i),
      }));
    }
  },

  removeShoppingItem: async (id) => {
    const prev = get().shoppingList;
    set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) }));
    try {
      await api.shoppingList.deleteItem(id);
    } catch {
      set({ shoppingList: prev });
    }
  },

  clearCheckedItems: async () => {
    const prev = get().shoppingList;
    set((s) => ({ shoppingList: s.shoppingList.filter((i) => !i.checked) }));
    try {
      await api.shoppingList.clearChecked();
    } catch {
      set({ shoppingList: prev });
    }
  },

  // ─── Family ─────────────────────────────────────────────────────────────────
  addFamilyMember: async (member) => {
    const added = await api.family.add({
      name: member.name,
      relationship: member.relationship,
      nationalId: member.nationalId || undefined,
      subLimit: member.subLimit,
    });
    set((s) => ({ familyMembers: [...s.familyMembers, mapFamilyMember(added)] }));
  },
  removeFamilyMember: async (id) => {
    await api.family.remove(id);
    set((s) => ({ familyMembers: s.familyMembers.filter((m) => m.id !== id) }));
  },

  // ─── Direct Debit ────────────────────────────────────────────────────────────
  setDirectDebitActive: (active) => set({ directDebitActive: active }),

  loadDirectDebitStatus: async () => {
    try {
      const schedule = await api.directDebit.getSchedule();
      set({ directDebitActive: !!schedule });
    } catch {
      set({ directDebitActive: false });
    }
  },

  creditRequestStatus: 'idle',
  submitCreditRequest: async (desired, reason) => {
    await api.credit.submit({ requestedLimit: desired, reason });
    set({ creditRequestStatus: 'submitted' });
  },

  // ─── Auth ────────────────────────────────────────────────────────────────────
  login: async (phone, pin) => {
    try {
      const res = await api.auth.login(phone, pin);
      await storeTokens(res.accessToken, res.refreshToken);
      await AsyncStorage.setItem('saved_phone', phone);

      const user = mapUser(res.user);
      const wallet = mapWallet(res.user.wallet ?? {});

      set({ isAuthenticated: true, user, wallet });

      await AsyncStorage.setItem('cached_qr', JSON.stringify({
        walletId: user.walletId, name: user.name,
        available: wallet.availableCredit, ts: Date.now(),
      }));

      get().refreshTransactions().catch(() => {});
      get().loadFamilyMembers().catch(() => {});
      get().loadShoppingList().catch(() => {});
      get().loadDirectDebitStatus().catch(() => {});

      return true;
    } catch {
      return false;
    }
  },

  register: async (userData, pin) => {
    const phone = userData.phone ?? '';
    await api.auth.register({
      name: userData.name!,
      nationalId: userData.nationalId!,
      phone,
      ministry: userData.ministry!,
      department: userData.department!,
      employerCode: userData.employerCode!,
      pin,
    });
    if (phone) await AsyncStorage.setItem('saved_phone', phone);
    set({ isRegistered: true, pendingPhone: phone });
  },

  verifyOtp: async (otp) => {
    const { pendingPhone } = get();
    if (!pendingPhone) return false;
    try {
      const res = await api.auth.verifyOtp(pendingPhone, otp);
      await storeTokens(res.accessToken, res.refreshToken);

      const user = mapUser(res.user);
      const wallet = mapWallet(res.user.wallet ?? {});

      set({ isAuthenticated: true, user, wallet, pendingPhone: null });

      await AsyncStorage.setItem('cached_qr', JSON.stringify({
        walletId: user.walletId, name: user.name,
        available: wallet.availableCredit, ts: Date.now(),
      }));

      get().loadDirectDebitStatus().catch(() => {});

      return true;
    } catch {
      return false;
    }
  },

  // Called from verify screen after OTP — triggers real ID + employment verification
  verifyEmployment: async () => {
    const { user } = get();
    if (!user) return;
    // Fire both verifications — errors are non-fatal (backend processes async)
    const idPromise = api.verification.verifyId(user.nationalId).catch(() => {});
    const empPromise = api.verification.verifyEmployment({
      employeeId: user.employeeId ?? user.id,
      ministry: user.ministry,
      department: user.department,
      employerCode: user.employerCode,
    }).catch(() => {});
    // Wait long enough for the animation steps to complete
    await Promise.all([
      idPromise,
      empPromise,
      new Promise((r) => setTimeout(r, 3500)),
    ]);
  },

  logout: () => {
    AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    set({
      isAuthenticated: false, isRegistered: false,
      user: null, wallet: EMPTY_WALLET, transactions: [],
      familyMembers: [], shoppingList: [], creditRequestStatus: 'idle', pendingPhone: null,
      directDebitActive: false,
    });
  },

  refreshWallet: async () => {
    try {
      const w = await api.wallet.get();
      set({ wallet: mapWallet(w) });
    } catch {}
  },

  refreshTransactions: async () => {
    try {
      const res = await api.transactions.list({ limit: 50 });
      const list = Array.isArray(res) ? res : (res.data ?? []);
      set({ transactions: list.map(mapTransaction) });
    } catch {}
  },

  loadFamilyMembers: async () => {
    try {
      const list = await api.family.list();
      set({ familyMembers: list.map(mapFamilyMember) });
    } catch {}
  },
}));
