import { sampleCategory } from "./sample";
import { plakatyCategory } from "./plakaty";
import { voucheryCategory } from "./vouchery";
import { createHTMLCategory } from "./loader";

export const categories = [
  // Istniejące kategorie JavaScript
  sampleCategory,
  plakatyCategory,
  voucheryCategory,
  
  // Nowe kategorie z plików HTML
  createHTMLCategory('druk-a4-a3', '📄 Druk A4/A3 + skan', 'druk-a4-a3-skan.html'),
  createHTMLCategory('druk-a4-a3-plain', '📄 Druk A4/A3', 'druk-a4-a3.html'),
  createHTMLCategory('cad-ops', '🗺️ CAD OPS', 'cad-ops.html'),
  createHTMLCategory('druk-cad', '🗺️ Druk CAD', 'druk-cad.html'),
  createHTMLCategory('dyplomy', '🎓 Dyplomy', 'dyplomy.html'),
  createHTMLCategory('folia-szroniona', '✨ Folia Szroniona', 'folia-szroniona.html'),
  createHTMLCategory('laminowanie', '🔒 Laminowanie', 'laminowanie.html'),
  createHTMLCategory('roll-up', '📜 Roll-up', 'roll-up.html'),
  createHTMLCategory('ulotki-dwustronne', '📋 Ulotki dwustronne', 'ulotki-cyfrowe-dwustronne.html'),
  createHTMLCategory('ulotki-jednostronne', '📋 Ulotki jednostronne', 'ulotki-cyfrowe-jednostronne.html'),
  createHTMLCategory('wizytowki', '💼 Wizytówki', 'wizytowki-druk-cyfrowy.html'),
  createHTMLCategory('wlepki-naklejki', '🏷️ Wlepki/Naklejki', 'wlepki-naklejki.html'),
  createHTMLCategory('zaproszenia-kreda', '💌 Zaproszenia KREDA', 'zaproszenia-kreda.html'),
];
