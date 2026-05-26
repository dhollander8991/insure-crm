import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";

import { CommandPalette } from "../components/CommandPalette";

import { renderWithProviders } from "./test-utils";

vi.mock("../lib/api", () => ({
  customerApi: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  policyApi: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  tokenStorage: {
    clear: vi.fn(),
  },
  emailStorage: {
    clear: vi.fn(),
  },
}));

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", toggle: vi.fn() }),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mounts without crashing", () => {
    const { container } = renderWithProviders(<CommandPalette />);
    expect(container).toBeTruthy();
  });

  it("is initially closed (no dialog visible)", () => {
    renderWithProviders(<CommandPalette />);
    expect(
      screen.queryByPlaceholderText("Search…"),
    ).not.toBeInTheDocument();
  });

  it("opens on Cmd+K keypress", async () => {
    renderWithProviders(<CommandPalette />);

    await act(async () => {
      fireEvent.keyDown(window, { key: "k", metaKey: true });
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search…"),
      ).toBeInTheDocument();
    });
  });

  it("opens on Ctrl+K keypress", async () => {
    renderWithProviders(<CommandPalette />);

    await act(async () => {
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search…"),
      ).toBeInTheDocument();
    });
  });

  it("closes on Escape key", async () => {
    renderWithProviders(<CommandPalette />);

    // Open it first
    await act(async () => {
      fireEvent.keyDown(window, { key: "k", metaKey: true });
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Search…"),
      ).toBeInTheDocument();
    });

    // Close with Escape using keyDown on the dialog/document
    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Search…"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows navigation items when open", async () => {
    renderWithProviders(<CommandPalette />);

    await act(async () => {
      fireEvent.keyDown(window, { key: "k", metaKey: true });
    });

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Policies")).toBeInTheDocument();
    expect(screen.getByText("Claims")).toBeInTheDocument();
  });

  it("input is rendered when open", async () => {
    renderWithProviders(<CommandPalette />);

    await act(async () => {
      fireEvent.keyDown(window, { key: "k", metaKey: true });
    });

    await waitFor(() => {
      const input = screen.getByPlaceholderText(
        "Search…",
      );
      expect(input).toBeInTheDocument();
    });
  });
});
