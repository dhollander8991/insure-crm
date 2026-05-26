import * as SecureStore from 'expo-secure-store';

const BASE = 'https://insurecrm-navy.vercel.app';
const AUTH_URL = `${BASE}/api/auth`;
const CUSTOMER_URL = `${BASE}/api/customers`;
const POLICY_URL = `${BASE}/api/policies`;
const AI_URL = `${BASE}/api/ai`;

export const tokenStorage = {
  get: () => SecureStore.getItemAsync('insurecrm_token'),
  set: (token: string) => SecureStore.setItemAsync('insurecrm_token', token),
  clear: () => SecureStore.deleteItemAsync('insurecrm_token'),
};

export const emailStorage = {
  get: () => SecureStore.getItemAsync('insurecrm_email'),
  set: (email: string) => SecureStore.setItemAsync('insurecrm_email', email),
  clear: () => SecureStore.deleteItemAsync('insurecrm_email'),
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    await tokenStorage.clear();
    await emailStorage.clear();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; role: string; }
export interface AuthResponse { token: string; email: string; role: string; }

export const authApi = {
  login: (data: LoginRequest) =>
    request<AuthResponse>(`${AUTH_URL}/login`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  register: (data: RegisterRequest) =>
    request<AuthResponse>(`${AUTH_URL}/register`, {
      method: 'POST', body: JSON.stringify(data),
    }),
};

// ─── Customers ───────────────────────────────────────────────────────────────

export interface CustomerResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  israeliId: string;
  dateOfBirth: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  agentEmail: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  israeliId: string;
  dateOfBirth: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  agentEmail: string;
}

export const customerApi = {
  getAll: (page = 0, size = 20) =>
    request<PaginatedResponse<CustomerResponse>>(`${CUSTOMER_URL}?page=${page}&size=${size}`),
  getById: (id: number) =>
    request<CustomerResponse>(`${CUSTOMER_URL}/${id}`),
  create: (data: CreateCustomerRequest) =>
    request<CustomerResponse>(CUSTOMER_URL, {
      method: 'POST', body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CreateCustomerRequest>) =>
    request<CustomerResponse>(`${CUSTOMER_URL}/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    }),
};

// ─── Policies ────────────────────────────────────────────────────────────────

export interface PolicyResponse {
  id: number;
  policyNumber: string;
  customerId: number;
  customerName: string;
  type: 'CAR' | 'APARTMENT' | 'LIFE' | 'HEALTH';
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  premium: number;
  agentEmail: string;
}

export interface CreatePolicyRequest {
  customerId: number;
  customerName: string;
  type: 'CAR' | 'APARTMENT' | 'LIFE' | 'HEALTH';
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  premium: number;
  agentEmail: string;
}

export const policyApi = {
  getAll: (page = 0, size = 20) =>
    request<PaginatedResponse<PolicyResponse>>(`${POLICY_URL}?page=${page}&size=${size}`),
  getById: (id: number) =>
    request<PolicyResponse>(`${POLICY_URL}/${id}`),
  getByCustomer: (customerId: number) =>
    request<PolicyResponse[]>(`${POLICY_URL}/customer/${customerId}`),
  create: (data: CreatePolicyRequest) =>
    request<PolicyResponse>(POLICY_URL, {
      method: 'POST', body: JSON.stringify(data),
    }),
};

// ─── AI ──────────────────────────────────────────────────────────────────────

export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface ChatRequest { message: string; history: ChatMessage[]; }
export interface ChatResponse { message?: string; response?: string; }

export const aiApi = {
  chat: (data: ChatRequest) =>
    request<ChatResponse>(`${AI_URL}/chat`, {
      method: 'POST', body: JSON.stringify(data),
    }),
};
