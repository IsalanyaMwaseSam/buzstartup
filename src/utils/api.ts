import type { BusinessProfile, Order } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
const TOKEN_KEY = 'business_hub_auth_token';
const USER_KEY = 'business_hub_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface CloudBusinessRecord {
  id?: string;
  name?: string;
  businessName?: string;
  owner_name?: string;
  ownerName?: string;
  phone?: string;
  phone_prefix?: string;
  phonePrefix?: string;
  email?: string;
  currency?: string;
  currency_code?: string;
  currencyCode?: string;
  country_code?: string;
  countryCode?: string;
  tax_reserve_rate?: number;
  taxReserveRate?: number;
  address?: string;
  tagline?: string;
  logo_url?: string;
  logoUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  business: CloudBusinessRecord;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setAuthSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Check Backend Server Status
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

// User Authentication
export async function registerBusinessUser(payload: {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  phone?: string;
  phonePrefix?: string;
  currency?: string;
  currencyCode?: string;
  countryCode?: string;
  tagline?: string;
  address?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register account.');
  }

  setAuthSession(data.token, data.user);
  return data;
}

export async function loginBusinessUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid email or password.');
  }

  setAuthSession(data.token, data.user);
  return data;
}

export async function fetchCurrentMe(): Promise<AuthResponse | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: authHeaders(),
    });

    if (!res.ok) {
      clearAuthSession();
      return null;
    }

    const data = await res.json();
    return {
      token,
      user: data.user,
      business: data.business,
    };
  } catch {
    return null;
  }
}

// Business Profile & Logo Sync
export async function updateBusinessProfileApi(profile: Partial<BusinessProfile>): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/business/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(profile),
    });
  } catch {
    // Non-blocking fallback
  }
}

export async function uploadBusinessLogoApi(file: File): Promise<string | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch(`${API_BASE_URL}/business/logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.logo_url || null;
  } catch {
    return null;
  }
}

// Cloud Orders API
export async function fetchOrdersApi(): Promise<Order[] | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.orders || [];
  } catch {
    return null;
  }
}

export async function createOrderApi(order: Order): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateOrderApi(orderId: string, updates: Partial<Order>): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Public Electronic Receipt (No Auth Required)
export async function fetchPublicReceiptApi(orderNumber: string): Promise<{ order: Order; business: BusinessProfile } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/receipt/${orderNumber}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}
