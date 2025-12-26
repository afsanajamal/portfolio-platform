import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "@/lib/api";

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage for auth tokens
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock window for event dispatching
Object.defineProperty(global, "window", {
  value: {
    dispatchEvent: vi.fn(),
  },
  writable: true,
});

describe("API error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("throws readable error message on 400 response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad request: Invalid email format",
    });

    await expect(apiFetch("/test")).rejects.toThrow("Bad request: Invalid email format");
  });

  it("throws readable error message on 404 response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => "Resource not found",
    });

    await expect(apiFetch("/test")).rejects.toThrow("Resource not found");
  });

  it("throws readable error message on 500 response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal server error",
    });

    await expect(apiFetch("/test")).rejects.toThrow("Internal server error");
  });

  it("throws generic HTTP error when response has no body", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "",
    });

    await expect(apiFetch("/test")).rejects.toThrow("HTTP 403");
  });

  it("returns data on successful 200 response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({ success: true, data: "test" }),
    });

    const result = await apiFetch<{ success: boolean; data: string }>("test");
    expect(result).toEqual({ success: true, data: "test" });
  });

  it("handles 204 No Content response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await apiFetch("/test");
    expect(result).toBeUndefined();
  });

  it("includes authorization header when auth option is true", async () => {
    localStorageMock.setItem("pp_access_token", "test-token-123");

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({ data: "test" }),
    });

    await apiFetch("/test", { auth: true });

    const fetchCall = (global.fetch as any).mock.calls[0];
    const headers = fetchCall[1].headers;
    expect(headers.get("Authorization")).toBe("Bearer test-token-123");
  });
});
