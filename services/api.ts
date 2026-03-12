import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getApiBase(): string {
  // In Expo Go / dev builds, hostUri is the dev server address (e.g. "192.168.x.x:8081")
  // Reuse that host with the backend port so it works on any network automatically.
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0]; // strip the port
    return `http://${host}:3000/api/v1`;
  }
  // Fallback for emulators when hostUri isn't available
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/v1';
  return 'http://localhost:3000/api/v1';
}

export const API_BASE = getApiBase();

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem('access_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(body.message)
      ? body.message.join(', ')
      : (body.message ?? `HTTP ${res.status}`);
    throw new Error(msg);
  }

  return body as T;
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('263')) return `+${digits}`;
  if (digits.startsWith('0')) return `+263${digits.slice(1)}`;
  return `+263${digits}`;
}

export const api = {
  auth: {
    register: (data: {
      name: string;
      nationalId: string;
      phone: string;
      ministry: string;
      department: string;
      employerCode: string;
      pin: string;
    }) =>
      request<{ message: string; userId: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...data, phone: formatPhone(data.phone) }),
      }),

    verifyOtp: (phone: string, otp: string) =>
      request<{ accessToken: string; refreshToken: string; user: any }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: formatPhone(phone), otp }),
      }),

    login: (phone: string, pin: string) =>
      request<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: formatPhone(phone), pin }),
      }),
  },

  wallet: {
    get: () => request<any>('/wallet'),
  },

  transactions: {
    list: (params?: { page?: number; limit?: number; month?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.month) q.set('month', params.month);
      const qs = q.toString();
      return request<{ data: any[]; total: number; page: number }>(`/transactions${qs ? `?${qs}` : ''}`);
    },
    dispute: (id: string, reason: string, notes?: string) =>
      request<any>(`/transactions/${id}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ reason, notes }),
      }),
  },

  family: {
    list: () => request<any[]>('/family'),
    add: (data: { name: string; relationship: string; nationalId?: string; subLimit: number }) =>
      request<any>('/family', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => request<any>(`/family/${id}`, { method: 'DELETE' }),
  },

  credit: {
    submit: (data: { requestedLimit: number; reason: string }) =>
      request<any>('/credit/request', { method: 'POST', body: JSON.stringify(data) }),
  },

  shoppingList: {
    get: () => request<{ id: string; items: any[] }>('/shopping-list'),
    addItem: (name: string, estimatedPrice: number) =>
      request<any>('/shopping-list/items', { method: 'POST', body: JSON.stringify({ name, estimatedPrice }) }),
    toggleItem: (id: string) =>
      request<any>(`/shopping-list/items/${id}/toggle`, { method: 'PATCH' }),
    deleteItem: (id: string) =>
      request<any>(`/shopping-list/items/${id}`, { method: 'DELETE' }),
    clearChecked: () =>
      request<any>('/shopping-list/clear-checked', { method: 'DELETE' }),
  },

  stores: {
    nearby: (lat: number, lng: number, radius = 10) =>
      request<any[]>(`/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
    list: (brand?: string) =>
      request<any[]>(`/stores${brand ? `?brand=${brand}` : ''}`),
  },

  verification: {
    verifyId: (nationalId: string) =>
      request<any>('/verification/national-id', { method: 'POST', body: JSON.stringify({ nationalId }) }),
    verifyEmployment: (data: { employeeId: string; ministry: string; department: string; employerCode: string }) =>
      request<any>('/verification/employment', { method: 'POST', body: JSON.stringify(data) }),
    getStatus: () => request<any>('/verification/status'),
  },

  directDebit: {
    setup: (data: {
      channel: 'ECOCASH' | 'BANK_TRANSFER' | 'TELECASH' | 'INNBUCKS';
      ecocashNumber?: string;
      bankAccount?: string;
      bankName?: string;
      bankBranchCode?: string;
    }) => request<any>('/direct-debit/schedule', { method: 'POST', body: JSON.stringify(data) }),
    getSchedule: () => request<any>('/direct-debit/schedule'),
  },
};
