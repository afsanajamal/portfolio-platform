import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { TopNav } from "@/components/top-nav";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <TopNav />
          <main className="mx-auto max-w-5xl">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
