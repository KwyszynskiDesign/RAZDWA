import { View, ViewContext } from "../types";
import { getPrice, setPrice, resetPrices, PRICES_STORAGE_KEY } from "../../services/priceService";

const STORAGE_KEY = PRICES_STORAGE_KEY;

type PriceCategory = {
  id: string;
  label: string;
  icon: string;
  prefixes: string[];
  description: string;
  newKeyPrefix?: string;
};

let _cleanup: (() => void) | null = null;

function loadPrices(): Record<string, number> {
  const base = { ...(getPrice("defaultPrices") as Record<string, number>) };
  const zaproszenia = getPrice("zaproszeniaKreda") as any;
  const formats = zaproszenia?.formats as Record<string, any> | undefined;

  if (formats) {
    Object.entries(formats).forEach(([formatKey, formatData]) => {
      ["single", "double"].forEach((sidesKey) => {
        ["normal", "folded"].forEach((foldKey) => {
          const tiers = formatData?.[sidesKey]?.[foldKey] as Record<string, number> | undefined;
          if (!tiers) return;
          Object.entries(tiers).forEach(([qty, price]) => {
            const key = `zaproszenia-${formatKey.toLowerCase()}-${sidesKey}-${foldKey}-${qty}`;
            if (!(key in base)) {
              base[key] = Number(price);
            }
          });
        });
      });
    });
  }

  return base;
}

