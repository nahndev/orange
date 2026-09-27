import { COUNTRIES } from "@orange/language";

export function LanguageName({ country }: { country: string }) {
  const language = COUNTRIES.find(({ code }) => code === country);
  return <>{language?.name ?? country}</>;
}
