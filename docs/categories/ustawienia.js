// Ustawienia – dynamic price CRUD backed by localStorage
// Key format: "kategoria-zakres" (np. "druk-bw-a4-1-5", "skan-auto-1-9")
const STORAGE_KEY = 'razdwa_prices';

const DEFAULT_PRICES = {
  // === DRUK CZARNO-BIAŁY A4 ===
  "druk-bw-a4-1-5": 0.90,
  "druk-bw-a4-6-20": 0.60,
  "druk-bw-a4-21-100": 0.35,
  "druk-bw-a4-101-500": 0.30,
  "druk-bw-a4-501-999": 0.23,
  "druk-bw-a4-1000-4999": 0.19,
  "druk-bw-a4-5000+": 0.15,
  // === DRUK CZARNO-BIAŁY A3 ===
  "druk-bw-a3-1-5": 1.70,
  "druk-bw-a3-6-20": 1.10,
  "druk-bw-a3-21-100": 0.70,
  "druk-bw-a3-101-500": 0.60,
  "druk-bw-a3-501-999": 0.45,
  "druk-bw-a3-1000-4999": 0.33,
  "druk-bw-a3-5000+": 0.30,
  // === DRUK KOLOROWY A4 ===
  "druk-kolor-a4-1-10": 2.40,
  "druk-kolor-a4-11-40": 2.20,
  "druk-kolor-a4-41-100": 2.00,
  "druk-kolor-a4-101-250": 1.80,
  "druk-kolor-a4-251-500": 1.60,
  "druk-kolor-a4-501-999": 1.40,
  "druk-kolor-a4-1000+": 1.10,
  // === DRUK KOLOROWY A3 ===
  "druk-kolor-a3-1-10": 4.80,
  "druk-kolor-a3-11-40": 4.20,
  "druk-kolor-a3-41-100": 3.80,
  "druk-kolor-a3-101-250": 3.00,
  "druk-kolor-a3-251-500": 2.50,
  "druk-kolor-a3-501-999": 1.90,
  "druk-kolor-a3-1000+": 1.60,
  // === SKANOWANIE AUTOMATYCZNE ===
  "skan-auto-1-9": 1.00,
  "skan-auto-10-49": 0.50,
  "skan-auto-50-99": 0.40,
  "skan-auto-100+": 0.25,
  // === SKANOWANIE RĘCZNE Z SZYBY ===
  "skan-reczne-1-4": 2.00,
  "skan-reczne-5+": 1.00,
  // === DOPŁATY DRUK ===
  "druk-email": 1.00,
  "modifier-druk-zadruk25": 0.50,
  // === DRUK CAD – KOLOROWY (formatowy) ===
  "druk-cad-kolor-fmt-a3": 5.30,
  "druk-cad-kolor-fmt-a2": 8.50,
  "druk-cad-kolor-fmt-a1": 12.00,
  "druk-cad-kolor-fmt-a1plus": 14.00,
  "druk-cad-kolor-fmt-a0": 24.00,
  "druk-cad-kolor-fmt-a0plus": 26.00,
  // === DRUK CAD – KOLOROWY (metr bieżący) ===
  "druk-cad-kolor-mb-a3": 12.00,
  "druk-cad-kolor-mb-a2": 13.90,
  "druk-cad-kolor-mb-a1": 14.30,
  "druk-cad-kolor-mb-a1plus": 15.30,
  "druk-cad-kolor-mb-a0": 20.00,
  "druk-cad-kolor-mb-a0plus": 21.00,
  "druk-cad-kolor-mb-mb1067": 30.00,
  // === DRUK CAD – CZARNO-BIAŁY (formatowy) ===
  "druk-cad-bw-fmt-a3": 3.00,
  "druk-cad-bw-fmt-a2": 6.00,
  "druk-cad-bw-fmt-a1": 8.00,
  "druk-cad-bw-fmt-a1plus": 9.70,
  "druk-cad-bw-fmt-a0": 10.00,
  "druk-cad-bw-fmt-a0plus": 12.00,
  "druk-cad-bw-fmt-mb1067": 14.00,
  // === DRUK CAD – CZARNO-BIAŁY (metr bieżący) ===
  "druk-cad-bw-mb-a3": 8.50,
  "druk-cad-bw-mb-a2": 8.50,
  "druk-cad-bw-mb-a1": 10.20,
  "druk-cad-bw-mb-a1plus": 10.60,
  "druk-cad-bw-mb-a0": 9.00,
  "druk-cad-bw-mb-a0plus": 10.00,
  "druk-cad-bw-mb-mb1067": 12.00,
  // === LAMINOWANIE A3 ===
  "laminowanie-a3-1-50": 7.00,
  "laminowanie-a3-51-100": 6.00,
  "laminowanie-a3-101-200": 5.00,
  // === LAMINOWANIE A4 ===
  "laminowanie-a4-1-50": 5.00,
  "laminowanie-a4-51-100": 4.50,
  "laminowanie-a4-101-200": 4.00,
  // === LAMINOWANIE A5 ===
  "laminowanie-a5-1-50": 4.00,
  "laminowanie-a5-51-100": 3.50,
  "laminowanie-a5-101-200": 3.00,
  // === LAMINOWANIE A6 ===
  "laminowanie-a6-1-50": 3.00,
  "laminowanie-a6-51-100": 2.50,
  "laminowanie-a6-101-200": 2.00,
  // === INTROLIGATORNIA – USŁUGI JEDNOSTKOWE ===
  "laminowanie-intro-gilotyna": 0.07,
  "laminowanie-intro-trymer": 0.50,
  "laminowanie-intro-dziurkowanie-powyzej-20": 0.05,
  "laminowanie-intro-zszywanie": 0.30,
  "laminowanie-intro-broszurowanie": 0.50,
  "laminowanie-intro-bigowanie": 0.50,
  // === OPRAWA GRZBIETOWA (listwa wsuwana) ===
  "laminowanie-oprawa-grzbietowa-a4-do30": 3.50,
  "laminowanie-oprawa-grzbietowa-a4-do60": 4.50,
  "laminowanie-oprawa-grzbietowa-a4-do90": 5.50,
  "laminowanie-oprawa-grzbietowa-a4-do150": 7.00,
  "laminowanie-oprawa-grzbietowa-a3-do30": 7.00,
  "laminowanie-oprawa-grzbietowa-a3-do60": 8.00,
  "laminowanie-oprawa-grzbietowa-a3-do90": 9.00,
  "laminowanie-oprawa-grzbietowa-a3-do150": 14.00,
  // === OPRAWY KANAŁOWE – dyplomowe ===
  "laminowanie-oprawa-kanalowa-standard": 25.00,
  "laminowanie-oprawa-kanalowa-pozostale": 35.00,
  "laminowanie-oprawa-kanalowa-bez-napisu": 20.00,
  "laminowanie-oprawa-kanalowa-wkarta": 10.00,
  // === OPRAWY ZACISKOWE I INNE ===
  "laminowanie-oprawa-zaciskowa-thermo-biala": 8.00,
  "laminowanie-oprawa-zaciskowa-miekka": 15.00,
  "laminowanie-oprawa-zaciskowa-skoroszyt-zszywanie": 7.00,
  // === OPRAWA DOKUMENTACJI WYDRUKOWANEJ U NAS ===
  "laminowanie-oprawa-zbijane-printed-here": 50.00,
  "laminowanie-oprawa-skrecane-printed-here": 60.00,
  "laminowanie-oprawa-zbijane-extra-per-cm-printed-here": 10.00,
  // === OPRAWA DOKUMENTACJI DOSTARCZONEJ PRZEZ KLIENTA ===
  "laminowanie-oprawa-zbijane-client-supplied": 60.00,
  "laminowanie-oprawa-skrecane-client-supplied": 70.00,
  "laminowanie-oprawa-zbijane-extra-per-cm-client-supplied": 12.00,
  // === DODATKOWO PŁATNE (oprawy twarde) ===
  "laminowanie-oprawa-twarda-rozszycie": 25.00,
  "laminowanie-oprawa-twarda-ponowne-zszycie": 25.00,
  // === BINDOWANIE – PLASTIK ===
  "laminowanie-bindowanie-plastik-1-50-do20-listwa": 7.00,
  "laminowanie-bindowanie-plastik-1-50-do20-spirala": 6.00,
  "laminowanie-bindowanie-plastik-1-50-21-100": 5.00,
  "laminowanie-bindowanie-plastik-1-50-100plus": 4.00,
  "laminowanie-bindowanie-plastik-51-100-do20": 9.00,
  "laminowanie-bindowanie-plastik-51-100-21-100": 8.00,
  "laminowanie-bindowanie-plastik-51-100-100plus": 7.00,
  "laminowanie-bindowanie-plastik-101-200-do20": 13.00,
  "laminowanie-bindowanie-plastik-101-200-21-100": 12.00,
  "laminowanie-bindowanie-plastik-101-200-100plus": 11.00,
  // === BINDOWANIE – METAL ===
  "laminowanie-bindowanie-metal-1-50-do40": 11.00,
  "laminowanie-bindowanie-metal-1-50-do80": 13.00,
  "laminowanie-bindowanie-metal-1-50-do120": 15.00,
  "laminowanie-bindowanie-metal-51-100-do40": 10.00,
  "laminowanie-bindowanie-metal-51-100-do80": 11.00,
  "laminowanie-bindowanie-metal-51-100-do120": 13.00,
  // === SOLWENT – PAPIER 150G PÓŁMAT ===
  "solwent-150g-1-3": 65.00,
  "solwent-150g-4-9": 60.00,
  "solwent-150g-10-20": 55.00,
  "solwent-150g-21-40": 50.00,
  "solwent-150g-41+": 42.00,
  // === SOLWENT – PAPIER 200G POŁYSK ===
  "solwent-200g-1-3": 70.00,
  "solwent-200g-4-9": 65.00,
  "solwent-200g-10-20": 59.00,
  "solwent-200g-21-40": 53.00,
  "solwent-200g-41+": 45.00,
  // === VOUCHERY A4 – JEDNOSTRONNE ===
  "vouchery-1-jed": 20.00,
  "vouchery-2-jed": 29.00,
  "vouchery-3-jed": 30.00,
  "vouchery-4-jed": 32.00,
  "vouchery-5-jed": 35.00,
  "vouchery-6-jed": 39.00,
  "vouchery-7-jed": 41.00,
  "vouchery-8-jed": 45.00,
  "vouchery-9-jed": 48.00,
  "vouchery-10-jed": 52.00,
  "vouchery-15-jed": 60.00,
  "vouchery-20-jed": 67.00,
  "vouchery-25-jed": 74.00,
  "vouchery-30-jed": 84.00,
  // === VOUCHERY A4 – DWUSTRONNE ===
  "vouchery-1-dwu": 25.00,
  "vouchery-2-dwu": 32.00,
  "vouchery-3-dwu": 37.00,
  "vouchery-4-dwu": 39.00,
  "vouchery-5-dwu": 43.00,
  "vouchery-6-dwu": 45.00,
  "vouchery-7-dwu": 48.00,
  "vouchery-8-dwu": 50.00,
  "vouchery-9-dwu": 52.00,
  "vouchery-10-dwu": 58.00,
  "vouchery-15-dwu": 70.00,
  "vouchery-20-dwu": 82.00,
  "vouchery-25-dwu": 100.00,
  "vouchery-30-dwu": 120.00,
  // === BANNER – POWLEKANY ===
  "banner-powlekany-1-25": 53.00,
  "banner-powlekany-26-50": 49.00,
  "banner-powlekany-51+": 45.00,
  // === BANNER – BLOCKOUT ===
  "banner-blockout-1-25": 64.00,
  "banner-blockout-26-50": 59.00,
  "banner-blockout-51+": 55.00,
  "banner-oczkowanie": 2.50,
  // === ROLL-UP ===
  "rollup-85x200-1-5": 290.00,
  "rollup-85x200-6-10": 275.00,
  "rollup-100x200-1-5": 305.00,
  "rollup-100x200-6-10": 285.00,
  "rollup-120x200-1-5": 330.00,
  "rollup-120x200-6-10": 310.00,
  "rollup-150x200-1-5": 440.00,
  "rollup-150x200-6-10": 425.00,
  "rollup-wymiana-labor": 50.00,
  "rollup-wymiana-m2": 80.00,
  // === FOLIA SZRONIONA ===
  "folia-szroniona-wydruk-1-5": 65.00,
  "folia-szroniona-wydruk-6-25": 60.00,
  "folia-szroniona-wydruk-26-50": 56.00,
  "folia-szroniona-wydruk-51+": 51.00,
  "folia-szroniona-oklejanie-1-5": 140.00,
  "folia-szroniona-oklejanie-6-10": 130.00,
  "folia-szroniona-oklejanie-11-20": 120.00,
  // === WLEPKI – PO OBRYSIE (FOLIA) ===
  "wlepki-obrys-folia-1-5": 67.00,
  "wlepki-obrys-folia-6-25": 60.00,
  "wlepki-obrys-folia-26-50": 52.00,
  "wlepki-obrys-folia-51+": 48.00,
  // === WLEPKI – POLIPROPYLEN ===
  "wlepki-polipropylen-1-10": 50.00,
  "wlepki-polipropylen-11+": 42.00,
  // === WLEPKI – STANDARD FOLIA ===
  "wlepki-standard-folia-1-5": 54.00,
  "wlepki-standard-folia-6-25": 50.00,
  "wlepki-standard-folia-26-50": 46.00,
  "wlepki-standard-folia-51+": 42.00,
  "wlepki-modifier-arkusze": 2.00,
  "wlepki-modifier-pojedyncze": 10.00,
  "wlepki-modifier-mocny-klej": 0.12,
  // === WIZYTÓWKI 85×55 (CENA ZA NAKŁAD) ===
  "wizytowki-85x55-none-50szt": 65.00,
  "wizytowki-85x55-none-100szt": 75.00,
  "wizytowki-85x55-none-250szt": 110.00,
  "wizytowki-85x55-none-500szt": 170.00,
  "wizytowki-85x55-none-1000szt": 290.00,
  "wizytowki-85x55-matt_gloss-50szt": 160.00,
  "wizytowki-85x55-matt_gloss-100szt": 170.00,
  "wizytowki-85x55-matt_gloss-250szt": 200.00,
  "wizytowki-85x55-matt_gloss-500szt": 250.00,
  "wizytowki-85x55-matt_gloss-1000szt": 335.00,
  // === WIZYTÓWKI 90×50 (CENA ZA NAKŁAD) ===
  "wizytowki-90x50-none-50szt": 70.00,
  "wizytowki-90x50-none-100szt": 79.00,
  "wizytowki-90x50-none-250szt": 120.00,
  "wizytowki-90x50-none-500szt": 175.00,
  "wizytowki-90x50-none-1000szt": 300.00,
  "wizytowki-90x50-matt_gloss-50szt": 170.00,
  "wizytowki-90x50-matt_gloss-100szt": 180.00,
  "wizytowki-90x50-matt_gloss-250szt": 210.00,
  "wizytowki-90x50-matt_gloss-500szt": 260.00,
  "wizytowki-90x50-matt_gloss-1000szt": 345.00,
  // === MODYFIKATORY (procent jako ułamek dziesiętny) ===
  "modifier-satyna": 0.12,
  "modifier-express": 0.20,
  "modifier-express-vouchery": 0.30,
  "modifier-vouchery-dwustronne": 0.80,
  "modifier-vouchery-300g": 0.25,
};