/** Czytelne opisy polskie dla każdego klucza cennika */
const PRICE_LABELS: Record<string, string> = {
  // Druk A4/A3 czarno-biały
  "druk-bw-a4-1-5": "Druk czarno-biały A4 – 1–5 szt.",
  "druk-bw-a4-6-20": "Druk czarno-biały A4 – 6–20 szt.",
  "druk-bw-a4-21-100": "Druk czarno-biały A4 – 21–100 szt.",
  "druk-bw-a4-101-500": "Druk czarno-biały A4 – 101–500 szt.",
  "druk-bw-a4-501-999": "Druk czarno-biały A4 – 501–999 szt.",
  "druk-bw-a4-1000-4999": "Druk czarno-biały A4 – 1 000–4 999 szt.",
  "druk-bw-a4-5000+": "Druk czarno-biały A4 – 5 000+ szt.",
  "druk-bw-a3-1-5": "Druk czarno-biały A3 – 1–5 szt.",
  "druk-bw-a3-6-20": "Druk czarno-biały A3 – 6–20 szt.",
  "druk-bw-a3-21-100": "Druk czarno-biały A3 – 21–100 szt.",
  "druk-bw-a3-101-500": "Druk czarno-biały A3 – 101–500 szt.",
  "druk-bw-a3-501-999": "Druk czarno-biały A3 – 501–999 szt.",
  "druk-bw-a3-1000-4999": "Druk czarno-biały A3 – 1 000–4 999 szt.",
  "druk-bw-a3-5000+": "Druk czarno-biały A3 – 5 000+ szt.",
  // Druk A4/A3 kolor
  "druk-kolor-a4-1-10": "Druk kolor A4 – 1–10 szt.",
  "druk-kolor-a4-11-40": "Druk kolor A4 – 11–40 szt.",
  "druk-kolor-a4-41-100": "Druk kolor A4 – 41–100 szt.",
  "druk-kolor-a4-101-250": "Druk kolor A4 – 101–250 szt.",
  "druk-kolor-a4-251-500": "Druk kolor A4 – 251–500 szt.",
  "druk-kolor-a4-501-999": "Druk kolor A4 – 501–999 szt.",
  "druk-kolor-a4-1000+": "Druk kolor A4 – 1 000+ szt.",
  "druk-kolor-a3-1-10": "Druk kolor A3 – 1–10 szt.",
  "druk-kolor-a3-11-40": "Druk kolor A3 – 11–40 szt.",
  "druk-kolor-a3-41-100": "Druk kolor A3 – 41–100 szt.",
  "druk-kolor-a3-101-250": "Druk kolor A3 – 101–250 szt.",
  "druk-kolor-a3-251-500": "Druk kolor A3 – 251–500 szt.",
  "druk-kolor-a3-501-999": "Druk kolor A3 – 501–999 szt.",
  "druk-kolor-a3-1000+": "Druk kolor A3 – 1 000+ szt.",
  // Skanowanie
  "skan-auto-1-9": "Skanowanie automatyczne – 1–9 stron",
  "skan-auto-10-49": "Skanowanie automatyczne – 10–49 stron",
  "skan-auto-50-99": "Skanowanie automatyczne – 50–99 stron",
  "skan-auto-100+": "Skanowanie automatyczne – 100+ stron",
  "skan-reczne-1-4": "Skanowanie ręczne – 1–4 strony",
  "skan-reczne-5+": "Skanowanie ręczne – 5+ stron",
  "druk-email": "Dopłata za wysłanie pliku e-mailem",
  "modifier-druk-zadruk25": "Dopłata za duże plamy koloru (zadruk >25%)",
  // CAD wielkoformatowy kolor
  "druk-cad-kolor-fmt-a3": "CAD kolor formatowy – A3",
  "druk-cad-kolor-fmt-a2": "CAD kolor formatowy – A2",
  "druk-cad-kolor-fmt-a1": "CAD kolor formatowy – A1",
  "druk-cad-kolor-fmt-a0": "CAD kolor formatowy – A0",
  "druk-cad-kolor-fmt-a0plus": "CAD kolor formatowy – A0+",
  "druk-cad-kolor-mb-a3": "CAD kolor metr bieżący – A3",
  "druk-cad-kolor-mb-a2": "CAD kolor metr bieżący – A2",
  "druk-cad-kolor-mb-a1": "CAD kolor metr bieżący – A1",
  "druk-cad-kolor-mb-a0": "CAD kolor metr bieżący – A0",
  "druk-cad-kolor-mb-a0plus": "CAD kolor metr bieżący – A0+",
  "druk-cad-kolor-mb-mb1067": "CAD kolor metr bieżący – rolka 1067 mm",
  // CAD wielkoformatowy czarno-biały
  "druk-cad-bw-fmt-a3": "CAD czarno-biały formatowy – A3",
  "druk-cad-bw-fmt-a2": "CAD czarno-biały formatowy – A2",
  "druk-cad-bw-fmt-a1": "CAD czarno-biały formatowy – A1",
  "druk-cad-bw-fmt-a0": "CAD czarno-biały formatowy – A0",
  "druk-cad-bw-fmt-a0plus": "CAD czarno-biały formatowy – A0+",
  "druk-cad-bw-mb-a3": "CAD czarno-biały metr bieżący – A3",
  "druk-cad-bw-mb-a2": "CAD czarno-biały metr bieżący – A2",
  "druk-cad-bw-mb-a1": "CAD czarno-biały metr bieżący – A1",
  "druk-cad-bw-mb-a0": "CAD czarno-biały metr bieżący – A0",
  "druk-cad-bw-mb-a0plus": "CAD czarno-biały metr bieżący – A0+",
  "druk-cad-bw-mb-mb1067": "CAD czarno-biały metr bieżący – rolka 1067 mm",
  // Laminowanie
  "laminowanie-a3-1-50": "Laminowanie A3 – 1–50 szt.",
  "laminowanie-a3-51-100": "Laminowanie A3 – 51–100 szt.",
  "laminowanie-a3-101-200": "Laminowanie A3 – 101–200 szt.",
  "laminowanie-a4-1-50": "Laminowanie A4 – 1–50 szt.",
  "laminowanie-a4-51-100": "Laminowanie A4 – 51–100 szt.",
  "laminowanie-a4-101-200": "Laminowanie A4 – 101–200 szt.",
  "laminowanie-a5-1-50": "Laminowanie A5 – 1–50 szt.",
  "laminowanie-a5-51-100": "Laminowanie A5 – 51–100 szt.",
  "laminowanie-a5-101-200": "Laminowanie A5 – 101–200 szt.",
  "laminowanie-a6-1-50": "Laminowanie A6 – 1–50 szt.",
  "laminowanie-a6-51-100": "Laminowanie A6 – 51–100 szt.",
  "laminowanie-a6-101-200": "Laminowanie A6 – 101–200 szt.",
  "laminowanie-intro-gilotyna": "Introligatornia – cięcie na gilotynie (za cięcie)",
  "laminowanie-intro-trymer": "Introligatornia – cięcie ręczne trymerem (za cięcie)",
  "laminowanie-intro-druk-powyzej-20": "Introligatornia – drukowanie powyżej 20 kartek (za kartkę)",
  "laminowanie-intro-zszywanie": "Introligatornia – zszywanie kartek (za zszywkę)",
  "laminowanie-intro-broszurowanie": "Introligatornia – broszurowanie/docnianie (za cięcie)",
  "laminowanie-intro-bigowanie": "Introligatornia – bigowanie (za big)",
  "laminowanie-special-modigliani-a4": "Wydruki specjalne / dodruki – Modigliani 260g A4",
  "laminowanie-special-modigliani-a3": "Wydruki specjalne / dodruki – Modigliani 260g A3",
  "laminowanie-special-double-sided-factor": "Wydruki specjalne / dodruki – dopłata za dwustronność",
  // Solwent / plakaty
  "solwent-150g-1-3": "Solwent 150g półmat – 1–3 m²",
  "solwent-150g-4-9": "Solwent 150g półmat – 4–9 m²",
  "solwent-150g-10-20": "Solwent 150g półmat – 10–20 m²",
  "solwent-150g-21-40": "Solwent 150g półmat – 21–40 m²",
  "solwent-150g-41+": "Solwent 150g półmat – 41+ m²",
  "solwent-200g-1-3": "Solwent 200g połysk – 1–3 m²",
  "solwent-200g-4-9": "Solwent 200g połysk – 4–9 m²",
  "solwent-200g-10-20": "Solwent 200g połysk – 10–20 m²",
  "solwent-200g-21-40": "Solwent 200g połysk – 21–40 m²",
  "solwent-200g-41+": "Solwent 200g połysk – 41+ m²",
  "solwent-115g-1-3": "Solwent 115g matowy – 1–3 m²",
  "solwent-115g-4-19": "Solwent 115g matowy – 4–19 m²",
  "solwent-115g-20+": "Solwent 115g matowy – 20+ m²",
  "plakaty-maly-canon-margin-170-1-3": "Plakaty mały Canon z marginesem 170g – 1–3 szt.",
  "plakaty-maly-canon-margin-170-4-9": "Plakaty mały Canon z marginesem 170g – 4–9 szt.",
  "plakaty-maly-canon-margin-200-1-3": "Plakaty mały Canon z marginesem 200g – 1–3 szt.",
  "plakaty-maly-canon-margin-200-4-9": "Plakaty mały Canon z marginesem 200g – 4–9 szt.",
  "plakaty-maly-canon-no-margin-170-1-3": "Plakaty mały Canon bez marginesu 170g – 1–3 szt.",
  "plakaty-maly-canon-no-margin-170-4-9": "Plakaty mały Canon bez marginesu 170g – 4–9 szt.",
  "plakaty-maly-canon-no-margin-200-1-3": "Plakaty mały Canon bez marginesu 200g – 1–3 szt.",
  "plakaty-maly-canon-no-margin-200-4-9": "Plakaty mały Canon bez marginesu 200g – 4–9 szt.",
  // Vouchery jednostronne
  "vouchery-1-jed": "Voucher jednostronny – 1 szt.",
  "vouchery-2-jed": "Voucher jednostronny – 2 szt.",
  "vouchery-3-jed": "Voucher jednostronny – 3 szt.",
  "vouchery-4-jed": "Voucher jednostronny – 4 szt.",
  "vouchery-5-jed": "Voucher jednostronny – 5 szt.",
  "vouchery-6-jed": "Voucher jednostronny – 6 szt.",
  "vouchery-7-jed": "Voucher jednostronny – 7 szt.",
  "vouchery-8-jed": "Voucher jednostronny – 8 szt.",
  "vouchery-9-jed": "Voucher jednostronny – 9 szt.",
  "vouchery-10-jed": "Voucher jednostronny – 10 szt.",
  "vouchery-15-jed": "Voucher jednostronny – 15 szt.",
  "vouchery-20-jed": "Voucher jednostronny – 20 szt.",
  "vouchery-25-jed": "Voucher jednostronny – 25 szt.",
  "vouchery-30-jed": "Voucher jednostronny – 30 szt.",
  // Vouchery dwustronne
  "vouchery-1-dwu": "Voucher dwustronny – 1 szt.",
  "vouchery-2-dwu": "Voucher dwustronny – 2 szt.",
  "vouchery-3-dwu": "Voucher dwustronny – 3 szt.",
  "vouchery-4-dwu": "Voucher dwustronny – 4 szt.",
  "vouchery-5-dwu": "Voucher dwustronny – 5 szt.",
  "vouchery-6-dwu": "Voucher dwustronny – 6 szt.",
  "vouchery-7-dwu": "Voucher dwustronny – 7 szt.",
  "vouchery-8-dwu": "Voucher dwustronny – 8 szt.",
  "vouchery-9-dwu": "Voucher dwustronny – 9 szt.",
  "vouchery-10-dwu": "Voucher dwustronny – 10 szt.",
  "vouchery-15-dwu": "Voucher dwustronny – 15 szt.",
  "vouchery-20-dwu": "Voucher dwustronny – 20 szt.",
  "vouchery-25-dwu": "Voucher dwustronny – 25 szt.",
  "vouchery-30-dwu": "Voucher dwustronny – 30 szt.",
  // Banner
  "banner-powlekany-1-25": "Banner powlekany (standardowy) – 1–25 m²",
  "banner-powlekany-26-50": "Banner powlekany (standardowy) – 26–50 m²",
  "banner-powlekany-51+": "Banner powlekany (standardowy) – 51+ m²",
  "banner-blockout-1-25": "Banner blockout (nieprzeźroczysty) – 1–25 m²",
  "banner-blockout-26-50": "Banner blockout (nieprzeźroczysty) – 26–50 m²",
  "banner-blockout-51+": "Banner blockout (nieprzeźroczysty) – 51+ m²",
  "banner-oczkowanie": "Dopłata za oczkowanie (cena za oczko)",
  // Roll-up
  "rollup-85x200-1-5": "Roll-up 85×200 cm – 1–5 szt.",
  "rollup-85x200-6-10": "Roll-up 85×200 cm – 6–10 szt.",
  "rollup-100x200-1-5": "Roll-up 100×200 cm – 1–5 szt.",
  "rollup-100x200-6-10": "Roll-up 100×200 cm – 6–10 szt.",
  "rollup-120x200-1-5": "Roll-up 120×200 cm – 1–5 szt.",
  "rollup-120x200-6-10": "Roll-up 120×200 cm – 6–10 szt.",
  "rollup-150x200-1-5": "Roll-up 150×200 cm – 1–5 szt.",
  "rollup-150x200-6-10": "Roll-up 150×200 cm – 6–10 szt.",
  "rollup-wymiana-labor": "Wymiana wkładu roll-up – robocizna",
  "rollup-wymiana-m2": "Wymiana wkładu roll-up – druk za m²",
  // Folia szroniona
  "folia-szroniona-wydruk-1-5": "Folia szroniona wydruk – 1–5 m²",
  "folia-szroniona-wydruk-6-25": "Folia szroniona wydruk – 6–25 m²",
  "folia-szroniona-wydruk-26-50": "Folia szroniona wydruk – 26–50 m²",
  "folia-szroniona-wydruk-51+": "Folia szroniona wydruk – 51+ m²",
  "folia-szroniona-oklejanie-1-5": "Folia szroniona oklejanie – 1–5 m²",
  "folia-szroniona-oklejanie-6-10": "Folia szroniona oklejanie – 6–10 m²",
  "folia-szroniona-oklejanie-11-20": "Folia szroniona oklejanie – 11–20 m²",
  "folia-szroniona-owv-wydruk-1-3": "Folia OWV wydruk – 1–3 m²",
  "folia-szroniona-owv-wydruk-4-9": "Folia OWV wydruk – 4–9 m²",
  "folia-szroniona-owv-wydruk-10-20": "Folia OWV wydruk – 10–20 m²",
  "folia-szroniona-owv-wydruk-21-40": "Folia OWV wydruk – 21–40 m²",
  "folia-szroniona-owv-wydruk-41+": "Folia OWV wydruk – 41+ m²",
  "folia-szroniona-owv-oklejanie-1-5": "Folia OWV oklejanie – 1–5 m²",
  "folia-szroniona-owv-oklejanie-6-10": "Folia OWV oklejanie – 6–10 m²",
  "folia-szroniona-owv-oklejanie-11-20": "Folia OWV oklejanie – 11–20 m²",
  // Wycinanie z folii
  "wycinanie-folii-kolorowa-ponizej-1m2": "Wycinanie folii kolorowej – poniżej 1 m²",
  "wycinanie-folii-kolorowa-powyzej-1m2": "Wycinanie folii kolorowej – powyżej 1 m²",
  "wycinanie-folii-zloto-srebro-ponizej-1m2": "Wycinanie folii złoto/srebro – poniżej 1 m²",
  "wycinanie-folii-zloto-srebro-powyzej-1m2": "Wycinanie folii złoto/srebro – powyżej 1 m²",
  // Canvas
  "canvas-framed-50x40-a": "Canvas z oprawą – 50×40 (wariant 1)",
  "canvas-framed-50x40-b": "Canvas z oprawą – 50×40 (wariant 2)",
  "canvas-framed-70x50": "Canvas z oprawą – 70×50",
  "canvas-framed-100x70": "Canvas z oprawą – 100×70",
  "canvas-framed-120x80": "Canvas z oprawą – 120×80",
  "canvas-unframed-50x40-a": "Canvas bez oprawy – 50×40 (wariant 1)",
  "canvas-unframed-50x40-b": "Canvas bez oprawy – 50×40 (wariant 2)",
  "canvas-unframed-70x50": "Canvas bez oprawy – 70×50",
  "canvas-unframed-100x70": "Canvas bez oprawy – 100×70",
  "canvas-unframed-120x80": "Canvas bez oprawy – 120×80",
  "canvas-m2-unframed": "Canvas bez oprawy – cena za m²",
  // Wlepki / naklejki
  "wlepki-obrys-folia-1-5": "Naklejki wycinane po obrysie – 1–5 m²",
  "wlepki-obrys-folia-6-25": "Naklejki wycinane po obrysie – 6–25 m²",
  "wlepki-obrys-folia-26-50": "Naklejki wycinane po obrysie – 26–50 m²",
  "wlepki-obrys-folia-51+": "Naklejki wycinane po obrysie – 51+ m²",
  "wlepki-polipropylen-1-10": "Naklejki polipropylenowe – 1–10 m²",
  "wlepki-polipropylen-11+": "Naklejki polipropylenowe – 11+ m²",
  "wlepki-standard-folia-1-5": "Naklejki standardowe folia – 1–5 m²",
  "wlepki-standard-folia-6-25": "Naklejki standardowe folia – 6–25 m²",
  "wlepki-standard-folia-26-50": "Naklejki standardowe folia – 26–50 m²",
  "wlepki-standard-folia-51+": "Naklejki standardowe folia – 51+ m²",
  "wlepki-szt-papier-sra3-1": "Naklejki papier SRA3 – 1 szt.",
  "wlepki-szt-papier-sra3-2": "Naklejki papier SRA3 – 2 szt.",
  "wlepki-szt-papier-sra3-3": "Naklejki papier SRA3 – 3 szt.",
  "wlepki-szt-papier-sra3-4": "Naklejki papier SRA3 – 4 szt.",
  "wlepki-szt-papier-sra3-5": "Naklejki papier SRA3 – 5 szt.",
  "wlepki-szt-papier-sra3-6": "Naklejki papier SRA3 – 6 szt.",
  "wlepki-szt-papier-sra3-7": "Naklejki papier SRA3 – 7 szt.",
  "wlepki-szt-papier-sra3-8": "Naklejki papier SRA3 – 8 szt.",
  "wlepki-szt-papier-sra3-9": "Naklejki papier SRA3 – 9 szt.",
  "wlepki-szt-papier-sra3-10": "Naklejki papier SRA3 – 10 szt.",
  "wlepki-szt-papier-sra3-15": "Naklejki papier SRA3 – 15 szt.",
  "wlepki-szt-papier-sra3-20": "Naklejki papier SRA3 – 20 szt.",
  "wlepki-szt-papier-sra3-25": "Naklejki papier SRA3 – 25 szt.",
  "wlepki-szt-papier-sra3-30": "Naklejki papier SRA3 – 30 szt.",
  "wlepki-szt-folia-sra3-1": "Naklejki folia SRA3 – 1 szt.",
  "wlepki-szt-folia-sra3-2": "Naklejki folia SRA3 – 2 szt.",
  "wlepki-szt-folia-sra3-3": "Naklejki folia SRA3 – 3 szt.",
  "wlepki-szt-folia-sra3-4": "Naklejki folia SRA3 – 4 szt.",
  "wlepki-szt-folia-sra3-5": "Naklejki folia SRA3 – 5 szt.",
  "wlepki-szt-folia-sra3-6": "Naklejki folia SRA3 – 6 szt.",
  "wlepki-szt-folia-sra3-7": "Naklejki folia SRA3 – 7 szt.",
  "wlepki-szt-folia-sra3-8": "Naklejki folia SRA3 – 8 szt.",
  "wlepki-szt-folia-sra3-9": "Naklejki folia SRA3 – 9 szt.",
  "wlepki-szt-folia-sra3-10": "Naklejki folia SRA3 – 10 szt.",
  "wlepki-szt-folia-sra3-15": "Naklejki folia SRA3 – 15 szt.",
  "wlepki-szt-folia-sra3-20": "Naklejki folia SRA3 – 20 szt.",
  "wlepki-szt-folia-sra3-25": "Naklejki folia SRA3 – 25 szt.",
  "wlepki-szt-folia-sra3-30": "Naklejki folia SRA3 – 30 szt.",
  "wlepki-szt-plotowane-papier-1": "Naklejki plotowane papier – 1 szt.",
  "wlepki-szt-plotowane-papier-2": "Naklejki plotowane papier – 2 szt.",
  "wlepki-szt-plotowane-papier-3": "Naklejki plotowane papier – 3 szt.",
  "wlepki-szt-plotowane-papier-4": "Naklejki plotowane papier – 4 szt.",
  "wlepki-szt-plotowane-papier-5": "Naklejki plotowane papier – 5 szt.",
  "wlepki-szt-plotowane-papier-6": "Naklejki plotowane papier – 6 szt.",
  "wlepki-szt-plotowane-papier-7": "Naklejki plotowane papier – 7 szt.",
  "wlepki-szt-plotowane-papier-8": "Naklejki plotowane papier – 8 szt.",
  "wlepki-szt-plotowane-papier-9": "Naklejki plotowane papier – 9 szt.",
  "wlepki-szt-plotowane-papier-10": "Naklejki plotowane papier – 10 szt.",
  "wlepki-szt-plotowane-papier-15": "Naklejki plotowane papier – 15 szt.",
  "wlepki-szt-plotowane-papier-20": "Naklejki plotowane papier – 20 szt.",
  "wlepki-szt-plotowane-papier-25": "Naklejki plotowane papier – 25 szt.",
  "wlepki-szt-plotowane-papier-30": "Naklejki plotowane papier – 30 szt.",
  "wlepki-szt-plotowane-folia-1": "Naklejki plotowane folia – 1 szt.",
  "wlepki-szt-plotowane-folia-2": "Naklejki plotowane folia – 2 szt.",
  "wlepki-szt-plotowane-folia-3": "Naklejki plotowane folia – 3 szt.",
  "wlepki-szt-plotowane-folia-4": "Naklejki plotowane folia – 4 szt.",
  "wlepki-szt-plotowane-folia-5": "Naklejki plotowane folia – 5 szt.",
  "wlepki-szt-plotowane-folia-6": "Naklejki plotowane folia – 6 szt.",
  "wlepki-szt-plotowane-folia-7": "Naklejki plotowane folia – 7 szt.",
  "wlepki-szt-plotowane-folia-8": "Naklejki plotowane folia – 8 szt.",
  "wlepki-szt-plotowane-folia-9": "Naklejki plotowane folia – 9 szt.",
  "wlepki-szt-plotowane-folia-10": "Naklejki plotowane folia – 10 szt.",
  "wlepki-szt-plotowane-folia-15": "Naklejki plotowane folia – 15 szt.",
  "wlepki-szt-plotowane-folia-20": "Naklejki plotowane folia – 20 szt.",
  "wlepki-szt-plotowane-folia-25": "Naklejki plotowane folia – 25 szt.",
  "wlepki-szt-plotowane-folia-30": "Naklejki plotowane folia – 30 szt.",
  "wlepki-modifier-arkusze": "Naklejki – cena za arkusz (m²)",
  "wlepki-modifier-pojedyncze": "Dopłata za krojenie na pojedyncze",
  "wlepki-modifier-mocny-klej": "Dopłata za mocny klej (za m²)",
  // Wizytówki 85×55
  "wizytowki-85x55-none-50szt": "Wizytówki 85×55 mm bez laminatu – 50 szt.",
  "wizytowki-85x55-none-100szt": "Wizytówki 85×55 mm bez laminatu – 100 szt.",
  "wizytowki-85x55-none-250szt": "Wizytówki 85×55 mm bez laminatu – 250 szt.",
  "wizytowki-85x55-none-500szt": "Wizytówki 85×55 mm bez laminatu – 500 szt.",
  "wizytowki-85x55-none-1000szt": "Wizytówki 85×55 mm bez laminatu – 1 000 szt.",
  "wizytowki-85x55-matt_gloss-50szt": "Wizytówki 85×55 mm z laminatem mat/błysk – 50 szt.",
  "wizytowki-85x55-matt_gloss-100szt": "Wizytówki 85×55 mm z laminatem mat/błysk – 100 szt.",
  "wizytowki-85x55-matt_gloss-250szt": "Wizytówki 85×55 mm z laminatem mat/błysk – 250 szt.",
  "wizytowki-85x55-matt_gloss-500szt": "Wizytówki 85×55 mm z laminatem mat/błysk – 500 szt.",
  "wizytowki-85x55-matt_gloss-1000szt": "Wizytówki 85×55 mm z laminatem mat/błysk – 1 000 szt.",
  // Wizytówki 90×50
  "wizytowki-90x50-none-50szt": "Wizytówki 90×50 mm bez laminatu – 50 szt.",
  "wizytowki-90x50-none-100szt": "Wizytówki 90×50 mm bez laminatu – 100 szt.",
  "wizytowki-90x50-none-250szt": "Wizytówki 90×50 mm bez laminatu – 250 szt.",
  "wizytowki-90x50-none-500szt": "Wizytówki 90×50 mm bez laminatu – 500 szt.",
  "wizytowki-90x50-none-1000szt": "Wizytówki 90×50 mm bez laminatu – 1 000 szt.",
  "wizytowki-90x50-matt_gloss-50szt": "Wizytówki 90×50 mm z laminatem mat/błysk – 50 szt.",
  "wizytowki-90x50-matt_gloss-100szt": "Wizytówki 90×50 mm z laminatem mat/błysk – 100 szt.",
  "wizytowki-90x50-matt_gloss-250szt": "Wizytówki 90×50 mm z laminatem mat/błysk – 250 szt.",
  "wizytowki-90x50-matt_gloss-500szt": "Wizytówki 90×50 mm z laminatem mat/błysk – 500 szt.",
  "wizytowki-90x50-matt_gloss-1000szt": "Wizytówki 90×50 mm z laminatem mat/błysk – 1 000 szt.",
  // Dopłaty globalne
  "modifier-satyna": "Dopłata papier satynowy (mnożnik, 0.12 = +12%)",
  "modifier-express": "Dopłata tryb express (mnożnik, 0.20 = +20%)",
  "modifier-modigliani": "Dopłata papier Modigliani (mnożnik, 0.20 = +20%)",
};

