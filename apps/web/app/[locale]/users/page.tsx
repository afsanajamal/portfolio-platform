"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { getRole, isAuthed, type UserRole as AuthUserRole } from "@/lib/auth";
import { createUser, listUsers, type User } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CreateForm = {
  email: string;
  password: string;
  role: "editor" | "viewer";
};

export default function UsersPage() {
  const locale = useLocale();
  const router = useRouter();

  const [role, setRole] = useState<AuthUserRole | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<CreateForm>({ email: "", password: "", role: "viewer" });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const isAdmin = useMemo(() => role === "admin", [role]);

  // Get role from localStorage (client-side) and redirect if not admin
  useEffect(() => {
    const checkAuth = () => {
      const userRole = getRole();
      setRole(userRole);

      // Redirect immediately if not admin (includes null/not authenticated)
      if (userRole !== "admin") {
        router.replace(`/${locale}/projects`);
      }
    };

    checkAuth();

    // Listen for auth changes (e.g., when session expires and auth is cleared)
    window.addEventListener("pp-auth-changed", checkAuth);

    return () => {
      window.removeEventListener("pp-auth-changed", checkAuth);
    };
  }, [locale, router]);

  // Load users (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await listUsers();
        if (!cancelled) setUsers(data);
      } catch (e: any) {
        if (cancelled) return;
        // If session expired, auth was cleared - redirect instead of showing error
        if (!isAuthed()) {
          router.replace(`/${locale}/login`);
          return;
        }
        setErr(e?.message ?? "Failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateErr(null);
    setCreating(true);

    try {
      const created = await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm({ email: "", password: "", role: "viewer" });
    } catch (e: any) {
      // If session expired, auth was cleared - redirect instead of showing error
      if (!isAuthed()) {
        router.replace(`/${locale}/login`);
        return;
      }
      setCreateErr(e?.message ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  // Keep UI quiet while role is unknown / redirecting
  if (role === null) return null;
  if (!isAdmin) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold sm:text-xl">Users</h1>
          <p className="text-sm text-slate-600">Admin only: create and view users.</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm text-slate-700">Email</label>
              <Input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                type="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-700">Password</label>
              <Input
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                type="password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-700">Role</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as CreateForm["role"] }))}
              >
                <option value="viewer">viewer</option>
                <option value="editor">editor</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center md:col-span-3">
              <Button type="submit" disabled={creating} className="w-full sm:w-auto">
                {creating ? "Creating..." : "Create user"}
              </Button>

              {createErr ? <p className="text-sm text-red-600">{createErr}</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold sm:text-lg">User list</h2>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : err ? (
            <p className="text-sm text-red-600">{err}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-600">No users found.</p>
          ) : (
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pl-4 pr-4 sm:pl-0">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Org</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={String(u.id)} className="border-b border-slate-100">
                      <td className="py-2 pl-4 pr-4 sm:pl-0">{u.email}</td>
                      <td className="py-2 pr-4">{u.role}</td>
                      <td className="py-2 pr-4">{u.org_id ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