// === DEFINICJA KATEGORII ===
const CATEGORIES = {
  "druk-a4-a3": {
    label: "📄 Druk A4/A3",
    prefixes: ["druk-bw-", "druk-kolor-", "druk-email", "modifier-druk-zadruk25"]
  },
  "druk-cad": {
    label: "🖨️ Druk CAD",
    prefixes: ["druk-cad-"]
  },
  "skanowanie": {
    label: "📸 Skanowanie",
    prefixes: ["skan-"]
  },
  "laminowanie": {
    label: "🔲 Introligatornia",
    prefixes: ["laminowanie-"]
  },
  "solwent": {
    label: "🖼️ Solwent - Plakaty",
    prefixes: ["solwent-"]
  },
  "banner": {
    label: "🎌 Banner",
    prefixes: ["banner-"]
  },
  "rollup": {
    label: "📜 Roll-up",
    prefixes: ["rollup-"]
  },
  "folia": {
    label: "❄️ Folia szroniona",
    prefixes: ["folia-szroniona-"]
  },
  "wlepki": {
    label: "🏷️ Wlepki / Naklejki",
    prefixes: ["wlepki-"]
  },
  "wizytowki": {
    label: "💼 Wizytówki",
    prefixes: ["wizytowki-"]
  },
  "dyplomy": {
    label: "📜 Dyplomy",
    prefixes: ["dyplomy-"]
  },
  "vouchery": {
    label: "🎟️ Vouchery",
    prefixes: ["vouchery-"]
  },
  "modyfikatory": {
    label: "⚙️ Modyfikatory globalne",
    prefixes: ["modifier-"]
  },
  "wszystkie": {
    label: "📋 Wszystkie",
    prefixes: []  // pusty = wszystkie
  }
};

