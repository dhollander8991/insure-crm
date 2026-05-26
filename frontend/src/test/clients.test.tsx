import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "./test-utils";

import { ClientsPage } from "../routes/Clients";

vi.mock("../lib/api", () => ({
  customerApi: {
    getAll: vi.fn(),
  },
}));

// Mock NewClientDialog to avoid complex form rendering issues in tests
vi.mock("../components/forms/NewClientDialog", () => ({
  NewClientDialog: () => <div data-testid="new-client-dialog" />,
}));

import { customerApi } from "../lib/api";

const mockCustomers = [
  {
    id: 1,
    firstName: "Alice",
    lastName: "Anderson",
    email: "alice@test.com",
    phone: "050-1111111",
    israeliId: "111111111",
    dateOfBirth: "1990-01-01",
    agentEmail: "agent@test.com",
    status: "ACTIVE" as const,
  },
  {
    id: 2,
    firstName: "Bob",
    lastName: "Brown",
    email: "bob@test.com",
    phone: "050-2222222",
    israeliId: "222222222",
    dateOfBirth: "1985-05-05",
    agentEmail: "agent@test.com",
    status: "PROSPECT" as const,
  },
  {
    id: 3,
    firstName: "Carol",
    lastName: "Clark",
    email: "carol@test.com",
    phone: "050-3333333",
    israeliId: "333333333",
    dateOfBirth: "1992-03-15",
    agentEmail: "agent@test.com",
    status: "INACTIVE" as const,
  },
];

function paged(customers: typeof mockCustomers) {
  return {
    content: customers,
    totalElements: customers.length,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    numberOfElements: customers.length,
  };
}

describe("ClientsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while fetching", () => {
    vi.mocked(customerApi.getAll).mockReturnValue(new Promise(() => {}) as never);
    renderWithProviders(<ClientsPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders client names when data loads", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob Brown")).toBeInTheDocument();
    expect(screen.getByText("Carol Clark")).toBeInTheDocument();
  });

  it("renders table column headers", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText("Client")).toBeInTheDocument();
    });
    // The updated clients page has Email, Phone, Status, Date of Birth columns
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("search input by name filters clients", async () => {
    const user = userEvent.setup();
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
    });

    // The name filter is "Search by name…"
    const searchInput = screen.getByPlaceholderText("Search by name…");
    await user.type(searchInput, "Alice");

    await waitFor(() => {
      expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
      expect(screen.queryByText("Bob Brown")).not.toBeInTheDocument();
    });
  });

  it("page heading shows Clients", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Clients" }),
      ).toBeInTheDocument();
    });
  });

  it("shows count of contacts", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText(/3 of 3 contacts/)).toBeInTheDocument();
    });
  });

  it("shows empty state when no clients exist", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged([]));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText("No clients yet")).toBeInTheDocument();
    });
  });

  it("shows error state when API fails", async () => {
    vi.mocked(customerApi.getAll).mockRejectedValue(new Error("Network error") as never);
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load clients/i)).toBeInTheDocument();
    });
  });

  it("shows Add Client button", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Anderson")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /Add Client/i }),
    ).toBeInTheDocument();
  });

  it("shows status badges for clients", async () => {
    vi.mocked(customerApi.getAll).mockResolvedValue(paged(mockCustomers));
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      // "Active" badge for Alice
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
    // "Lead" for Bob (PROSPECT maps to Lead)
    expect(screen.getByText("Lead")).toBeInTheDocument();
    // "Churned" for Carol (INACTIVE maps to Churned)
    expect(screen.getByText("Churned")).toBeInTheDocument();
  });
});
