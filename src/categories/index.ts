import { sampleCategory } from "./sample";
import { plakatyCategory } from "./plakaty";
import { voucheryCategory } from "./vouchery";
import { DyplomyView as dyplomyCategory } from "../ui/views/dyplomy";
import { WizytowkiView as wizytowyCategory } from "../ui/views/wizytowki-druk-cyfrowy";
import { ZaproszeniaKredaView as zaproszeniaKredaCategory } from "../ui/views/zaproszenia-kreda";
import { UlotkiDwustronneView as ulotkiDwustronneCategory } from "../ui/views/ulotki-cyfrowe-dwustronne";
import { UlotkiJednostronneView as ulotkiJednostronneCategory } from "../ui/views/ulotki-cyfrowe-jednostronne";
import { BannerView as banneryCategory } from "../ui/views/banner";
import { WlepkiView as wlepkiCategory } from "../ui/views/wlepki-naklejki";
import { RollUpView as rollupCategory } from "../ui/views/roll-up";
import { createHTMLCategory } from "./loader";

export const categories = [
  // Istniejące kategorie JS
  sampleCategory,
  plakatyCategory,
  voucheryCategory,
  dyplomyCategory,
  wizytowyCategory,
  zaproszeniaKredaCategory,
  ulotkiDwustronneCategory,
  ulotkiJednostronneCategory,
  banneryCategory,
  wlepkiCategory,
  rollupCategory,
  
  // Nowe kategorie z HTML
  createHTMLCategory('druk-a4-a3-skan', '📄 Druk A4/A3 + skan', 'druk-a4-a3-skan.html'),
  createHTMLCategory('druk-a4-a3', '📄 Druk A4/A3', 'druk-a4-a3.html'),
  createHTMLCategory('cad-ops', '🗺️ CAD OPS', 'cad-ops.html'),
  createHTMLCategory('druk-cad', '🗺️ Druk CAD', 'druk-cad.html'),
  createHTMLCategory('folia-szroniona', '✨ Folia Szroniona', 'folia-szroniona.html'),
  createHTMLCategory('laminowanie', '🔒 Laminowanie', 'laminowanie.html'),
];
