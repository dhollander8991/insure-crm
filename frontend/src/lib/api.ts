const AUTH_URL = "/api/auth";
const CUSTOMER_URL = "/api/customers";
const POLICY_URL = "/api/policies";
const AI_URL = "/api/ai";

export const tokenStorage = {
  get: () => localStorage.getItem("insurecrm_token"),
  set: (token: string) => localStorage.setItem("insurecrm_token", token),
  clear: () => localStorage.removeItem("insurecrm_token"),
};

export const emailStorage = {
  get: () => localStorage.getItem("insurecrm_email"),
  set: (email: string) => localStorage.setItem("insurecrm_email", email),
  clear: () => localStorage.removeItem("insurecrm_email"),
};

async function request<T>(
  base: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${base}${path}`, { ...init, headers });

  if (response.status === 401) {
    tokenStorage.clear();
    emailStorage.clear();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as unknown as T;
  return response.json() as Promise<T>;
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
  getById: (id: number) =>
    request<CustomerResponse>(CUSTOMER_URL, `/customers/${id}`),
  create: (data: Omit<CustomerResponse, "id">) =>
    request<CustomerResponse>(CUSTOMER_URL, "/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CustomerResponse>) =>
    request<CustomerResponse>(CUSTOMER_URL, `/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(CUSTOMER_URL, `/customers/${id}`, { method: "DELETE" }),
  getByAgent: (email: string) =>
    request<CustomerResponse[]>(CUSTOMER_URL, `/customers/agent/${email}`),
};

export const policyApi = {
  getAll: () => request<PolicyResponse[]>(POLICY_URL, "/policies"),
  getById: (id: number) =>
    request<PolicyResponse>(POLICY_URL, `/policies/${id}`),
  create: (data: Omit<PolicyResponse, "id" | "policyNumber">) =>
    request<PolicyResponse>(POLICY_URL, "/policies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<PolicyResponse>) =>
    request<PolicyResponse>(POLICY_URL, `/policies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(POLICY_URL, `/policies/${id}`, { method: "DELETE" }),
  getByCustomer: (customerId: number) =>
    request<PolicyResponse[]>(POLICY_URL, `/policies/customer/${customerId}`),
  getByAgent: (email: string) =>
    request<PolicyResponse[]>(POLICY_URL, `/policies/agent/${email}`),
  getByStatus: (status: string) =>
    request<PolicyResponse[]>(POLICY_URL, `/policies/status/${status}`),
};

export const aiApi = {
  chat: async (messages: AiMessage[], agentEmail?: string) => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");
    const messageContent = lastUserMessage?.content ?? "";
    const history = messages.slice(0, -1);
    const response = await request<{ reply?: string; message?: string }>(
      AI_URL,
      "/chat",
      {
        method: "POST",
        body: JSON.stringify({ message: messageContent, agentEmail, history }),
      },
    );
    return { reply: response.reply ?? response.message ?? "" };
  },
};
