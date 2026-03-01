/**
 * Centralny system zarządzania cenami RAZDWA
 * - Wczytuje ceny z config/prices.json
 * - Obsługuje user overrides w localStorage
 * - Emituje event na zmianę
 * - Dostępne dla wszystkich kalkulatorów
 */

class PriceManager {
  constructor() {
    this.prices = {};
    this.userOverrides = JSON.parse(localStorage.getItem('razdwa-price-overrides') || '{}');
    this.listeners = [];
  }

  async init() {
    try {
      // GitHub Pages path includes repo name: /RAZDWA/config/prices.json
      const response = await fetch('/RAZDWA/config/prices.json');
      this.prices = await response.json();
      console.log('✅ Prices loaded from config/prices.json', this.prices);
    } catch (err) {
      console.error('❌ Failed to load prices:', err);
      this.prices = {};
    }
  }

  /**
   * Pobierz cenę z możliwością user override'u
   * @param {string} path - ścieżka do ceny: "drukA4A3.print.bw.A4[0].unit"
   * @returns {number} cena
   */
  getPrice(path) {
    // Najpierw spróbuj user override
    if (path in this.userOverrides) {
      return this.userOverrides[path];
    }

    // Otherwise get from config
    const parts = path.split('.');
    let value = this.prices;
    for (const part of parts) {
      if (part.includes('[')) {
        // Handle array notation: "A4[0]" -> value['A4'][0]
        const [key, idx] = part.match(/(.+)\[(\d+)\]/).slice(1);
        value = value[key]?.[parseInt(idx)];
      } else {
        value = value?.[part];
      }
      if (value === undefined) return null;
    }
    return value;
  }

  /**
   * Ustaw cenę (user override)
   * @param {string} path - ścieżka do ceny
   * @param {number} price - nowa cena
   */
  setPrice(path, price) {
    this.userOverrides[path] = parseFloat(price);
    localStorage.setItem('razdwa-price-overrides', JSON.stringify(this.userOverrides));
    console.log(`💰 Price updated: ${path} = ${price}`);
    this.emit('priceChange', { path, price });
  }

  /**
   * Resetuj user overrides dla danej ścieżki lub wszystkiego
   * @param {string} path - optional path to reset specific price
   */
  resetPrices(path = null) {
    if (path) {
      delete this.userOverrides[path];
    } else {
      this.userOverrides = {};
    }
    localStorage.setItem('razdwa-price-overrides', JSON.stringify(this.userOverrides));
    console.log(`🔄 Prices reset: ${path || 'all'}`);
    this.emit('pricesReset', { path });
  }

  /**
   * Nasłuchuj zmiany cen
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  emit(event, data) {
    this.listeners.forEach(cb => cb(event, data));
    // Także emituj globalny event
    window.dispatchEvent(new CustomEvent('razdwa:priceChange', { detail: { event, data } }));
  }

  /**
   * Pobierz aktualny stan (ceny + overrides)
   */
  getState() {
    return {
      prices: this.prices,
      overrides: this.userOverrides
    };
  }
}

// Singleton instance
const priceManager = new PriceManager();
window.priceManager = priceManager;

export default priceManager;