let currentCategory = "wszystkie";

let prices = (function() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const validated = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (k && typeof v === 'number' && isFinite(v)) validated[k] = v;
        }
        if (Object.keys(validated).length > 0) return validated;
      }
    }
  } catch { /* ignore */ }
  return Object.assign({}, DEFAULT_PRICES);
})();

function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function getPriceKeyDescription(key) {
  // Introligatornia / laminowanie – opisy zgodne z CSV (bez zmiany kluczy i cen)
  if (key.startsWith('laminowanie-intro-')) {
    const introMap = {
      'laminowanie-intro-gilotyna': 'Introligatornia – usługi jednostkowe • Cięcie na gilotynie (za 1 cięcie)',
      'laminowanie-intro-trymer': 'Introligatornia – usługi jednostkowe • Cięcie ręczne (TRYMER) (za 1 cięcie)',
      'laminowanie-intro-dziurkowanie-powyzej-20': 'Introligatornia – usługi jednostkowe • Dziurkowanie powyżej 20 kartek (za 1 kartkę)',
      // Klucz historyczny – mapowany opisem na pozycję z CSV
      'laminowanie-intro-druk-powyzej-20': 'Introligatornia – usługi jednostkowe • Dziurkowanie powyżej 20 kartek (za 1 kartkę)',
      'laminowanie-intro-zszywanie': 'Introligatornia – usługi jednostkowe • Zszywanie kartek (za 1 zszywkę)',
      'laminowanie-intro-broszurowanie': 'Introligatornia – usługi jednostkowe • Broszurowanie / docinanie (za 1 cięcie)',
      'laminowanie-intro-bigowanie': 'Introligatornia – usługi jednostkowe • Bigowanie (za 1 big)'
    };
    return introMap[key] || 'Introligatornia • Usługa dodatkowa';
  }

  let m = key.match(/^laminowanie-bindowanie-plastik-(\d+-\d+)-(do20|21-100|100plus)$/);
  if (m) {
    const naklad = m[1];
    const gruboscMap = {
      do20: 'do 20 kartek',
      '21-100': '21-100 kartek',
      '100plus': 'powyżej 100 kartek'
    };
    return `Bindowanie – plastik (listwa zatrzaskowa / spirala plastik) • ${naklad} szt. • ${gruboscMap[m[2]]}`;
  }

  m = key.match(/^laminowanie-bindowanie-plastik-(\d+-\d+)-do20-(listwa|spirala)$/);
  if (m) {
    const naklad = m[1];
    const typMap = { listwa: 'listwa', spirala: 'spirala' };
    return `Bindowanie – plastik (listwa zatrzaskowa / spirala plastik) • ${naklad} szt. • do 20 kartek • ${typMap[m[2]]}`;
  }

  m = key.match(/^laminowanie-bindowanie-metal-(\d+-\d+)-(do40|do80|do120)$/);
  if (m) {
    const naklad = m[1];
    const kartkiMap = { do40: 'do 40 kartek', do80: 'do 80 kartek', do120: 'do 120 kartek' };
    return `Bindowanie – metal (spirala metalowa) • ${naklad} szt. • ${kartkiMap[m[2]]}`;
  }

  m = key.match(/^laminowanie-oprawa-grzbietowa-(a4|a3)-do(30|60|90|150)$/);
  if (m) {
    return `Oprawa grzbietowa (listwa wsuwana) • ${m[1].toUpperCase()} • do ${m[2]} stron`;
  }

  const kanalMap = {
    'laminowanie-oprawa-kanalowa-standard': 'Oprawy kanałowe – dyplomowe • standard (z napisem)',
    'laminowanie-oprawa-kanalowa-pozostale': 'Oprawy kanałowe – dyplomowe • pozostałe kolory',
    'laminowanie-oprawa-kanalowa-bez-napisu': 'Oprawy kanałowe – dyplomowe • bez napisu',
    'laminowanie-oprawa-kanalowa-wkarta': 'Oprawy kanałowe – dyplomowe • wkarta'
  };
  if (kanalMap[key]) return kanalMap[key];

  const zaciskMap = {
    'laminowanie-oprawa-zaciskowa-miekka': 'Oprawy zaciskowe i inne • oprawa zaciskowa miękka',
    'laminowanie-oprawa-zaciskowa-thermo-biala': 'Oprawy zaciskowe i inne • oprawa zaciskowa biała (zszywka THERMO)',
    'laminowanie-oprawa-zaciskowa-skoroszyt-zszywanie': 'Oprawy zaciskowe i inne • skoroszyt + zszywanie'
  };
  if (zaciskMap[key]) return zaciskMap[key];

  const zbijaneMap = {
    'laminowanie-oprawa-zbijane-printed-here': 'Oprawa dokumentacji wydrukowanej u nas • zbijane (do 5 cm wysokości dokumentów)',
    'laminowanie-oprawa-skrecane-printed-here': 'Oprawa dokumentacji wydrukowanej u nas • skręcane – śruby introligatorskie (do 5 cm wysokości dokumentów)',
    'laminowanie-oprawa-zbijane-client-supplied': 'Oprawa dokumentacji dostarczonej przez klienta • zbijane (do 5 cm wysokości dokumentów)',
    'laminowanie-oprawa-skrecane-client-supplied': 'Oprawa dokumentacji dostarczonej przez klienta • skręcane – śruby introligatorskie (do 5 cm wysokości dokumentów)',
    'laminowanie-oprawa-zbijane-extra-per-cm-printed-here': 'Dopłata • każdy dodatkowy 1 cm oprawy powyżej 5 cm (dokumentacja wydrukowana u nas)',
    'laminowanie-oprawa-zbijane-extra-per-cm-client-supplied': 'Dopłata • każdy dodatkowy 1 cm oprawy powyżej 5 cm (dokumentacja dostarczona przez klienta)'
  };
  if (zbijaneMap[key]) return zbijaneMap[key];

  const twardaMap = {
    'laminowanie-oprawa-twarda-rozszycie': 'Dodatkowo płatne (oprawy twarde) • Rozszycie oprawy twardej (od 25 do 40 zł)',
    'laminowanie-oprawa-twarda-ponowne-zszycie': 'Dodatkowo płatne (oprawy twarde) • Ponowne zszycie oprawy twardej (od 25 do 40 zł)'
  };
  if (twardaMap[key]) return twardaMap[key];

  const specjalneMap = {
    'laminowanie-special-dyplom': 'Wydruki specjalne • Dyplom',
    'laminowanie-special-zaproszenia-dodruk': 'Wydruki specjalne • Zaproszenia (dodruk)',
    'laminowanie-special-katalog': 'Wydruki specjalne • Katalog',
    'laminowanie-special-broszura': 'Wydruki specjalne • Broszura',
    'laminowanie-special-koperty-nadruk': 'Wydruki specjalne • Koperty – nadruk',
    'laminowanie-special-trymer-2x': 'Wydruki specjalne • Cięcie trymer 2x',
    'laminowanie-special-trymer-4x': 'Wydruki specjalne • Cięcie trymer 4x',
    'laminowanie-special-double-sided-factor': 'Wydruki specjalne • dopłata za dwustronność'
  };
  if (specjalneMap[key]) return specjalneMap[key];

  m = key.match(/^laminowanie-([aA]\d)-(\d+)-(\d+)$/);
  if (m) {
    return `Laminowanie ${m[1].toUpperCase()} • zakres ilości: ${m[2]}-${m[3]} szt.`;
  }

  m = key.match(/^laminowanie-([aA]\d)-(\d+)\+$/);
  if (m) {
    return `Laminowanie ${m[1].toUpperCase()} • zakres ilości: od ${m[2]} szt.`;
  }

  return '';
}

