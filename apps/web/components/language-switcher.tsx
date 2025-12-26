"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/i18n/config";

function switchLocalePath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  if (parts.length > 1 && locales.includes(parts[1] as any)) {
    parts[1] = to;
    return parts.join("/") || `/${to}`;
  }
  return `/${to}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const current = useLocale() as Locale;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="hidden text-xs text-slate-500 sm:inline">{t("language")}:</span>
      <Link href={switchLocalePath(pathname, "en")} aria-current={current === "en"}>
        <Button variant={current === "en" ? "default" : "outline"} className="h-8 px-2 text-xs sm:px-3 sm:text-sm">
          {t("english")}
        </Button>
      </Link>
      <Link href={switchLocalePath(pathname, "ja")} aria-current={current === "ja"}>
        <Button variant={current === "ja" ? "default" : "outline"} className="h-8 px-2 text-xs sm:px-3 sm:text-sm">
          {t("japanese")}
        </Button>
      </Link>
    </div>
  );
}
