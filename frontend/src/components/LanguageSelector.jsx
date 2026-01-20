export function LanguageSelector({
  t,
  locale,
  changeLocale,
  availableLocales,
}) {

  const flagEmoji = {
    es: "🇪🇸",
    en: "🇺🇸",
  };

  const localeName = {
    es: "Espanol",
    en: "English",
  };

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="appearance-none rounded-lg border px-3 py-2 pr-8 transition-colors cursor-pointer input-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label={t("language.select")}
      >
        {availableLocales.map((loc) => (
          <option key={loc} value={loc}>
            {flagEmoji[loc]} {localeName[loc]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 19l7-7"
          />
        </svg>
      </div>
    </div>
  );
}