function getCategoryForKey(key) {
  // Znajdź kategorię dla danego klucza
  for (const [catId, catData] of Object.entries(CATEGORIES)) {
    if (catId === "wszystkie") continue;
    if (catData.prefixes.some(prefix => key.startsWith(prefix))) {
      return catId;
    }
  }
  return "inne";  // fallback dla nieznanych kluczy
}

function getRangeStart(key) {
  const m = key.match(/-(\d+)(?:-|\+|szt)/);
  return m ? Number.parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
}

function compareDrukA4A3Keys(a, b) {
  const groupRank = (key) => {
    if (key.startsWith('druk-bw-a4-')) return 0;
    if (key.startsWith('druk-kolor-a4-')) return 1;
    if (key.startsWith('druk-bw-a3-')) return 2;
    if (key.startsWith('druk-kolor-a3-')) return 3;
    if (key === 'druk-email') return 4;
    if (key === 'modifier-druk-zadruk25') return 5;
    return 99;
  };

  const ga = groupRank(a);
  const gb = groupRank(b);
  if (ga !== gb) return ga - gb;

  const ra = getRangeStart(a);
  const rb = getRangeStart(b);
  if (ra !== rb) return ra - rb;

  return a.localeCompare(b);
}

function compareDrukCadKeys(a, b) {
  const parseCad = (key) => {
    const m = key.match(/^druk-cad-(bw|kolor)-(fmt|mb)-([a-z0-9]+)$/);
    if (!m) return { mode: '', type: '', size: '', raw: key };
    return { mode: m[1], type: m[2], size: m[3], raw: key };
  };

  const cadRank = (p) => {
    if (p.mode === 'bw' && p.type === 'fmt') return 0;
    if (p.mode === 'bw' && p.type === 'mb') return 1;
    if (p.mode === 'kolor' && p.type === 'fmt') return 2;
    if (p.mode === 'kolor' && p.type === 'mb') return 3;
    return 99;
  };

  const sizeRank = {
    a3: 0,
    a2: 1,
    a1: 2,
    a1plus: 3,
    a0: 4,
    a0plus: 5,
    mb1067: 6
  };

  const pa = parseCad(a);
  const pb = parseCad(b);

  const ra = cadRank(pa);
  const rb = cadRank(pb);
  if (ra !== rb) return ra - rb;

  const sa = sizeRank[pa.size] ?? Number.POSITIVE_INFINITY;
  const sb = sizeRank[pb.size] ?? Number.POSITIVE_INFINITY;
  if (sa !== sb) return sa - sb;

  return pa.raw.localeCompare(pb.raw);
}

