const AUTH_URL = "http://35.157.14.12:8081";
const CUSTOMER_URL = "http://35.157.14.12:8082";
const POLICY_URL = "http://35.157.14.12:8083";
const AI_URL = "http://35.157.14.12:8084";

export const tokenStorage = {
  get: () => localStorage.getItem("insurecrm_token"),
  set: (t: string) => localStorage.setItem("insurecrm_token", t),
  clear: () => localStorage.removeItem("insurecrm_token"),
};

export const emailStorage = {
  get: () => localStorage.getItem("insurecrm_email"),
  set: (e: string) => localStorage.setItem("insurecrm_email", e),
  clear: () => localStorage.removeItem("insurecrm_email"),
};

async function request<T>(base: string, path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? body.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface CustomerResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  israeliId: string;
  dateOfBirth: string;
  agentEmail: string;
  status: "ACTIVE" | "INACTIVE" | "PROSPECT";
}

export interface PolicyResponse {
  id: number;
  policyNumber: string;
  customerId: number;
  customerName: string;
  type: "CAR" | "APARTMENT" | "LIFE" | "HEALTH";
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  premium: number;
  agentEmail: string;
}

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>(AUTH_URL, "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, role: string = "AGENT") =>
    request<AuthResponse>(AUTH_URL, "/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),
};

export const customerApi = {
  getAll: () => request<CustomerResponse[]>(CUSTOMER_URL, "/customers"),
  getById: (id: number) => request<CustomerResponse>(CUSTOMER_URL, `/customers/${id}`),
  create: (data: Omit<CustomerResponse, "id">) =>
    request<CustomerResponse>(CUSTOMER_URL, "/customers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CustomerResponse>) =>
    request<CustomerResponse>(CUSTOMER_URL, `/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(CUSTOMER_URL, `/customers/${id}`, { method: "DELETE" }),
  getByAgent: (email: string) => request<CustomerResponse[]>(CUSTOMER_URL, `/customers/agent/${email}`),
};

export const policyApi = {
  getAll: () => request<PolicyResponse[]>(POLICY_URL, "/policies"),
  getById: (id: number) => request<PolicyResponse>(POLICY_URL, `/policies/${id}`),
  create: (data: Omit<PolicyResponse, "id" | "policyNumber">) =>
    request<PolicyResponse>(POLICY_URL, "/policies", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<PolicyResponse>) =>
    request<PolicyResponse>(POLICY_URL, `/policies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(POLICY_URL, `/policies/${id}`, { method: "DELETE" }),
  getByCustomer: (customerId: number) => request<PolicyResponse[]>(POLICY_URL, `/policies/customer/${customerId}`),
  getByAgent: (email: string) => request<PolicyResponse[]>(POLICY_URL, `/policies/agent/${email}`),
  getByStatus: (status: string) => request<PolicyResponse[]>(POLICY_URL, `/policies/status/${status}`),
};

export const aiApi = {
  chat: (messages: AiMessage[], agentEmail?: string) =>
    request<{ reply: string }>(AI_URL, "/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages, agentEmail }),
    }),
};
