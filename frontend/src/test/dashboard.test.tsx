import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { Dashboard } from "../routes/Dashboard";

import { renderWithProviders } from "./test-utils";

// Mock heavy chart and animation-heavy dependencies
vi.mock("@/components/charts/RevenueAreaChart", () => ({
  RevenueAreaChart: () => <div data-testid="revenue-chart" />,
}));
vi.mock("@/components/charts/PoliciesDonut", () => ({
  PoliciesDonut: () => <div data-testid="policies-donut" />,
}));
vi.mock("@/components/charts/ClaimsBarChart", () => ({
  ClaimsBarChart: () => <div data-testid="claims-bar-chart" />,
}));
vi.mock("@/components/charts/PipelineFunnel", () => ({
  PipelineFunnel: () => <div data-testid="pipeline-funnel" />,
}));
vi.mock("@/components/charts/LiveCoverageGlobe", () => ({
  LiveCoverageGlobe: () => <div data-testid="coverage-globe" />,
}));

// Mock KpiCard to avoid framer-motion CountUp animation issues in jsdom
vi.mock("@/components/KpiCard", () => ({
  KpiCard: ({ label, value }: { label: string; value: number }) => (
    <div data-testid="kpi-card">
      <span data-testid="kpi-label">{label}</span>
      <span data-testid="kpi-value">{value}</span>
    </div>
  ),
}));

vi.mock("@/lib/api", () => ({
  customerApi: {
    getAll: vi.fn(),
  },
  policyApi: {
    getAll: vi.fn(),
  },
}));

import { customerApi, policyApi } from "@/lib/api";

function paged<T>(items: T[]) {
  return {
    content: items,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / 20)),
    size: 20,
    number: 0,
    first: true,
    last: true,
    numberOfElements: items.length,
  };
}

const mockCustomers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@test.com",
    phone: "050-1111111",
    israeliId: "123456789",
    dateOfBirth: "1990-01-01",
    agentEmail: "agent@test.com",
    status: "ACTIVE" as const,
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@test.com",
    phone: "050-2222222",
    israeliId: "987654321",
    dateOfBirth: "1985-05-05",
    agentEmail: "agent@test.com",
    status: "PROSPECT" as const,
  },
];

const mockPolicies = [
  {
    id: 1,
    policyNumber: "P001",
    customerId: 1,
    customerName: "John Doe",
    type: "CAR" as const,
    status: "ACTIVE" as const,
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    premium: 200,
    agentEmail: "agent@test.com",
  },
  {
    id: 2,
    policyNumber: "P002",
    customerId: 2,
    customerName: "Jane Smith",
    type: "LIFE" as const,
    status: "ACTIVE" as const,
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    premium: 300,
    agentEmail: "agent@test.com",
  },
];

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton while fetching", () => {
    vi.mocked(customerApi.getAll).mockReturnValue(new Promise(() => {}));
    vi.mocked(policyApi.getAll).mockReturnValue(new Promise(() => {}));

    renderWithProviders(<Dashboard />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders 4 KPI cards after data loads", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    vi.mocked(policyApi.getAll).mockResolvedValue(paged(mockPolicies));

    renderWithProviders(<Dashboard />);

    await waitFor(
      () => {
        const kpiCards = screen.getAllByTestId("kpi-card");
        expect(kpiCards.length).toBe(4);
      },
      { timeout: 5000 },
    );
  });

  it("renders KPI labels after data loads", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    vi.mocked(policyApi.getAll).mockResolvedValue(paged(mockPolicies));

    renderWithProviders(<Dashboard />);

    await waitFor(
      () => {
        const labels = screen.getAllByTestId("kpi-label");
        const labelTexts = labels.map((l) => l.textContent);
        expect(labelTexts).toContain("Active Policies");
      },
      { timeout: 5000 },
    );

    const labels = screen.getAllByTestId("kpi-label");
    const labelTexts = labels.map((l) => l.textContent);
    expect(labelTexts).toContain("Open Claims");
    expect(labelTexts).toContain("New Leads");
  });

  it("shows correct active policy count", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    vi.mocked(policyApi.getAll).mockResolvedValue(paged(mockPolicies));

    renderWithProviders(<Dashboard />);

    await waitFor(
      () => {
        const kpiCards = screen.getAllByTestId("kpi-card");
        expect(kpiCards.length).toBe(4);
      },
      { timeout: 5000 },
    );

    // Both policies are ACTIVE, so count should be 2
    const activePoliciesCard = screen
      .getAllByTestId("kpi-card")
      .find(
        (card) =>
          card.querySelector('[data-testid="kpi-label"]')?.textContent ===
          "Active Policies",
      );
    expect(
      activePoliciesCard?.querySelector('[data-testid="kpi-value"]')
        ?.textContent,
    ).toBe("2");
  });

  it("shows empty state with no data", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged([]));
    vi.mocked(policyApi.getAll).mockResolvedValue(paged([]));

    renderWithProviders(<Dashboard />);

    await waitFor(
      () => {
        expect(screen.getByText("No data yet")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("shows new leads count from PROSPECT customers", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    vi.mocked(policyApi.getAll).mockResolvedValue(paged([]));

    renderWithProviders(<Dashboard />);

    await waitFor(
      () => {
        const labels = screen.getAllByTestId("kpi-label");
        const labelTexts = labels.map((l) => l.textContent);
        expect(labelTexts).toContain("New Leads");
      },
      { timeout: 5000 },
    );

    // 1 PROSPECT in mockCustomers
    const newLeadsCard = screen
      .getAllByTestId("kpi-card")
      .find(
        (card) =>
          card.querySelector('[data-testid="kpi-label"]')?.textContent ===
          "New Leads",
      );
    expect(
      newLeadsCard?.querySelector('[data-testid="kpi-value"]')?.textContent,
    ).toBe("1");
  });
});