function compareSkanowanieKeys(a, b) {
  const groupRank = (key) => {
    if (key.startsWith('skan-auto-')) return 0;
    if (key.startsWith('skan-reczne-')) return 1;
    return 99;
  };

  const ga = groupRank(a);
  const gb = groupRank(b);
  if (ga !== gb) return ga - gb;

  const ra = getRangeStart(a);
  const rb = getRangeStart(b);
  if (ra !== rb) return ra - rb;

  return a.localeCompare(b);
}

function compareLaminowanieKeys(a, b) {
  const formatRank = (key) => {
    if (key.startsWith('laminowanie-a3-')) return 0;
    if (key.startsWith('laminowanie-a4-')) return 1;
    if (key.startsWith('laminowanie-a5-')) return 2;
    if (key.startsWith('laminowanie-a6-')) return 3;
    if (key.startsWith('laminowanie-intro-')) return 4;
    if (key.startsWith('laminowanie-bindowanie-plastik-')) return 5;
    if (key.startsWith('laminowanie-bindowanie-metal-')) return 6;
    if (key.startsWith('laminowanie-oprawa-')) return 7;
    if (key.startsWith('laminowanie-special-')) return 8;
    return 99;
  };

  const fa = formatRank(a);
  const fb = formatRank(b);
  if (fa !== fb) return fa - fb;

  const ra = getRangeStart(a);
  const rb = getRangeStart(b);
  if (ra !== rb) return ra - rb;

  return a.localeCompare(b);
}

