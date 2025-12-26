"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { getRole, isAuthed, type UserRole as AuthUserRole } from "@/lib/auth";
import { listActivity, type ActivityLog, listUsers } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatAbsolute(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  if (Number.isNaN(ms)) return "";

  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
}

function ActionBadge({ action }: { action: string }) {
  const a = action.toLowerCase();

  const cls =
    a.includes("create") || a.includes("add")
      ? "bg-green-50 text-green-700 border-green-200"
      : a.includes("update") || a.includes("edit")
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : a.includes("delete") || a.includes("remove")
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {action}
    </span>
  );
}

export default function ActivityPage() {
  const locale = useLocale();
  const router = useRouter();

  const [role, setRole] = useState<AuthUserRole | null>(null);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [usersById, setUsersById] = useState<Record<string, string>>({});
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const canSeeActivity = useMemo(() => role === "admin", [role])

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

  // Load users once to show actor email
  useEffect(() => {
    if (!canSeeActivity) return;

    let cancelled = false;

    (async () => {
      try {
        const users = await listUsers();
        if (cancelled) return;

        const map: Record<string, string> = {};
        for (const u of users) map[String(u.id)] = u.email;
        setUsersById(map);
      } catch {
        setUsersById({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canSeeActivity]);

  // Load activity (paged)
  useEffect(() => {
    if (!canSeeActivity) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await listActivity({ limit, offset });
        if (!cancelled) setLogs(data);
      } catch (e: any) {
        if (cancelled) return;
        // If session expired, auth was cleared - redirect instead of showing error
        if (!isAuthed()) {
          router.replace(`/${locale}/login`);
          return;
        }
        setErr(e?.message ?? "Failed to load activity");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canSeeActivity, limit, offset]);

  const entityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) set.add(l.entity);
    return ["all", ...Array.from(set).sort()];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (entityFilter === "all") return logs;
    return logs.filter((l) => l.entity === entityFilter);
  }, [logs, entityFilter]);

  if (role === null) return null;
  if (!canSeeActivity) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold sm:text-xl">Activity</h1>
          <p className="text-sm text-slate-600">Recent audit events (admin only).</p>
        </CardHeader>

        <CardContent>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <label className="text-sm text-slate-700">Entity:</label>
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setOffset(0);
              }}
            >
              {entityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : err ? (
            <p className="text-sm text-red-600">{err}</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-sm text-slate-600">No activity found.</p>
          ) : (
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pl-4 pr-4 sm:pl-0">Time</th>
                    <th className="py-2 pr-4">Action</th>
                    <th className="py-2 pr-4">Entity</th>
                    <th className="py-2 pr-4">Entity ID</th>
                    <th className="py-2 pr-4">Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l) => (
                    <tr key={String(l.id)} className="border-b border-slate-100 align-top">
                      <td className="py-2 pl-4 pr-4 whitespace-nowrap sm:pl-0">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm">{formatRelative(l.created_at)}</span>
                          <span className="hidden text-xs text-slate-500 sm:inline">{formatAbsolute(l.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <ActionBadge action={l.action} />
                      </td>
                      <td className="py-2 pr-4">{l.entity}</td>
                      <td className="py-2 pr-4">{l.entity_id}</td>
                      <td className="py-2 pr-4">
                        {usersById[String(l.actor_user_id)] ?? `User #${l.actor_user_id}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-9 text-sm"
              disabled={offset === 0 || loading}
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              className="h-9 text-sm"
              disabled={logs.length < limit || loading}
              onClick={() => setOffset((o) => o + limit)}
            >
              Next
            </Button>
            <span className="text-xs text-slate-600 sm:text-sm">offset: {offset}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
