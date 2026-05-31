/**
 * Static category registry and pure lookup helpers.
 * No DOM, no localStorage, no side effects.
 */

export type PriceCategory = {
  id: string;
  label: string;
  icon: string;
  prefixes: string[];
  description: string;
  newKeyPrefix?: string;
};

export const BASE_PRICE_CATEGORIES: PriceCategory[] = [
  {
    id: "druk-a4-a3",
    label: "Druk A4/A3 + skan",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/printer.svg",
    prefixes: ["druk-bw-", "druk-kolor-", "skan-", "druk-email", "druk-label-sticker", "druk-koszulka", "modifier-druk-"],
    description: "Ceny druku czarno-białego, kolorowego, skanowania i dopłaty za duży zadruk.",
    newKeyPrefix: "druk-bw-a4-"
  },
  {
    id: "druk-cad",
    label: "CAD wielkoformatowy",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/drafting-compass.svg",
    prefixes: ["druk-cad-", "cad-fold-", "cad-"],
    description: "Stawki CAD formatowe, za metr bieżący, składanie i usługi dodatkowe.",
    newKeyPrefix: "druk-cad-bw-fmt-"
  },
  {
    id: "laminowanie",
    label: "Introligatornia",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/book-open.svg",
    prefixes: ["laminowanie-a3-", "laminowanie-a4-", "laminowanie-a5-", "laminowanie-a6-", "laminowanie-intro-", "laminowanie-oprawa-", "laminowanie-bindowanie-"],
    description: "Laminowanie na gorąco, oprawy, bindowanie oraz usługi introligatorskie.",
    newKeyPrefix: "laminowanie-a4-"
  },
  {
    id: "solwent",
    label: "Solwent / plakaty",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/palette.svg",
    prefixes: ["solwent-", "plakaty-format-", "plakaty-blockout200g-"],
    description: "Cenniki solwentu oraz plakatów A3-A0+.",
    newKeyPrefix: "solwent-150g-"
  },
  {
    id: "plakaty-a4-a3",
    label: "Plakaty A4-A3",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/image.svg",
    prefixes: ["plakaty-maly-canon-", "plakaty-duzy-canon-"],
    description: "Cenniki plakatów A4-A3 (mały/duży Canon).",
    newKeyPrefix: "plakaty-maly-canon-"
  },
  {
    id: "vouchery",
    label: "Vouchery",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/ticket-percent.svg",
    prefixes: ["vouchery-"],
    description: "Ceny voucherów jednostronnych i dwustronnych.",
    newKeyPrefix: "vouchery-1-jed"
  },
  {
    id: "banner",
    label: "Banner",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/layout-panel-top.svg",
    prefixes: ["banner-"],
    description: "Materiały bannerowe i dopłata za oczkowanie.",
    newKeyPrefix: "banner-powlekany-"
  },
  {
    id: "rollup",
    label: "Roll-up",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/panel-top.svg",
    prefixes: ["rollup-"],
    description: "Komplety roll-up oraz wymiana wkładu.",
    newKeyPrefix: "rollup-85x200-"
  },
  {
    id: "folia",
    label: "Folia szroniona / OWV",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/layers.svg",
    prefixes: ["folia-szroniona-"],
    description: "Wydruk i oklejanie folii szronionej oraz OWV.",
    newKeyPrefix: "folia-szroniona-wydruk-"
  },
  {
    id: "wycinanie-folii",
    label: "Wycinanie z folii",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/scissors.svg",
    prefixes: ["wycinanie-folii-"],
    description: "Stawki wycinania folii kolorowej i złoto/srebro.",
    newKeyPrefix: "wycinanie-folii-kolorowa"
  },
  {
    id: "canvas",
    label: "Canvas / Płótno",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/gallery-horizontal.svg",
    prefixes: ["canvas-"],
    description: "Canvas z oprawą, bez oprawy i stawka za m².",
    newKeyPrefix: "canvas-framed-"
  },
  {
    id: "wlepki",
    label: "Wlepki / naklejki",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/sticker.svg",
    prefixes: ["wlepki-"],
    description: "Naklejki standardowe, po obrysie, PP i dopłaty dodatkowe.",
    newKeyPrefix: "wlepki-standard-folia-"
  },
  {
    id: "wizytowki",
    label: "Wizytówki",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/id-card.svg",
    prefixes: ["wizytowki-"],
    description: "Ceny wizytówek standard i z folią dla obu formatów.",
    newKeyPrefix: "wizytowki-85x55-none-"
  },
  {
    id: "zaproszenia",
    label: "ZAPROSZENIA",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/mail.svg",
    prefixes: ["zaproszenia-"],
    description: "Ceny zaproszeń (format, strony, łamanie, ilość).",
    newKeyPrefix: "zaproszenia-a6-single-normal-"
  },
  {
    id: "ulotki",
    label: "Ulotki",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/file-text.svg",
    prefixes: ["ulotki-jed-", "ulotki-dwu-"],
    description: "Ceny ulotek jednostronnych i dwustronnych dla formatów A6, A5 i DL.",
    newKeyPrefix: "ulotki-jed-a6-"
  },
  {
    id: "dyplomy",
    label: "Dyplomy",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/award.svg",
    prefixes: ["dyplomy-qty-"],
    description: "Ceny dyplomów wg progów ilościowych.",
    newKeyPrefix: "dyplomy-qty-"
  },
  {
    id: "artykuly",
    label: "Artykuły biurowe",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/package.svg",
    prefixes: [
      "artykuly-teczka-",
      "artykuly-skoroszyt-",
      "artykuly-segregator-",
      "artykuly-koszulka-",
      "artykuly-papier-",
      "artykuly-dugopis",
      "artykuly-olowek",
      "artykuly-pendrive-",
      "artykuly-pudelko-",
      "artykuly-plyty-"
    ],
    description: "Ceny materiałów biurowych i akcesoriów.",
    newKeyPrefix: "artykuly-"
  },
  {
    id: "uslugi",
    label: "Usługi",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/handshake.svg",
    prefixes: ["uslugi-"],
    description: "Stawki usług dodatkowych, projektowych i archiwizacji.",
    newKeyPrefix: "uslugi-"
  },
  {
    id: "koperty",
    label: "Koperty",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/mail.svg",
    prefixes: ["koperty-", "artykuly-koperta-"],
    description: "Ceny kopert (A–G oraz pozycje kopert z artykułów biurowych).",
    newKeyPrefix: "artykuly-koperta-"
  },
  {
    id: "pojedyncze-naklady",
    label: "Pojedyncze nakłady",
    icon: "🧾",
    prefixes: ["laminowanie-special-"],
    description: "Ceny usług dla pojedynczych nakładów i wydruki specjalne.",
    newKeyPrefix: "laminowanie-special-"
  },
  {
    id: "broszury-katalogi",
    label: "Broszury i katalogi",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/book-text.svg",
    prefixes: ["broszury-katalogi-"],
    description: "Ceny broszur i katalogów wg formatu i nakładu.",
    newKeyPrefix: "broszury-katalogi-a4-"
  },
  {
    id: "modifiers",
    label: "Dopłaty globalne",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/settings.svg",
    prefixes: ["modifier-express", "modifier-satyna", "modifier-modigliani"],
    description: "Dopłaty procentowe współdzielone przez wiele kalkulatorów.",
    newKeyPrefix: "modifier-"
  }
];

/**
 * Finds a category by ID in the given list.
 * Returns `fallback` if provided, otherwise synthesizes a minimal category from the ID.
 * Never returns undefined — safe to use without null-checks.
 */
export function findOrCreateCategory(
  categories: PriceCategory[],
  id: string,
  fallback?: PriceCategory
): PriceCategory {
  return (
    categories.find((c) => c.id === id) ??
    fallback ??
    { id, label: id, icon: "🧩", prefixes: [`${id}-`], description: "" }
  );
}
