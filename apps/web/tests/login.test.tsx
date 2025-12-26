import { render, screen } from "@testing-library/react";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  })
}));

// ✅ Import after mocks
import LoginPage from "@/app/[locale]/login/page";

const messages = {
  login: {
    title: "Login",
    email: "Email",
    password: "Password",
    submit: "Sign in"
  }
};

describe("LoginPage", () => {
  it("renders login form", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LoginPage />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
