"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api";
import { setAuth, type UserRole } from "@/lib/auth";


export default function LoginPage() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const tokens = await login({ username: email, password });
      setAuth(tokens.access_token, tokens.refresh_token, tokens.role, String(tokens.org_id),tokens.user_id);
      router.push(`/${locale}/projects`);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-md px-4 sm:mt-10 sm:px-0">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold sm:text-xl">{t("title")}</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-700">{t("email")}</label>
              <Input name="email" data-testid="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-700">{t("password")}</label>
              <Input name="password" data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" data-testid="login-submit" disabled={loading} className="w-full">
              {loading ? "..." : t("submit")}
            </Button>

            <p className="text-xs text-slate-500">
              Login uses OAuth2 password form to match the FastAPI backend.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
