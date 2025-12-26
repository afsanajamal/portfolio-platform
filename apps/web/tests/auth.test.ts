import { describe, it, expect, beforeEach, vi } from "vitest";
import { isAuthed, getRole, setAuth, clearAuth, getAccessToken, getOrgId, getUserId } from "@/lib/auth";

// Mock localStorage
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
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

describe("auth.isAuthed", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("returns true when valid tokens exist", () => {
    setAuth("mock-access-token", "mock-refresh-token", "admin", "1", 1);
    expect(isAuthed()).toBe(true);
  });

  it("returns false when tokens are missing", () => {
    clearAuth();
    expect(isAuthed()).toBe(false);
  });

  it("returns false when only access token is removed", () => {
    setAuth("mock-access-token", "mock-refresh-token", "admin", "1", 1);
    localStorageMock.removeItem("pp_access_token");
    expect(isAuthed()).toBe(false);
  });
});

describe("auth.getRole", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("correctly extracts admin role from stored auth data", () => {
    setAuth("token", "refresh", "admin", "1", 1);
    expect(getRole()).toBe("admin");
  });

  it("correctly extracts editor role from stored auth data", () => {
    setAuth("token", "refresh", "editor", "1", 1);
    expect(getRole()).toBe("editor");
  });

  it("correctly extracts viewer role from stored auth data", () => {
    setAuth("token", "refresh", "viewer", "1", 1);
    expect(getRole()).toBe("viewer");
  });

  it("returns null when no role is stored", () => {
    clearAuth();
    expect(getRole()).toBe(null);
  });

  it("returns null when role is cleared", () => {
    setAuth("token", "refresh", "admin", "1", 1);
    clearAuth();
    expect(getRole()).toBe(null);
  });
});

describe("auth.setAuth and getters", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("stores all auth data correctly", () => {
    setAuth("access-123", "refresh-456", "editor", "42", 99);

    expect(getAccessToken()).toBe("access-123");
    expect(getRole()).toBe("editor");
    expect(getOrgId()).toBe("42");
    expect(getUserId()).toBe(99);
  });

  it("handles optional orgId correctly when null", () => {
    setAuth("access-123", "refresh-456", "viewer", null, 1);
    expect(getOrgId()).toBe(null);
  });

  it("handles optional userId correctly when null", () => {
    setAuth("access-123", "refresh-456", "viewer", "1", null);
    expect(getUserId()).toBe(null);
  });
});

describe("auth.clearAuth", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("removes all auth data", () => {
    setAuth("access-123", "refresh-456", "admin", "1", 1);
    clearAuth();

    expect(getAccessToken()).toBe(null);
    expect(getRole()).toBe(null);
    expect(getOrgId()).toBe(null);
    expect(getUserId()).toBe(null);
    expect(isAuthed()).toBe(false);
  });
});
