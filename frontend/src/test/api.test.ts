import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import {
  tokenStorage,
  emailStorage,
  authApi,
  customerApi,
  policyApi,
  aiApi,
} from "../lib/api";

describe("tokenStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when empty", () => expect(tokenStorage.get()).toBeNull());

  it("stores and retrieves token", () => {
    tokenStorage.set("abc123");
    expect(tokenStorage.get()).toBe("abc123");
  });

  it("clears token", () => {
    tokenStorage.set("abc123");
    tokenStorage.clear();
    expect(tokenStorage.get()).toBeNull();
  });
});

describe("emailStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when empty", () => expect(emailStorage.get()).toBeNull());

  it("stores and retrieves email", () => {
    emailStorage.set("a@b.com");
    expect(emailStorage.get()).toBe("a@b.com");
  });

  it("clears email", () => {
    emailStorage.set("a@b.com");
    emailStorage.clear();
    expect(emailStorage.get()).toBeNull();
  });
});

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  });
}

function mockFetchError(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("authApi", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("login POSTs to /auth/login", async () => {
    const mockFetch = mockFetchOk({
      token: "tok",
      email: "a@b.com",
      role: "AGENT",
    });
    vi.stubGlobal("fetch", mockFetch);
    await authApi.login("a@b.com", "password");
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/auth/login");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.email).toBe("a@b.com");
    expect(body.password).toBe("password");
  });
});

describe("customerApi", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("getAll GETs /customers", async () => {
    const mockFetch = mockFetchOk([]);
    vi.stubGlobal("fetch", mockFetch);
    await customerApi.getAll();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/customers");
  });
});

describe("policyApi", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("getAll GETs /policies", async () => {
    const mockFetch = mockFetchOk([]);
    vi.stubGlobal("fetch", mockFetch);
    await policyApi.getAll();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/policies");
  });
});

describe("aiApi", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("chat POSTs with messages and agentEmail", async () => {
    const mockFetch = mockFetchOk({ reply: "Hello!" });
    vi.stubGlobal("fetch", mockFetch);
    const messages = [{ role: "user" as const, content: "Hi" }];
    await aiApi.chat(messages, "agent@test.com");
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/ai/chat");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.message).toBe("Hi");
    expect(body.agentEmail).toBe("agent@test.com");
  });
});

describe("request - error handling", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("401 response clears token and email storage and throws", async () => {
    tokenStorage.set("old-token");
    emailStorage.set("user@test.com");

    const mockFetch = mockFetchError(401, { error: "Unauthorized" });
    vi.stubGlobal("fetch", mockFetch);

    await expect(customerApi.getAll()).rejects.toThrow("Unauthorized");
    expect(tokenStorage.get()).toBeNull();
    expect(emailStorage.get()).toBeNull();
  });

  it("non-401 error throws error from body.error", async () => {
    const mockFetch = mockFetchError(500, { error: "Internal Server Error" });
    vi.stubGlobal("fetch", mockFetch);
    await expect(customerApi.getAll()).rejects.toThrow("Internal Server Error");
  });

  it("non-401 error throws error from body.message when no body.error", async () => {
    const mockFetch = mockFetchError(404, { message: "Not Found" });
    vi.stubGlobal("fetch", mockFetch);
    await expect(customerApi.getAll()).rejects.toThrow("Not Found");
  });

  it("non-401 error throws HTTP status when no body.error or message", async () => {
    const mockFetch = mockFetchError(503, {});
    vi.stubGlobal("fetch", mockFetch);
    await expect(customerApi.getAll()).rejects.toThrow("HTTP 503");
  });

  it("attaches Bearer token when token is set", async () => {
    tokenStorage.set("my-token");
    const mockFetch = mockFetchOk([]);
    vi.stubGlobal("fetch", mockFetch);
    await customerApi.getAll();
    const [, init] = mockFetch.mock.calls[0];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer my-token");
  });
});
