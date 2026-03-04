# Migration TODO: priceManager Integration

## Cel
Migracja wszystkich kategorii kalkulatorów z hardcoded cen do centralizowanego `priceManager` systemu.

## ✅ Zrobione (2/16 kategorii)

### 1. **CAD Upload** ✅
- ✅ Zastąpiono `CAD_CENNIK` na `priceManager.getPrice('drukCAD.price.{color,bw}.*')`
- ✅ Zastąpiono `SCAN_PER_CM` na `priceManager.getPrice('drukCAD.wfScanPerCm')`
- ✅ Zastąpiono `SKLAD_CENY` na `priceManager.getPrice('drukCAD.fold.*')`
- ✅ Dodano event listener `razdwa:pricesUpdated`
- ✅ Export globalny: `window.recalculateAllCAD`
- **Commit**: 68c9ccf

### 2. **Druk A4/A3 + Skan** ✅
- ✅ Zastąpiono `drukA4A3[mode][format]` na `priceManager.getPrice('drukA4A3.print.{bw,color}.{A4,A3}')`
- ✅ Zastąpiono `drukA4A3.skanAuto/skanReczne` na `priceManager.getPrice('drukA4A3.scan.{auto,manual}')`
- ✅ Dostosowano do nowej struktury `from/to/unit` (tier-based pricing)
- ✅ Dodano event listener `razdwa:pricesUpdated`
- ✅ Export globalny: `window.recalculateDrukA4A3`
- **Commit**: 68c9ccf

---

## 🔄 Do migracji (14 kategorii)

### 3. **Banner** (banner.js)
- Struktura w prices.json: `banner.{lux,standard}.pricePerM2[tiers]`
- Hardcoded: prawdopodobnie stałe ceny/m2
- Priorytet: **ŚREDNI**

### 4. **Druk CAD** (druk-cad.js)
- Struktura w prices.json: `drukCAD.price.{color,bw}.*`
- Uwaga: może być duplikat CAD Upload
- Priorytet: **NISKI** (sprawdzić czy nie jest deprecate)

### 5. **Dyplomy** (dyplomy.js)
- Struktura w prices.json: `dyplomy.tiers[from,to,price]`
- Hardcoded: tablica progów cenowych
- Priorytet: **ŚREDNI**

### 6. **Folia szroniona** (folia-szroniona.js)
- Struktura w prices.json: `foliaSzroniona.pricePerM2[tiers]`
- Hardcoded: cena za m2
- Priorytet: **ŚREDNI**

### 7. **Laminowanie** (laminowanie.js)
- Struktura w prices.json: `laminowanie.{gloss,matte}.{A4,A3}[tiers]`
- Hardcoded: tablica progów cenowych
- Priorytet: **WYSOKI** (popularna kategoria)

### 8. **Plakaty** (plakaty.js)
- Struktura w prices.json: `plakaty.{standard,premium}.{A4,A3,A2,A1,A0}[tiers]`
- Hardcoded: ceny per format i typ papieru
- Priorytet: **WYSOKI** (popularna kategoria)

### 9. **Roll-up** (roll-up.js)
- Struktura w prices.json: `rollUp.priceTable[sizes]`
- Hardcoded: ceny per size (85x200, 100x200, 120x200)
- Priorytet: **ŚREDNI**

### 10. **Solwent plakaty** (solwent-plakaty.js)
- Struktura w prices.json: `solwentPlakaty.{200g,300g}.pricePerM2`
- Hardcoded: cena za m2 per gramatura
- Priorytet: **ŚREDNI**

### 11. **Ulotki cyfrowe** (ulotki-cyfrowe.js)
- Struktura w prices.json: `ulotkiCyfrowe.{jednostronne,dwustronne}.tiers[from,to,price]`
- Hardcoded: tablica progów cenowych
- Priorytet: **WYSOKI** (popularna kategoria)

### 12. **Upload kalkulator** (upload-kalkulator.js)
- Uwaga: może być wrapper/helper dla innych kategorii
- Priorytet: **NISKI** (sprawdzić funkcjonalność)

### 13. **Vouchery** (vouchery.js)
- Struktura w prices.json: `vouchery.tiers[from,to,price]`
- Hardcoded: tablica progów cenowych
- Priorytet: **NISKI**

### 14. **Wizytówki druk cyfrowy** (wizytowki-druk-cyfrowy.js)
- Struktura w prices.json: `wizytowki.cyfrowe.standardPrices.85x55.{noLam,lam}`
- Hardcoded: obiekt cen per ilość i laminowanie
- Priorytet: **WYSOKI** (popularna kategoria)

### 15. **Wlepki / naklejki** (wlepki-naklejki.js)
- Struktura w prices.json: `wlepkiNaklejki.pricePerM2[tiers]`
- Hardcoded: cena za m2
- Priorytet: **ŚREDNI**

### 16. **Zaproszenia kreda** (zaproszenia-kreda.js)
- Struktura w prices.json: `zaproszeniaKreda.tiers[from,to,price]`
- Hardcoded: tablica progów cenowych
- Priorytet: **ŚREDNI**

---

## 📋 Wzór migracji (template)

```javascript
// PRZED:
import { categoryData } from '../prices.js';
const price = categoryData.somePath[0];

// PO:
import priceManager from '../price-manager.js';
const price = priceManager.getPrice('categoryData.somePath[0].unit');

// Na końcu init():
window.recalculateCategoryName = calculate;

// Event listener (poza init()):
window.addEventListener('razdwa:pricesUpdated', () => {
  if (window.recalculateCategoryName) {
    window.recalculateCategoryName();
  }
});
```

---

## 🎯 Następne kroki

1. **Priorytet 1**: Laminowanie, Plakaty, Ulotki cyfrowe, Wizytówki (wysokie użycie)
2. **Priorytet 2**: Banner, Dyplomy, Folia szroniona, Roll-up, Solwent plakaty, Wlepki, Zaproszenia
3. **Priorytet 3**: Druk CAD (sprawdzić duplikat), Upload kalkulator (helper?), Vouchery

---

## ✅ Kryteria sukcesu

- [ ] Wszystkie 16 kategorii używają `priceManager.getPrice()`
- [ ] Wszystkie kategorie mają event listener `razdwa:pricesUpdated`
- [ ] Zmiana ceny w Settings → automatyczny przelicznik we wszystkich kategoriach
- [ ] Testy: zmiana ceny A4 kolorowy → druk-a4-a3 pokazuje nową cenę
- [ ] Dokumentacja: update AGENTS.md z informacją o priceManager

---

**Ostatnia aktualizacja**: 2026-03-04
