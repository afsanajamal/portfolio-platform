"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { getRole, isAuthed, type UserRole } from "@/lib/auth";
import { createTag, listTags, type Tag } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TagsPage() {
  const locale = useLocale();
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [authed, setAuthed] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const canCreate = useMemo(() => role === "admin" || role === "editor", [role]);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthed();
      setAuthed(authenticated);
      setRole(getRole());

      // Redirect immediately if not authenticated
      if (!authenticated) {
        router.replace(`/${locale}/login`);
      }
    };

    checkAuth();

    // Listen for auth changes (e.g., when session expires and auth is cleared)
    window.addEventListener("pp-auth-changed", checkAuth);

    return () => {
      window.removeEventListener("pp-auth-changed", checkAuth);
    };
  }, [locale, router]);

  // load tags
  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await listTags();
        if (!cancelled) setTags(data);
      } catch (e: any) {
        if (cancelled) return;
        // If session expired, auth was cleared - redirect instead of showing error
        if (!isAuthed()) {
          router.replace(`/${locale}/login`);
          return;
        }
        setErr(e?.message ?? "Failed to load tags");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authed]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setCreateErr(null);
    setCreating(true);

    try {
      const created = await createTag({ name });
      setTags((prev) => [created, ...prev]);
      setName("");
    } catch (e: any) {
      // If session expired, auth was cleared - redirect instead of showing error
      if (!isAuthed()) {
        router.replace(`/${locale}/login`);
        return;
      }
      setCreateErr(e?.message ?? "Failed to create tag");
    } finally {
      setCreating(false);
    }
  }

  if (role === null) return null;
  if (!authed) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold sm:text-xl">Tags</h1>
          <p className="text-sm text-slate-600">
            {canCreate ? "Create and view tags." : "View tags (read-only)."}
          </p>
        </CardHeader>

        <CardContent>
          {canCreate ? (
            <form onSubmit={onCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end" data-testid="create-tag-form">
              <div className="flex-1 space-y-1">
                <label className="text-sm text-slate-700">Name</label>
                <Input
                  data-testid="create-tag-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <Button data-testid="create-tag-submit" type="submit" disabled={creating} className="w-full sm:w-auto">
                {creating ? "Creating..." : "Create tag"}
              </Button>

              {createErr ? <p className="text-sm text-red-600">{createErr}</p> : null}
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Tag list</h2>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : err ? (
            <p className="text-sm text-red-600">{err}</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-slate-600">No tags found.</p>
          ) : (
            <div className="flex flex-wrap gap-2" data-testid="tags-list">
              {tags.map((t) => (
                <span
                  key={t.id}
                  data-testid={`tag-${t.id}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
