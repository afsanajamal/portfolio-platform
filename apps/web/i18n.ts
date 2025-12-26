export const locales = ["en", "ja"] as const;
export const defaultLocale = "en";
export type Locale = (typeof locales)[number];
