"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import {
  clearAuth,
  getOrgId,
  getRole,
  isAuthed,
  type UserRole,
} from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function TopNav() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const router = useRouter()

  const [authed, setAuthed] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => {
      setAuthed(isAuthed())
      setRole(getRole())
      setOrgId(getOrgId())
    }
    sync() // initial load

    window.addEventListener("pp-auth-changed", sync)
    window.addEventListener("storage", sync) // multi-tab support

    return () => {
      window.removeEventListener("pp-auth-changed", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  function logout() {
    clearAuth()
    router.replace(`/${locale}/login`)
  }

  const canSeeUsers = role === "admin"
  const canSeeActivity = role === "admin"

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="font-semibold text-slate-900">
            Portfolio Platform
          </Link>
          {authed && orgId ? (
            <span className="text-xs text-slate-500">Org: {orgId}</span>
          ) : null}
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            className="text-sm text-slate-700 hover:text-slate-900"
            href={`/${locale}/projects`}
          >
            {t("projects")}
          </Link>
          {authed && (
            <Link
              className="text-sm text-slate-700 hover:text-slate-900"
              href={`/${locale}/tags`}
            >
              Tags
            </Link>
          )}
          {canSeeUsers && (
            <Link
              className="text-sm text-slate-700 hover:text-slate-900"
              href={`/${locale}/users`}
            >
              {t("users")}
            </Link>
          )}
          {canSeeActivity && (
            <Link
              className="text-sm text-slate-700 hover:text-slate-900"
              href={`/${locale}/activity`}
            >
              {t("activity")}
            </Link>
          )}

          <div>
            <LanguageSwitcher />
          </div>

          {authed ? (
            <Button className="h-9" variant="outline" onClick={logout}>
              {t("logout")}
            </Button>
          ) : (
            <Link href={`/${locale}/login`}>
              <Button className="h-9" variant="outline">
                {t("login")}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