function compareSolwentKeys(a, b) {
  const materialRank = (key) => {
    if (key.startsWith('solwent-150g-')) return 0;
    if (key.startsWith('solwent-200g-')) return 1;
    return 99;
  };

  const ma = materialRank(a);
  const mb = materialRank(b);
  if (ma !== mb) return ma - mb;

  const ra = getRangeStart(a);
  const rb = getRangeStart(b);
  if (ra !== rb) return ra - rb;

  return a.localeCompare(b);
}

function compareVoucheryKeys(a, b) {
  const parseVoucher = (key) => {
    const m = key.match(/^vouchery-(\d+)-(jed|dwu)$/);
    if (!m) return { qty: Number.POSITIVE_INFINITY, side: 99, raw: key };
    return {
      qty: Number.parseInt(m[1], 10),
      side: m[2] === 'jed' ? 0 : 1,
      raw: key
    };
  };

  const pa = parseVoucher(a);
  const pb = parseVoucher(b);

  if (pa.side !== pb.side) return pa.side - pb.side;
  if (pa.qty !== pb.qty) return pa.qty - pb.qty;

  return pa.raw.localeCompare(pb.raw);
}

function compareDyplomyKeys(a, b) {
  const parseDyplomy = (key) => {
    const m = key.match(/^dyplomy-qty-(\d+)$/);
    if (!m) return { qty: Number.POSITIVE_INFINITY, raw: key };
    return { qty: Number.parseInt(m[1], 10), raw: key };
  };

  const pa = parseDyplomy(a);
  const pb = parseDyplomy(b);

  if (pa.qty !== pb.qty) return pa.qty - pb.qty;
  return pa.raw.localeCompare(pb.raw);
}

