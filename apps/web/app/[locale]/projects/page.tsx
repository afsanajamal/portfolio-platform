"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listTags,
  type Project,
  type Tag,
} from "@/lib/api";
import { getRole, getUserId, type UserRole } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CreateForm = {
  title: string;
  description: string;
  github_url: string;
  is_public: boolean;
  tag_ids: number[];
};

export default function ProjectsPage() {
  const locale = useLocale();
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const t = useTranslations("projects");

  const [role, setRole] = useState<UserRole | null>(null);
  const canMutate = useMemo(() => role === "admin" || role === "editor", [role]);

  const [items, setItems] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [form, setForm] = useState<CreateForm>({
    title: "",
    description: "",
    github_url: "",
    is_public: true,
    tag_ids: [],
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CreateForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const myUserId = getUserId();

  const canDeleteProject = (p: Project) => {
    if (role === "admin") return true;
    if (role === "editor" && p.owner_id === myUserId) return true;
    return false;
  };

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

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectsData, tagsData] = await Promise.all([
          listProjects({ limit, offset }),
          listTags()
        ]);
        if (!cancelled) {
          setItems(projectsData);
          setTags(tagsData);
        }
      } catch (e: any) {
        if (cancelled) return;
        // If session expired, auth was cleared - redirect instead of showing error
        if (!isAuthed()) {
          router.replace(`/${locale}/login`);
          return;
        }
        setError(typeof e?.message === "string" ? e.message : "Failed to load");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authed, locale, router, limit, offset]);

  const tagsById = useMemo(() => {
  const m = new Map<number, string>();
  for (const t of tags) m.set(t.id, t.name);
  return m;
  }, [tags]);

  const tagNames = useMemo(() => {
    return form.tag_ids.map((id) => tagsById.get(id)).filter(Boolean) as string[];
  }, [form.tag_ids, tagsById]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canMutate) return;

    setCreateErr(null);
    setCreating(true);

    try {
      const created = await createProject({
        title: form.title,
        description: form.description,
        github_url: form.github_url,
        is_public: form.is_public,
        tag_names: tagNames,
      });

      setItems((prev) => [created, ...prev]);
      setForm({ title: "", description: "", github_url: "", is_public: true, tag_ids: [] });
    } catch (e: any) {
      // If session expired, auth was cleared - redirect instead of showing error
      if (!isAuthed()) {
        router.replace(`/${locale}/login`);
        return;
      }
      setCreateErr(e?.message ?? "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      description: p.description,
      github_url: p.github_url,
      is_public: p.is_public,
      tag_ids: (p.tags ?? []).map((x) => x.id),
    });
  }

  async function saveEdit(projectId: number) {
    if (!editForm) return;

    setSavingEdit(true);
    try {
      const editTagNames =
      editForm.tag_ids.map((id) => tagsById.get(id)).filter(Boolean) as string[];

      const updated = await updateProject(projectId, {
        title: editForm.title,
        description: editForm.description,
        github_url: editForm.github_url,
        is_public: editForm.is_public,
        tag_names: editTagNames,
      });

      setItems((prev) => prev.map((x) => (x.id === projectId ? updated : x)));
      setEditingId(null);
      setEditForm(null);
    } catch (e: any) {
      // If session expired, auth was cleared - redirect instead of showing error
      if (!isAuthed()) {
        router.replace(`/${locale}/login`);
        return;
      }
      alert(e?.message ?? "Failed to update");
    } finally {
      setSavingEdit(false);
    }
  }

  async function onDelete(projectId: number) {
    if (!canMutate) return;
    if (!confirm("Delete this project?")) return;

    try {
      await deleteProject(projectId);
      setItems((prev) => prev.filter((x) => x.id !== projectId));
    } catch (e: any) {
      // If session expired, auth was cleared - redirect instead of showing error
      if (!isAuthed()) {
        router.replace(`/${locale}/login`);
        return;
      }
      alert(e?.message ?? "Failed to delete");
    }
  }

  function toggleTag(tagId: number, current: number[], set: (v: number[]) => void) {
    if (current.includes(tagId)) set(current.filter((id) => id !== tagId));
    else set([...current, tagId]);
  }

  // ⛔ stop rendering until auth state is known
  if (role === null) return null;
  if (!authed) return null;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <h1 className="text-xl font-semibold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-slate-500">Role: {role ?? "-"}</p>
      </div>

      {canMutate ? (
        <Card>
          <CardHeader>
            <p className="text-sm text-slate-600">Create project (admin/editor)</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-slate-700">Title</label>
                <Input
                  data-testid="create-project-title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-700">GitHub URL</label>
                <Input
                  data-testid="create-project-url"
                  value={form.github_url}
                  onChange={(e) => setForm((p) => ({ ...p, github_url: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-slate-700">Description</label>
                <Input
                  data-testid="create-project-description"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = form.tag_ids.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id, form.tag_ids, (v) => setForm((p) => ({ ...p, tag_ids: v })))}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <Button type="submit" disabled={creating} data-testid="create-project-submit">
                  {creating ? "Creating..." : "Create"}
                </Button>
                {createErr ? <p className="text-sm text-red-600">{createErr}</p> : null}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <p className="text-sm text-slate-600">Authenticated endpoint: GET /projects</p>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-slate-600">Loading...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!loading && !error && items.length === 0 ? <p className="text-sm text-slate-600">{t("empty")}</p> : null}

          <ul className="mt-2 space-y-2">
            {items.map((p) => {
              const isEditing = editingId === p.id;

              return (
                <li key={p.id} className="rounded-md border border-slate-200 p-3" data-testid={`project-${p.id}`}>
                  {isEditing && editForm ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-sm text-slate-700">Title</label>
                          <Input
                            data-testid="edit-project-title"
                            value={editForm.title}
                            onChange={(e) => setEditForm((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm text-slate-700">GitHub URL</label>
                          <Input
                            data-testid="edit-project-url"
                            value={editForm.github_url}
                            onChange={(e) =>
                              setEditForm((prev) => (prev ? { ...prev, github_url: e.target.value } : prev))
                            }
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm text-slate-700">Description</label>
                          <Input
                            data-testid="edit-project-description"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const active = editForm.tag_ids.includes(tag.id);
                          return (
                            <button
                              type="button"
                              key={tag.id}
                              onClick={() =>
                                toggleTag(tag.id, editForm.tag_ids, (v) => setEditForm((p) => (p ? { ...p, tag_ids: v } : p)))
                              }
                              className={`rounded-full border px-3 py-1 text-sm ${
                                active
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button disabled={savingEdit} onClick={() => saveEdit(p.id)} data-testid="save-project">
                          {savingEdit ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditForm(null);
                          }}
                          data-testid="cancel-edit"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{p.title}</div>
                          <div className="text-sm text-slate-600">{p.description}</div>
                          <a className="mt-1 block text-xs text-slate-500 underline" href={p.github_url} target="_blank" rel="noreferrer">
                            {p.github_url}
                          </a>
                        </div>

                        {canMutate ? (
                          <div className="flex gap-2 sm:flex-col sm:gap-1">
                            <Button className="h-8 text-sm" variant="outline" onClick={() => startEdit(p)} data-testid={`edit-project-${p.id}`}>
                              Edit
                            </Button>
                             {canDeleteProject(p) && (
                                <Button className="h-8 text-sm" variant="outline" onClick={() => onDelete(p.id)} data-testid={`delete-project-${p.id}`}>
                                  Delete
                                </Button>
                              )}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(p.tags ?? []).map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

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
              disabled={items.length < limit || loading}
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
