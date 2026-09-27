import * as countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/vi.json";

countries.registerLocale(enLocale);

export interface Country {
  code: string;
  name: string;
}

export const COUNTRIES: Country[] = countries
  .getSupportedLanguages()
  .map((code: string) => ({
    code,
    name: new Intl.DisplayNames([code], { type: "language" }).of(code) ?? "",
  }));
