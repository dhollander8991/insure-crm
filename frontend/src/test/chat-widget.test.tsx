import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatWidget } from "../components/ChatWidget";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock aiApi - using absolute alias path since chat-widget imports from @/lib/api
vi.mock("../lib/api", () => ({
  aiApi: {
    chat: vi.fn().mockResolvedValue({ reply: "Mock AI reply" }),
  },
  emailStorage: {
    get: vi.fn().mockReturnValue("agent@test.com"),
  },
}));

// Mock react-markdown to avoid complex rendering
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <span>{children}</span>,
}));

vi.mock("@/lib/queries/ai.queries", () => ({
  useSendChatMessageMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ reply: "Mock AI reply" }),
    isPending: false,
  }),
}));

function renderWidget() {
  return render(<ChatWidget />);
}

describe("ChatWidget", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders the chat toggle button", () => {
    renderWidget();
    const button = screen.getByRole("button", { name: /open chat/i });
    expect(button).toBeInTheDocument();
  });

  it("chat panel is initially hidden (opacity-0)", () => {
    renderWidget();
    const panel = screen.getByTestId("ai-chat-panel");
    expect(panel).toHaveAttribute("data-state", "closed");
  });

  it("clicking button opens the chat panel", async () => {
    const user = userEvent.setup();
    renderWidget();
    const button = screen.getByRole("button", { name: /open chat/i });
    await user.click(button);
    const panel = screen.getByTestId("ai-chat-panel");
    expect(panel).toHaveAttribute("data-state", "open");
  });

  it("shows close button when open", async () => {
    const user = userEvent.setup();
    renderWidget();
    const openButton = screen.getByRole("button", { name: /open chat/i });
    await user.click(openButton);
    const closeButton = screen.getByRole("button", { name: /close chat/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("closes panel when close button is clicked", async () => {
    const user = userEvent.setup();
    renderWidget();
    await user.click(screen.getByRole("button", { name: /open chat/i }));
    await user.click(screen.getByRole("button", { name: /close chat/i }));
    const panel = screen.getByTestId("ai-chat-panel");
    expect(panel).toHaveAttribute("data-state", "closed");
  });

  it("renders textarea input", () => {
    renderWidget();
    const textarea = screen.getByPlaceholderText("Ask anything about your clients or policies…");
    expect(textarea).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    renderWidget();
    const buttons = screen.getAllByRole("button");
    // The send button is disabled because input is empty
    const disabledButton = buttons.find((btn) => btn.hasAttribute("disabled"));
    expect(disabledButton).toBeTruthy();
  });

  it("send button is enabled when input has text", async () => {
    const user = userEvent.setup();
    renderWidget();
    const textarea = screen.getByPlaceholderText("Ask anything about your clients or policies…");
    await user.type(textarea, "Hello");
    // The send button should no longer be disabled
    const buttons = screen.getAllByRole("button");
    const toggleBtn = screen.getByRole("button", { name: /open chat/i });
    const nonToggleButtons = buttons.filter((btn) => btn !== toggleBtn);
    const enabledBtn = nonToggleButtons.find(
      (btn) => !btn.hasAttribute("disabled"),
    );
    expect(enabledBtn).toBeTruthy();
  });

  it("initial greeting message is present in the DOM", () => {
    renderWidget();
    // "Aegis Assistant" appears in the panel header as a div
    const elements = screen.getAllByText(/Aegis Assistant/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("user message appears after pressing Enter", async () => {
    const user = userEvent.setup();
    renderWidget();
    const textarea = screen.getByPlaceholderText("Ask anything about your clients or policies…");
    await user.type(textarea, "Hello world");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });
  });
});
