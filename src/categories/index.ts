import { sampleCategory } from "./sample";
import { plakatyCategory } from "./plakaty";
import { voucheryCategory } from "./vouchery";
import { dyplomyCategory } from "./dyplomy";
import { WizytowkiView as wizytowyCategory } from "../ui/views/wizytowki-druk-cyfrowy";
import { ZaproszeniaKredaView as zaproszeniaKredaCategory } from "../ui/views/zaproszenia-kreda";
import { UlotkiDwustronneView as ulotkiDwustronneCategory } from "../ui/views/ulotki-cyfrowe-dwustronne";
import { UlotkiJednostronneView as ulotkiJednostronneCategory } from "../ui/views/ulotki-cyfrowe-jednostronne";
import { BannerView as banneryCategory } from "../ui/views/banner";
import { WlepkiView as wlepkiCategory } from "../ui/views/wlepki-naklejki";
import { RollUpView as rollupCategory } from "../ui/views/roll-up";
import { createHTMLCategory } from "./loader";
import { drukCADCategory } from "./druk-cad";
import { drukA4A3Category } from "./druk-a4-a3-skan";

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
  
  // Nowe kategorie z pełną logiką
  drukCADCategory,
  drukA4A3Category,

  // Pozostałe kategorie HTML
  createHTMLCategory('cad-ops', '🗺️ CAD OPS', 'cad-ops.html'),
  createHTMLCategory('folia-szroniona', '✨ Folia Szroniona', 'folia-szroniona.html'),
  createHTMLCategory('laminowanie', '🔒 Laminowanie', 'laminowanie.html'),
];