function getFilteredPrices() {
  if (currentCategory === "wszystkie") {
    return Object.keys(prices).sort();
  }
  
  const catData = CATEGORIES[currentCategory];
  if (!catData) return [];

  const keys = Object.keys(prices)
    .filter(key => catData.prefixes.some(prefix => key.startsWith(prefix)));

  if (currentCategory === 'druk-a4-a3') {
    return keys.sort(compareDrukA4A3Keys);
  }

  if (currentCategory === 'druk-cad') {
    return keys.sort(compareDrukCadKeys);
  }

  if (currentCategory === 'skanowanie') {
    return keys.sort(compareSkanowanieKeys);
  }

  if (currentCategory === 'laminowanie') {
    return keys.sort(compareLaminowanieKeys);
  }

  if (currentCategory === 'solwent') {
    return keys.sort(compareSolwentKeys);
  }

  if (currentCategory === 'vouchery') {
    return keys.sort(compareVoucheryKeys);
  }

  if (currentCategory === 'dyplomy') {
    return keys.sort(compareDyplomyKeys);
  }

  return keys.sort();
}

function renderCategoryTabs() {
  const tabsContainer = document.getElementById('categoryTabs');
  if (!tabsContainer) return;
  
  tabsContainer.innerHTML = Object.entries(CATEGORIES).map(([catId, catData]) => {
    const isActive = catId === currentCategory;
    const count = catId === "wszystkie" 
      ? Object.keys(prices).length 
      : Object.keys(prices).filter(key => catData.prefixes.some(p => key.startsWith(p))).length;
    
    return `
      <button data-category="${catId}" 
        style="
          padding: 8px 16px;
          border: 2px solid ${isActive ? 'var(--primary, #667eea)' : 'var(--border, #ccc)'};
          background: ${isActive ? 'var(--primary, #667eea)' : 'var(--surface, #fff)'};
          color: ${isActive ? '#fff' : 'var(--text-primary, #000)'};
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: ${isActive ? '600' : '400'};
          transition: all 0.2s;
        "
        onmouseover="if(this.dataset.category !== '${currentCategory}') this.style.background='var(--surface-hover, #f5f5f5)'"
        onmouseout="if(this.dataset.category !== '${currentCategory}') this.style.background='var(--surface, #fff)'"
      >
        ${catData.label} <span style="opacity: 0.7; font-size: 11px;">(${count})</span>
      </button>
    `;
  }).join('');
  
  // Dodaj event listeners
  tabsContainer.querySelectorAll('button[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      renderCategoryTabs();
      updateTable();
    });
  });
}

