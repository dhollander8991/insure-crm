import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "./test-utils";

import { PoliciesPage } from "../routes/Policies";

vi.mock("../lib/api", () => ({
  policyApi: {
    getAll: vi.fn(),
  },
}));

vi.mock("../components/forms/NewPolicyDialog", () => ({
  NewPolicyDialog: () => <div data-testid="new-policy-dialog" />,
}));

import { policyApi } from "../lib/api";

const mockPolicies = [
  {
    id: 1,
    policyNumber: "P-001",
    customerId: 1,
    customerName: "John Doe",
    type: "CAR" as const,
    status: "ACTIVE" as const,
    startDate: "2024-01-01",
    endDate: "2026-01-01",
    premium: 200,
    agentEmail: "agent@test.com",
  },
  {
    id: 2,
    policyNumber: "P-002",
    customerId: 2,
    customerName: "Jane Smith",
    type: "LIFE" as const,
    status: "PENDING" as const,
    startDate: "2024-06-01",
    endDate: "2026-06-01",
    premium: 500,
    agentEmail: "agent@test.com",
  },
];

describe("PoliciesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton while fetching", () => {
    vi.mocked(policyApi.getAll).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<PoliciesPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders policy cards when data loads", async () => {
    vi.mocked(policyApi.getAll).mockResolvedValue(mockPolicies);
    renderWithProviders(<PoliciesPage />);

    await waitFor(
      () => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders policy numbers", async () => {
    vi.mocked(policyApi.getAll).mockResolvedValue(mockPolicies);
    renderWithProviders(<PoliciesPage />);

    await waitFor(
      () => {
        expect(screen.getByText(/P-001/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText(/P-002/)).toBeInTheDocument();
  });

  it("renders policy status badges", async () => {
    vi.mocked(policyApi.getAll).mockResolvedValue(mockPolicies);
    renderWithProviders(<PoliciesPage />);

    await waitFor(
      () => {
        expect(screen.getByText("Active")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows page heading", async () => {
    vi.mocked(policyApi.getAll).mockResolvedValue(mockPolicies);
    renderWithProviders(<PoliciesPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Policies").length).toBeGreaterThan(0);
    });
  });

  it("shows empty state when no policies exist", async () => {
    vi.mocked(policyApi.getAll).mockResolvedValue([]);
    renderWithProviders(<PoliciesPage />);

    await waitFor(
      () => {
        // With 0 policies, shows "0 of 0 policies"
        expect(screen.getByText(/0 of 0/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("shows error state when API fails", async () => {
    vi.mocked(policyApi.getAll).mockRejectedValue(
      new Error("Service unavailable"),
    );
    renderWithProviders(<PoliciesPage />);

    await waitFor(
      () => {
        expect(
          screen.getByText(/Failed to load policies/i),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("shows policy type values after data loads", async () => {
    vi.mocked(policyApi.getAll).mockResolvedValue(mockPolicies);
    renderWithProviders(<PoliciesPage />);

    await waitFor(
      () => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Type values appear in the table/cards as text content
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Life")).toBeInTheDocument();
  });

  it("shows New Policy button", async () => {
    vi.mocked(policyApi.getAll).mockResolvedValue(mockPolicies);
    renderWithProviders(<PoliciesPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /New Policy/i }),
      ).toBeInTheDocument();
    });
  });
});
