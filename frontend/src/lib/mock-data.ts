export type ClientStatus = "Lead" | "Active" | "Churned";
export type PolicyType = "Life" | "Auto" | "Home" | "Health";
export type PolicyStatus = "Active" | "Pending" | "Expired";
export type ClaimStatus = "Open" | "In Review" | "Approved" | "Rejected";
export type ClaimSeverity = "Low" | "Medium" | "High";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  lifetimeValue: number;
  policiesCount: number;
  joinedAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  clientId: string;
  clientName: string;
  type: PolicyType;
  premium: number;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
}

export interface Claim {
  id: string;
  clientName: string;
  policyType: PolicyType;
  amount: number;
  daysOpen: number;
  status: ClaimStatus;
  severity: ClaimSeverity;
  description: string;
  filedAt: string;
}

const firstNames = ["Olivia", "Liam", "Emma", "Noah", "Ava", "Elijah", "Sophia", "Lucas", "Isabella", "Mason", "Mia", "Logan", "Charlotte", "Ethan", "Amelia", "James", "Harper", "Benjamin", "Evelyn", "Henry", "Abigail", "Alexander", "Emily", "Daniel", "Ella"];
const lastNames = ["Carter", "Bennett", "Hayes", "Reed", "Brooks", "Foster", "Hughes", "Morgan", "Russell", "Stone", "Walker", "Parker", "Coleman", "Ward", "Bell", "Murphy", "Cooper", "Rivera", "Sanders", "Price", "Bennett", "Powell", "Long", "Patterson", "Hughes"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Seeded-ish so output is stable across renders
let seed = 42;
const r = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
const rint = (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;

export const clients: Client[] = Array.from({ length: 25 }, (_, i) => {
  const first = pick(firstNames);
  const last = pick(lastNames);
  const status: ClientStatus = r() < 0.7 ? "Active" : r() < 0.7 ? "Lead" : "Churned";
  return {
    id: `CL-${1000 + i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: `+1 (555) ${rint(200, 999)}-${rint(1000, 9999)}`,
    status,
    lifetimeValue: rint(800, 45000),
    policiesCount: status === "Lead" ? 0 : rint(1, 4),
    joinedAt: new Date(Date.now() - rint(30, 1200) * 86400000).toISOString(),
  };
});

const policyTypes: PolicyType[] = ["Life", "Auto", "Home", "Health"];

export const policies: Policy[] = Array.from({ length: 40 }, (_, i) => {
  const client = pick(clients.filter((c) => c.status !== "Lead"));
  const type = pick(policyTypes);
  const start = new Date(Date.now() - rint(30, 800) * 86400000);
  const end = new Date(start.getTime() + 365 * 86400000);
  const status: PolicyStatus = end.getTime() < Date.now() ? "Expired" : r() < 0.1 ? "Pending" : "Active";
  return {
    id: `P-${2000 + i}`,
    policyNumber: `POL-${rint(100000, 999999)}`,
    clientId: client.id,
    clientName: client.name,
    type,
    premium: rint(40, 800),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    status,
  };
});

const claimStatuses: ClaimStatus[] = ["Open", "In Review", "Approved", "Rejected"];
const severities: ClaimSeverity[] = ["Low", "Medium", "High"];
const claimDescriptions = [
  "Vehicle collision on highway",
  "Water damage from burst pipe",
  "Hospitalization expenses",
  "Theft of personal property",
  "Storm damage to roof",
  "Medical procedure coverage",
  "Fire damage in kitchen",
  "Rear-end collision",
];

export const claims: Claim[] = Array.from({ length: 22 }, (_, i) => {
  const policy = pick(policies);
  return {
    id: `CLM-${3000 + i}`,
    clientName: policy.clientName,
    policyType: policy.type,
    amount: rint(500, 25000),
    daysOpen: rint(1, 45),
    status: pick(claimStatuses),
    severity: pick(severities),
    description: pick(claimDescriptions),
    filedAt: new Date(Date.now() - rint(1, 60) * 86400000).toISOString(),
  };
});

// 12 months revenue
const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
export const revenueData = months.map((m, i) => ({
  month: m,
  premiums: 80000 + i * 4500 + rint(-8000, 12000),
  claims: 25000 + rint(-5000, 15000) + i * 800,
}));

export const policyTypeData = policyTypes.map((type) => ({
  type,
  count: policies.filter((p) => p.type === type).length,
}));

export const claimStatusData = claimStatuses.map((status) => ({
  status,
  count: claims.filter((c) => c.status === status).length,
}));

export const pipelineData = [
  { stage: "New Leads", count: 48 },
  { stage: "Contacted", count: 34 },
  { stage: "Qualified", count: 22 },
  { stage: "Proposal", count: 14 },
  { stage: "Won", count: 9 },
];

export const recentActivity = [
  { id: 1, type: "policy", text: "New auto policy issued for Olivia Carter", time: "2m ago" },
  { id: 2, type: "claim", text: "Claim CLM-3012 approved — $4,200", time: "18m ago" },
  { id: 3, type: "lead", text: "New lead: Noah Bennett requested a quote", time: "1h ago" },
  { id: 4, type: "renewal", text: "Home policy POL-482910 renewed", time: "3h ago" },
  { id: 5, type: "claim", text: "Claim CLM-3007 moved to In Review", time: "5h ago" },
];

export const kpis = {
  totalPremium: revenueData.reduce((s, m) => s + m.premiums, 0),
  activePolicies: policies.filter((p) => p.status === "Active").length,
  openClaims: claims.filter((c) => c.status === "Open" || c.status === "In Review").length,
  newLeads: clients.filter((c) => c.status === "Lead").length,
};