function updateTable() {
  const tbody = document.querySelector('#pricesTable tbody');
  if (!tbody) return;
  const filteredKeys = getFilteredPrices();
  
  if (filteredKeys.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="padding: 40px; text-align: center; color: var(--text-secondary);">
          <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
          <div>Brak pozycji w tej kategorii</div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredKeys.map(key => `
    <tr style="border-bottom: 1px solid var(--border);">
      <td style="padding: 6px 10px;">
        ${getPriceKeyDescription(key)
          ? `<div style="font-size: 11px; color: var(--text-secondary); margin: 0 0 6px 0; line-height: 1.35;">${escAttr(getPriceKeyDescription(key))}</div>`
          : ''}
        <input value="${escAttr(key)}" data-key="${escAttr(key)}" data-field="key"
          style="width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 13px; font-family: monospace; background: var(--surface); color: var(--text-primary);">
      </td>
      <td style="padding: 6px 10px;">
        <input type="number" value="${Number(prices[key]).toFixed(2)}" step="0.01" min="0"
          data-key="${escAttr(key)}" data-field="unitPrice"
          style="width: 120px; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 14px; background: var(--surface); color: var(--text-primary);">
      </td>
      <td style="padding: 6px 10px; text-align: center;">
        <button data-remove="${escAttr(key)}" title="Usuń" style="background: none; border: none; cursor: pointer; font-size: 18px; line-height: 1;">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Inline edit listeners
  tbody.querySelectorAll('input[data-key]').forEach(input => {
    // Handle both 'input' and 'blur' events for immediate and committed changes
    const handleChange = () => {
      const oldKey = input.dataset.key;
      const field = input.dataset.field;
      if (field === 'unitPrice') {
        const newVal = parseFloat(input.value) || 0;
        if (prices[oldKey] !== newVal) {
          prices[oldKey] = newVal;
          // Show confirmation
          showMsg(`✏️ Cena zaktualizowana: ${oldKey}`);
        }
      } else {
        const newKey = input.value.trim();
        if (newKey && newKey !== oldKey) {
          prices[newKey] = prices[oldKey];
          delete prices[oldKey];
          input.dataset.key = newKey;  // Update the data attribute
          renderCategoryTabs();  // Update counters
          updateTable();
          showMsg(`✏️ Klucz zmieniony: ${oldKey} → ${newKey}`);
        }
      }
    };
    
    input.addEventListener('input', handleChange);
    input.addEventListener('blur', handleChange);
  });

  // Remove listeners
  tbody.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      delete prices[btn.dataset.remove];
      renderCategoryTabs();  // Update counters
      updateTable();
    });
  });
}

function showMsg(text, isError = false) {
  const el = document.getElementById('ustawienia-msg');
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
  el.style.background = isError ? 'rgba(201,42,42,0.1)' : 'rgba(43,138,62,0.1)';
  el.style.color = isError ? 'var(--danger)' : 'var(--success)';
  el.style.border = isError ? '1px solid var(--danger)' : '1px solid var(--success)';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// Initial render - wait for DOM to be ready
function initializeSettingsPanel() {
  console.log('🔍 Attempting to initialize settings panel...');
  
  const tabsContainer = document.getElementById('categoryTabs');
  const pricesTable = document.getElementById('pricesTable');
  const addBtn = document.getElementById('addPriceBtn');
  const saveBtn = document.getElementById('saveAllBtn');
  const resetBtn = document.getElementById('resetPricesBtn');
  
  console.log('DOM elements found:', {
    categoryTabs: !!tabsContainer,
    pricesTable: !!pricesTable,
    addPriceBtn: !!addBtn,
    saveAllBtn: !!saveBtn,
    resetPricesBtn: !!resetBtn
  });
  
  if (!tabsContainer || !pricesTable || !addBtn || !saveBtn || !resetBtn) {
    console.warn('⚠️ Settings panel DOM elements not found. Retrying in 100ms...');
    setTimeout(initializeSettingsPanel, 100);
    return;
  }
  
  // Setup event listeners
  addBtn.onclick = () => {
    let prefix = '';
    if (currentCategory !== 'wszystkie' && currentCategory !== 'modyfikatory') {
      const catData = CATEGORIES[currentCategory];
      if (catData && catData.prefixes.length > 0) {
        prefix = catData.prefixes[0];
      }
    }
    const newKey = prefix + 'nowa-pozycja-' + Date.now();
    prices[newKey] = 0;
    renderCategoryTabs();
    updateTable();
    const tbody = document.querySelector('#pricesTable tbody');
    if (tbody) tbody.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  saveBtn.onclick = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
    showMsg('✅ Zapisano! Ceny zaktualizowane.');
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  };

  resetBtn.onclick = () => {
    if (!confirm('Przywrócić domyślne ceny? Twoje zmiany zostaną utracone.')) return;
    prices = Object.assign({}, DEFAULT_PRICES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
    renderCategoryTabs();
    updateTable();
    showMsg('🔄 Przywrócono domyślne ceny.');
  };
  
  renderCategoryTabs();
  updateTable();
  console.log('✅ Settings panel initialized successfully');
}

// Wait for DOM ready
if (document.readyState === 'loading') {
  console.log('⏳ DOM loading, attaching DOMContentLoaded listener...');
  document.addEventListener('DOMContentLoaded', initializeSettingsPanel);
} else {
  console.log('✅ DOM already loaded, initializing immediately...');
  initializeSettingsPanel();
}

// Also try to initialize when script loads (fallback for dynamic content)
setTimeout(initializeSettingsPanel, 50);