function humanizeSegment(value: string): string {
  return value
    .replace(/\+/g, " plus")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPriceLabel(key: string): string {
  if (PRICE_LABELS[key]) return PRICE_LABELS[key];

  const dyplomyMatch = key.match(/^dyplomy-qty-(\d+)$/);
  if (dyplomyMatch) {
    return `Dyplomy – ${dyplomyMatch[1]} szt.`;
  }

  const ulotkiJedMatch = key.match(/^ulotki-jed-(a6|a5|dl)-(\d+)$/);
  if (ulotkiJedMatch) {
    return `Ulotki jednostronne ${ulotkiJedMatch[1].toUpperCase()} – ${ulotkiJedMatch[2]} szt.`;
  }

  const ulotkiDwuMatch = key.match(/^ulotki-dwu-(a6|a5|dl)-(\d+)$/);
  if (ulotkiDwuMatch) {
    return `Ulotki dwustronne ${ulotkiDwuMatch[1].toUpperCase()} – ${ulotkiDwuMatch[2]} szt.`;
  }

  const zaproszeniaMatch = key.match(/^zaproszenia-(a6|a5|dl)-(single|double)-(normal|folded)-(\d+)$/);
  if (zaproszeniaMatch) {
    const sidesLabel = zaproszeniaMatch[2] === "single" ? "jednostronne" : "dwustronne";
    const foldLabel = zaproszeniaMatch[3] === "folded" ? "łamane" : "bez łamania";
    return `Zaproszenia KREDA ${zaproszeniaMatch[1].toUpperCase()} ${sidesLabel}, ${foldLabel} – ${zaproszeniaMatch[4]} szt.`;
  }

  if (key.startsWith("artykuly-")) {
    return `Artykuły biurowe – ${humanizeSegment(key.replace("artykuly-", ""))}`;
  }

  if (key.startsWith("uslugi-")) {
    return `Usługi – ${humanizeSegment(key.replace("uslugi-", ""))}`;
  }

  return key.replace(/-/g, " ");
}

const BASE_PRICE_CATEGORIES: PriceCategory[] = [
  {
    id: "druk-a4-a3",
    label: "Druk A4/A3 + skan",
    icon: "🖨️",
    prefixes: ["druk-bw-", "druk-kolor-", "skan-", "druk-email", "modifier-druk-"],
    description: "Ceny druku czarno-białego, kolorowego, skanowania i dopłaty za duży zadruk.",
    newKeyPrefix: "druk-bw-a4-"
  },
  {
    id: "druk-cad",
    label: "CAD wielkoformatowy",
    icon: "📐",
    prefixes: ["druk-cad-"],
    description: "Stawki CAD formatowe i za metr bieżący.",
    newKeyPrefix: "druk-cad-bw-fmt-"
  },
  {
    id: "laminowanie",
    label: "Laminowanie",
    icon: "✨",
    prefixes: ["laminowanie-"],
    description: "Progi cenowe laminowania oraz stawki introligatorskie.",
    newKeyPrefix: "laminowanie-a4-"
  },
  {
    id: "solwent",
    label: "Solwent / plakaty",
    icon: "🎨",
    prefixes: ["solwent-", "plakaty-maly-canon-"],
    description: "Cenniki solwentu oraz plakaty do 9 szt. (mały Canon).",
    newKeyPrefix: "solwent-150g-"
  },
  {
    id: "vouchery",
    label: "Vouchery",
    icon: "🎫",
    prefixes: ["vouchery-"],
    description: "Ceny voucherów jednostronnych i dwustronnych.",
    newKeyPrefix: "vouchery-1-jed"
  },
  {
    id: "banner",
    label: "Banner",
    icon: "🏁",
    prefixes: ["banner-"],
    description: "Materiały bannerowe i dopłata za oczkowanie.",
    newKeyPrefix: "banner-powlekany-"
  },
  {
    id: "rollup",
    label: "Roll-up",
    icon: "↕️",
    prefixes: ["rollup-"],
    description: "Komplety roll-up oraz wymiana wkładu.",
    newKeyPrefix: "rollup-85x200-"
  },
  {
    id: "folia",
    label: "Folia szroniona / OWV",
    icon: "❄️",
    prefixes: ["folia-szroniona-"],
    description: "Wydruk i oklejanie folii szronionej oraz OWV.",
    newKeyPrefix: "folia-szroniona-wydruk-"
  },
  {
    id: "wycinanie-folii",
    label: "Wycinanie z folii",
    icon: "✂️",
    prefixes: ["wycinanie-folii-"],
    description: "Stawki wycinania folii kolorowej i złoto/srebro.",
    newKeyPrefix: "wycinanie-folii-kolorowa-"
  },
  {
    id: "canvas",
    label: "Canvas / Płótno",
    icon: "🖼️",
    prefixes: ["canvas-"],
    description: "Canvas z oprawą, bez oprawy i stawka za m².",
    newKeyPrefix: "canvas-framed-"
  },
  {
    id: "wlepki",
    label: "Wlepki / naklejki",
    icon: "🏷️",
    prefixes: ["wlepki-"],
    description: "Naklejki standardowe, po obrysie, PP i dopłaty dodatkowe.",
    newKeyPrefix: "wlepki-standard-folia-"
  },
  {
    id: "wizytowki",
    label: "Wizytówki",
    icon: "📇",
    prefixes: ["wizytowki-"],
    description: "Ceny wizytówek standard i z folią dla obu formatów.",
    newKeyPrefix: "wizytowki-85x55-none-"
  },
  {
    id: "zaproszenia",
    label: "Zaproszenia KREDA",
    icon: "💌",
    prefixes: ["zaproszenia-"],
    description: "Ceny zaproszeń KREDA (format, strony, łamanie, ilość).",
    newKeyPrefix: "zaproszenia-a6-single-normal-"
  },
  {
    id: "ulotki",
    label: "Ulotki cyfrowe",
    icon: "📄",
    prefixes: ["ulotki-jed-", "ulotki-dwu-"],
    description: "Ceny ulotek jednostronnych i dwustronnych dla formatów A6, A5 i DL.",
    newKeyPrefix: "ulotki-jed-a6-"
  },
  {
    id: "dyplomy",
    label: "Dyplomy",
    icon: "🎓",
    prefixes: ["dyplomy-qty-"],
    description: "Ceny dyplomów wg progów ilościowych.",
    newKeyPrefix: "dyplomy-qty-"
  },
  {
    id: "artykuly",
    label: "Artykuły biurowe",
    icon: "📎",
    prefixes: ["artykuly-"],
    description: "Ceny materiałów biurowych i akcesoriów.",
    newKeyPrefix: "artykuly-"
  },
  {
    id: "uslugi",
    label: "Usługi",
    icon: "🛠️",
    prefixes: ["uslugi-"],
    description: "Stawki usług dodatkowych, projektowych i archiwizacji.",
    newKeyPrefix: "uslugi-"
  },
  {
    id: "modifiers",
    label: "Dopłaty globalne",
    icon: "⚙️",
    prefixes: ["modifier-express", "modifier-satyna", "modifier-modigliani"],
    description: "Dopłaty procentowe współdzielone przez wiele kalkulatorów.",
    newKeyPrefix: "modifier-"
  }
];

function keyMatchesCategory(key: string, category: PriceCategory): boolean {
  return category.prefixes.some((prefix) => key.startsWith(prefix));
}

function getRenderedCategories(prices: Record<string, number>): PriceCategory[] {
  const categories = [...BASE_PRICE_CATEGORIES];
  const matchedKeys = new Set<string>();

  categories.forEach((category) => {
    Object.keys(prices).forEach((key) => {
      if (keyMatchesCategory(key, category)) {
        matchedKeys.add(key);
      }
    });
  });

  const unmatchedKeys = Object.keys(prices).filter((key) => !matchedKeys.has(key));
  if (unmatchedKeys.length > 0) {
    categories.push({
      id: "inne",
      label: "Pozostałe",
      icon: "🧩",
      prefixes: unmatchedKeys,
      description: "Klucze, które nie pasują do żadnej z głównych kategorii.",
      newKeyPrefix: "inne-"
    });
  }

  return categories;
}

function getCategoryKeys(prices: Record<string, number>, category: PriceCategory): string[] {
  if (category.id === "inne") {
    return Object.keys(prices).filter((key) => category.prefixes.includes(key)).sort();
  }
  return Object.keys(prices).filter((key) => keyMatchesCategory(key, category)).sort();
}

export const UstawieniaView: View = {
  id: "ustawienia",
  name: "Ustawienia cen",

  mount(container: HTMLElement, _ctx: ViewContext) {
    if (_cleanup) {
      _cleanup();
      _cleanup = null;
    }

    let prices = loadPrices();
    let renderedCategories = getRenderedCategories(prices);
    let activeCategory = renderedCategories[0]?.id ?? "druk-a4-a3";

    function getActiveCategory(): PriceCategory {
      return renderedCategories.find((category) => category.id === activeCategory) ?? renderedCategories[0];
    }

    function showStatus(message: string, tone: "success" | "error" = "success") {
      const msg = container.querySelector<HTMLElement>("#save-msg");
      if (!msg) return;
      msg.textContent = message;
      msg.dataset.tone = tone;
      msg.style.display = "block";
      window.setTimeout(() => {
        msg.style.display = "none";
      }, 3200);
    }

    function flushInputs(): void {
      container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-key]").forEach((row) => {
        const keyInput = row.querySelector<HTMLInputElement>("input[data-field='key']");
        const priceInput = row.querySelector<HTMLInputElement>("input[data-field='unitPrice']");
        const originalKey = row.dataset.key ?? "";
        const proposedKey = keyInput?.value.trim() || originalKey;
        const parsedPrice = Number.parseFloat(priceInput?.value ?? "0");
        const nextPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;

        if (originalKey && originalKey !== proposedKey) {
          delete prices[originalKey];
        }

        prices[proposedKey] = nextPrice;
        row.dataset.key = proposedKey;
        if (keyInput) {
          keyInput.value = proposedKey;
        }
      });
    }

    function renderTabs(): void {
      const tabsEl = container.querySelector<HTMLElement>("#category-tabs");
      if (!tabsEl) return;

      renderedCategories = getRenderedCategories(prices);
      if (!renderedCategories.some((category) => category.id === activeCategory)) {
        activeCategory = renderedCategories[0]?.id ?? activeCategory;
      }

      tabsEl.innerHTML = renderedCategories.map((category) => {
        const isActive = category.id === activeCategory;
        const count = getCategoryKeys(prices, category).length;
        return `<button type="button" data-cat="${category.id}" class="settings-tab${isActive ? " settings-tab--active" : ""}">
          <span class="settings-tab-icon">${category.icon}</span>
          <span class="settings-tab-label">${category.label}</span>
          <span class="settings-tab-count">${count}</span>
        </button>`;
      }).join("");

      tabsEl.querySelectorAll<HTMLButtonElement>("[data-cat]").forEach((button) => {
        button.addEventListener("click", () => {
          flushInputs();
          activeCategory = button.dataset.cat ?? activeCategory;
          renderTabs();
          renderTable();
        });
      });
    }

    function renderTable(): void {
      const active = getActiveCategory();
      const keys = getCategoryKeys(prices, active);
      const tbody = container.querySelector<HTMLElement>("#prices-tbody");
      const countEl = container.querySelector<HTMLElement>("#prices-count");
      const activeLabelEl = container.querySelector<HTMLElement>("#active-category-label");
      const activeDescEl = container.querySelector<HTMLElement>("#active-category-desc");
      const totalKeysEl = container.querySelector<HTMLElement>("#all-prices-count");

      if (activeLabelEl) {
        activeLabelEl.textContent = `${active.icon} ${active.label}`;
      }
      if (activeDescEl) {
        activeDescEl.textContent = active.description;
      }
      if (countEl) {
        countEl.textContent = String(keys.length);
      }
      if (totalKeysEl) {
        totalKeysEl.textContent = String(Object.keys(prices).length);
      }

      if (!tbody) return;

      if (keys.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="settings-empty-state">
              W tej kategorii nie ma jeszcze pozycji. Możesz dodać nową cenę przyciskiem poniżej.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = keys.map((key) => `
        <tr data-key="${escapeHtml(key)}">
          <td class="settings-td-key">
            <input data-field="key" value="${escapeHtml(key)}" class="settings-input settings-input--mono">
          </td>
          <td class="settings-td-product">
            <span class="settings-product-label">${escapeHtml(getPriceLabel(key))}</span>
          </td>
          <td class="settings-td-price">
            <input data-field="unitPrice" type="number" step="0.01" min="0" value="${Number(prices[key]).toFixed(2)}" class="settings-input settings-input--price">
          </td>
          <td class="settings-td-del">
            <button type="button" data-action="delete" data-key="${escapeHtml(key)}" class="settings-btn-del" title="Usuń pozycję">✕</button>
          </td>
        </tr>
      `).join("");

      tbody.querySelectorAll<HTMLButtonElement>("[data-action='delete']").forEach((button) => {
        button.addEventListener("click", () => {
          const key = button.dataset.key ?? "";
          if (!key) return;
          delete prices[key];
          renderTabs();
          renderTable();
        });
      });
    }

    container.innerHTML = `
      <div class="settings-wrap">
        <div class="settings-header">
          <div>
            <h2 class="settings-title">⚙️ Ustawienia cen</h2>
            <p class="settings-subtitle">Cennik jest podzielony na kategorie. Wybierz sekcję i zmieniaj tylko te ceny, które do niej należą.</p>
          </div>
          <div class="settings-summary-card">
            <span class="settings-summary-label">Wszystkie pozycje</span>
            <strong id="all-prices-count" class="settings-summary-value">0</strong>
          </div>
        </div>

        <div id="category-tabs" class="settings-tabs"></div>

        <div class="settings-active-meta">
          <div>
            <div id="active-category-label" class="settings-active-label">—</div>
            <div id="active-category-desc" class="settings-active-desc"></div>
          </div>
          <div class="settings-count-badge">Pozycji: <span id="prices-count">0</span></div>
        </div>

        <div class="settings-table-wrap">
          <table class="settings-table">
            <thead>
              <tr>
                <th class="settings-th-key">Klucz cennika</th>
                <th class="settings-th-product">Produkt / opis</th>
                <th class="settings-th-price">Cena (zł)</th>
                <th class="settings-th-del">Usuń</th>
              </tr>
            </thead>
            <tbody id="prices-tbody"></tbody>
          </table>
        </div>


        <div class="settings-actions">
          <button id="btn-add-row" type="button" class="btn-success settings-action-btn">+ Dodaj pozycję</button>
          <button id="btn-save" type="button" class="btn-primary settings-action-btn">💾 Zapisz zmiany</button>
          <button id="btn-reset" type="button" class="btn-secondary settings-action-btn">🔄 Przywróć domyślne</button>
        </div>

        <div id="save-msg" class="settings-save-msg" style="display:none;"></div>
      </div>
    `;

    renderTabs();
    renderTable();

    container.querySelector("#btn-add-row")?.addEventListener("click", () => {
      flushInputs();
      const active = getActiveCategory();
      const prefix = active.newKeyPrefix || active.prefixes[0] || "nowa-";
      const normalizedPrefix = prefix.endsWith("-") ? prefix : `${prefix}-`;
      const newKey = `${normalizedPrefix}nowa-${Date.now()}`;
      prices[newKey] = 0;
      renderTabs();
      renderTable();
      const keyInputs = container.querySelectorAll<HTMLInputElement>("tbody tr input[data-field='key']");
      keyInputs[keyInputs.length - 1]?.focus();
      keyInputs[keyInputs.length - 1]?.select();
    });

    container.querySelector("#btn-save")?.addEventListener("click", () => {
      flushInputs();
      setPrice("defaultPrices", prices);
      renderTabs();
      renderTable();
      showStatus("✓ Zapisano ceny.");
      // Emit event to notify all views about price changes
      ctx?.emit?.("prices-updated", { timestamp: Date.now() });
    });

    container.querySelector("#btn-reset")?.addEventListener("click", () => {
      if (!confirm("Przywrócić domyślne ceny? Twoje zmiany zostaną utracone.")) {
        return;
      }

      resetPrices();
      prices = loadPrices();
      renderTabs();
      renderTable();
      showStatus("✓ Przywrócono domyślne ceny.");
      // Emit event to notify all views about price changes
      ctx?.emit?.("prices-updated", { timestamp: Date.now() });
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      prices = loadPrices();
      renderTabs();
      renderTable();
      // Emit event to notify all views about price changes
      ctx?.emit?.("prices-updated", { timestamp: Date.now() });
    };

    window.addEventListener("storage", onStorage);
    _cleanup = () => window.removeEventListener("storage", onStorage);
  },

  unmount() {
    if (_cleanup) {
      _cleanup();
      _cleanup = null;
    }
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}