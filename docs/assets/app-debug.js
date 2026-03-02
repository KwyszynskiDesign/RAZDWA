"use strict";
(() => {
  // src/ui/router.ts
  var Router = class {
    constructor(container, getCtx) {
      this.routes = /* @__PURE__ */ new Map();
      this.currentView = null;
      this.categories = [];
      this.container = container;
      this.getCtx = getCtx;
      window.addEventListener("hashchange", () => {
        this.handleRoute().catch(() => {
          this.renderHome();
        });
      });
    }
    setCategories(categories) {
      this.categories = categories;
    }
    addRoute(view) {
      this.routes.set(view.id, view);
    }
    async handleRoute() {
      var _a;
      const hash = window.location.hash || "#/";
      let path = hash.startsWith("#/") ? hash.slice(2) : "";
      path = path.replace(/^\/+/, "");
      if (!path) {
        this.renderHome();
        return;
      }
      if ((_a = this.currentView) == null ? void 0 : _a.unmount) {
        this.currentView.unmount();
      }
      const view = this.routes.get(path);
      if (view) {
        this.currentView = view;
        await view.mount(this.container, this.getCtx());
      } else {
        try {
          const resp = await fetch(`categories/${path}.html`);
          if (resp.ok) {
            this.currentView = null;
            this.container.innerHTML = await resp.text();
            this.container.querySelectorAll("script").forEach((oldScript) => {
              var _a2;
              const newScript = document.createElement("script");
              newScript.textContent = (_a2 = oldScript.textContent) != null ? _a2 : "";
              oldScript.replaceWith(newScript);
            });
            try {
              const jsResp = await fetch(`categories/${path}.js`);
              if (jsResp.ok) {
                const script = document.createElement("script");
                script.textContent = await jsResp.text();
                this.container.appendChild(script);
              }
            } catch {
            }
          } else {
            this.renderHome();
          }
        } catch {
          this.renderHome();
        }
      }
    }
    renderHome() {
      this.container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
        <h2 style="margin:0; font-size: 24px;">Witaj w kalkulatorze Raz Druku Dwa</h2>
        <p style="margin-top: 10px;">Wybierz kategori\u0119 z panelu powy\u017Cej, aby rozpocz\u0105\u0107 obliczenia.</p>
      </div>
    `;
    }
    start() {
      this.handleRoute();
    }
  };

  // src/core/calculateBasePrice.ts
  function findSimpleTier(tiers, qty) {
    const sorted = [...tiers].sort((a, b) => a.min - b.min);
    const tier = sorted.find((t) => qty >= t.min && (t.max === null || qty <= t.max));
    if (tier) return tier;
    const first = sorted.find((t) => t.min >= qty);
    return first != null ? first : sorted[sorted.length - 1];
  }
  function calculateBasePrice(table, qty) {
    var _a;
    const minQtyRule = ((_a = table.rules) != null ? _a : []).find((r) => r.type === "minimum" && r.unit === "m2");
    const effectiveQty = minQtyRule && qty < minQtyRule.value ? minQtyRule.value : qty;
    const tier = findSimpleTier(table.tiers, effectiveQty);
    const basePrice = table.pricing === "per_unit" ? effectiveQty * tier.price : tier.price;
    return {
      basePrice,
      effectiveQuantity: effectiveQty,
      tierPrice: tier.price
    };
  }

  // src/core/applyDiscounts.ts
  function applyDiscounts(basePrice, effectiveQuantity, activeModifiers, modifiers) {
    let modifiersTotal = 0;
    const appliedModifiers = [];
    for (const modId of activeModifiers) {
      const mod = modifiers.find((m) => m.id === modId);
      if (mod) {
        appliedModifiers.push(mod.name);
        if (mod.type === "percent") {
          modifiersTotal += basePrice * mod.value;
        } else if (mod.type === "fixed_per_unit") {
          modifiersTotal += mod.value * effectiveQuantity;
        } else {
          modifiersTotal += mod.value;
        }
      }
    }
    return { modifiersTotal, appliedModifiers };
  }

  // src/core/addTaxes.ts
  function addTaxes(price) {
    return price;
  }

  // src/core/computeShipping.ts
  function computeShipping(_price) {
    return 0;
  }

  // src/core/computeTotalPrice.ts
  function computeTotalPrice(table, qty, activeModifiers = []) {
    var _a, _b;
    const { basePrice, effectiveQuantity, tierPrice } = calculateBasePrice(table, qty);
    const { modifiersTotal, appliedModifiers } = applyDiscounts(
      basePrice,
      effectiveQuantity,
      activeModifiers,
      (_a = table.modifiers) != null ? _a : []
    );
    let totalPrice = basePrice + modifiersTotal;
    totalPrice += computeShipping(totalPrice);
    totalPrice = addTaxes(totalPrice);
    const minPLNRule = ((_b = table.rules) != null ? _b : []).find((r) => r.type === "minimum" && r.unit === "pln");
    if (minPLNRule && totalPrice < minPLNRule.value) totalPrice = minPLNRule.value;
    return {
      basePrice,
      effectiveQuantity,
      tierPrice,
      modifiersTotal,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      appliedModifiers
    };
  }

  // docs/config/prices.json
  var prices_default = {
    drukA4A3: {
      print: {
        bw: {
          A4: [
            { from: 1, to: 5, unit: 0.9 },
            { from: 6, to: 20, unit: 0.6 },
            { from: 21, to: 100, unit: 0.35 },
            { from: 101, to: 500, unit: 0.3 },
            { from: 501, to: 999, unit: 0.23 },
            { from: 1e3, to: 4999, unit: 0.19 },
            { from: 5e3, to: 99999, unit: 0.15 }
          ],
          A3: [
            { from: 1, to: 5, unit: 1.7 },
            { from: 6, to: 20, unit: 1.1 },
            { from: 21, to: 100, unit: 0.7 },
            { from: 101, to: 500, unit: 0.6 },
            { from: 501, to: 999, unit: 0.45 },
            { from: 1e3, to: 99999, unit: 0.33 }
          ]
        },
        color: {
          A4: [
            { from: 1, to: 10, unit: 2.4 },
            { from: 11, to: 40, unit: 2.2 },
            { from: 41, to: 100, unit: 2 },
            { from: 101, to: 250, unit: 1.8 },
            { from: 251, to: 500, unit: 1.6 },
            { from: 501, to: 999, unit: 1.4 },
            { from: 1e3, to: 99999, unit: 1.1 }
          ],
          A3: [
            { from: 1, to: 10, unit: 4.8 },
            { from: 11, to: 40, unit: 4.2 },
            { from: 41, to: 100, unit: 3.8 },
            { from: 101, to: 250, unit: 3 },
            { from: 251, to: 500, unit: 2.5 },
            { from: 501, to: 999, unit: 1.9 },
            { from: 1e3, to: 99999, unit: 1.6 }
          ]
        }
      },
      scan: {
        auto: [
          { from: 1, to: 9, unit: 1 },
          { from: 10, to: 49, unit: 0.5 },
          { from: 50, to: 99, unit: 0.4 },
          { from: 100, to: 999999999, unit: 0.25 }
        ],
        manual: [
          { from: 1, to: 4, unit: 2 },
          { from: 5, to: 999999999, unit: 1 }
        ]
      },
      email_price: 1
    },
    drukCAD: {
      price: {
        color: {
          formatowe: { A0p: 26, A0: 24, A1: 12, A2: 8.5, A3: 5.3 },
          mb: { A0p: 21, A0: 20, A1: 14.5, A2: 13.9, A3: 12, R1067: 30 }
        },
        bw: {
          formatowe: { A0p: 12.5, A0: 11, A1: 6, A2: 4, A3: 2.5 },
          mb: { A0p: 10, A0: 9, A1: 5, A2: 4.5, A3: 3.5, R1067: 12.5 }
        }
      },
      base: {
        A0p: { w: 914, l: 1292, label: "A0+" },
        A0: { w: 841, l: 1189, label: "A0" },
        A1: { w: 594, l: 841, label: "A1" },
        A2: { w: 420, l: 594, label: "A2" },
        A3: { w: 297, l: 420, label: "A3" },
        R1067: { w: 1067, l: 0, label: "Roll 1067" }
      },
      fold: {
        A0p: 4,
        A0: 3,
        A1: 2,
        A2: 1.5,
        A3: 1,
        A3L: 0.7
      },
      wfScanPerCm: 0.08,
      tolerance: 0.5
    },
    wizytowki: {
      cyfrowe: {
        standardPrices: {
          "85x55": {
            noLam: {
              "50": 65,
              "100": 75,
              "150": 85,
              "200": 96,
              "250": 110,
              "300": 126,
              "400": 146,
              "500": 170,
              "1000": 290
            },
            lam: {
              "50": 160,
              "100": 170,
              "150": 180,
              "200": 190,
              "250": 200,
              "300": 220,
              "400": 240,
              "500": 250,
              "1000": 335
            }
          },
          "90x50": {
            noLam: {
              "50": 70,
              "100": 79,
              "150": 89,
              "200": 99,
              "250": 120,
              "300": 129,
              "400": 149,
              "500": 175,
              "1000": 300
            },
            lam: {
              "50": 170,
              "100": 180,
              "150": 190,
              "200": 200,
              "250": 210,
              "300": 230,
              "400": 250,
              "500": 260,
              "1000": 345
            }
          }
        },
        softtouchPrices: {
          "85x55": {
            noLam: {
              "50": 65,
              "100": 75,
              "150": 85,
              "200": 96,
              "250": 110,
              "300": 126,
              "400": 145,
              "500": 170,
              "1000": 290
            },
            lam: {
              "50": 170,
              "100": 190,
              "150": 210,
              "200": 220,
              "250": 230,
              "300": 240,
              "400": 260,
              "500": 270,
              "1000": 380
            }
          },
          "90x50": {
            noLam: {
              "50": 70,
              "100": 79,
              "150": 89,
              "200": 99,
              "250": 120,
              "300": 129,
              "400": 149,
              "500": 175,
              "1000": 300
            },
            lam: {
              "50": 170,
              "100": 190,
              "150": 210,
              "200": 220,
              "250": 230,
              "300": 240,
              "400": 260,
              "500": 270,
              "1000": 390
            }
          }
        },
        deluxe: {
          leadTime: "4\u20135 dni roboczych",
          options: {
            uv3d_softtouch: {
              label: "Maker UV 3D + folia SOFTTOUCH",
              prices: { "50": 280, "100": 320, "200": 395, "250": 479, "400": 655, "500": 778 }
            },
            uv3d_gold_softtouch: {
              label: "Maker UV 3D + z\u0142ocenie + folia SOFTTOUCH",
              prices: { "50": 450, "100": 550, "200": 650, "250": 720, "400": 850, "500": 905 }
            }
          }
        }
      }
    },
    banner: {
      id: "banner",
      title: "Bannery",
      unit: "m2",
      pricing: "per_unit",
      materials: [
        {
          id: "powlekany",
          name: "Banner powlekany",
          tiers: [
            { min: 1, max: 25, price: 53 },
            { min: 26, max: 50, price: 49 },
            { min: 51, max: null, price: 45 }
          ]
        },
        {
          id: "blockout",
          name: "Banner Blockout",
          tiers: [
            { min: 1, max: 25, price: 64 },
            { min: 26, max: 50, price: 59 },
            { min: 51, max: null, price: 55 }
          ]
        }
      ],
      modifiers: [
        { id: "oczkowanie", name: "Oczkowanie (+2.50 z\u0142/m2)", type: "fixed_per_unit", value: 2.5 },
        { id: "express", name: "TRYB EXPRESS (+20%)", type: "percent", value: 0.2 }
      ]
    },
    laminowanie: {
      formats: {
        A3: [
          { min: 1, max: 50, price: 7 },
          { min: 51, max: 100, price: 6 },
          { min: 101, max: 200, price: 5 }
        ],
        A4: [
          { min: 1, max: 50, price: 5 },
          { min: 51, max: 100, price: 4.5 },
          { min: 101, max: 200, price: 4 }
        ],
        A5: [
          { min: 1, max: 50, price: 4 },
          { min: 51, max: 100, price: 3.5 },
          { min: 101, max: 200, price: 3 }
        ],
        A6: [
          { min: 1, max: 50, price: 3 },
          { min: 51, max: 100, price: 2.5 },
          { min: 101, max: 200, price: 2 }
        ]
      }
    },
    vouchery: [
      { qty: 1, single: 20, double: 25 },
      { qty: 2, single: 29, double: 32 },
      { qty: 3, single: 30, double: 37 },
      { qty: 4, single: 32, double: 39 },
      { qty: 5, single: 35, double: 43 },
      { qty: 6, single: 39, double: 45 },
      { qty: 7, single: 41, double: 48 },
      { qty: 8, single: 45, double: 50 },
      { qty: 9, single: 48, double: 52 },
      { qty: 10, single: 52, double: 58 },
      { qty: 15, single: 60, double: 70 },
      { qty: 20, single: 67, double: 82 },
      { qty: 25, single: 74, double: 100 },
      { qty: 30, single: 84, double: 120 }
    ],
    rollUp: {
      name: "Roll-up Jednostronny",
      formats: {
        "85x200": {
          width: 0.85,
          height: 2,
          tiers: [
            { min: 1, max: 5, price: 290 },
            { min: 6, max: 10, price: 275 }
          ]
        },
        "100x200": {
          width: 1,
          height: 2,
          tiers: [
            { min: 1, max: 5, price: 305 },
            { min: 6, max: 10, price: 285 }
          ]
        },
        "120x200": {
          width: 1.2,
          height: 2,
          tiers: [
            { min: 1, max: 5, price: 330 },
            { min: 6, max: 10, price: 310 }
          ]
        },
        "150x200": {
          width: 1.5,
          height: 2,
          tiers: [
            { min: 1, max: 5, price: 440 },
            { min: 6, max: 10, price: 425 }
          ]
        }
      },
      replacement: {
        labor: 50,
        print_per_m2: 80
      }
    },
    foliaSzroniona: {
      id: "folia-szroniona",
      title: "Folia szroniona",
      unit: "m2",
      pricing: "per_unit",
      rules: [
        { type: "minimum", unit: "m2", value: 1 }
      ],
      materials: [
        {
          id: "material-only",
          storageId: "wydruk",
          name: "Tylko wydruk",
          tiers: [
            { min: 1, max: 5, price: 65 },
            { min: 6, max: 25, price: 60 },
            { min: 26, max: 50, price: 56 },
            { min: 51, max: null, price: 51 }
          ]
        },
        {
          id: "full-service",
          storageId: "oklejanie",
          name: "Wydruk z oklejaniem",
          tiers: [
            { min: 1, max: 5, price: 140 },
            { min: 6, max: 10, price: 130 },
            { min: 11, max: 20, price: 120 },
            { min: 21, max: null, price: 0 }
          ]
        }
      ],
      modifiers: [
        { id: "express", name: "EXPRESS (+20%)", type: "percent", value: 0.2 }
      ]
    },
    wlepkiNaklejki: {
      category: "Wlepki / Naklejki",
      groups: [
        {
          id: "wlepki_obrys_folia",
          title: "Wlepki po obrysie (Folia Bia\u0142a/Trans)",
          unit: "m2",
          pricing: "per_unit",
          tiers: [
            { min: 1, max: 5, price: 67 },
            { min: 6, max: 25, price: 60 },
            { min: 26, max: 50, price: 52 },
            { min: 51, max: null, price: 48 }
          ],
          rules: [
            { type: "minimum", unit: "m2", value: 1 }
          ]
        },
        {
          id: "wlepki_polipropylen",
          title: "Wlepki po obrysie - Polipropylen",
          unit: "m2",
          pricing: "per_unit",
          tiers: [
            { min: 1, max: 10, price: 50 },
            { min: 11, max: null, price: 42 }
          ],
          rules: [
            { type: "minimum", unit: "m2", value: 1 }
          ]
        },
        {
          id: "wlepki_standard_folia",
          title: "Folia Bia\u0142a / Transparentna (standard)",
          unit: "m2",
          pricing: "per_unit",
          tiers: [
            { min: 1, max: 5, price: 54 },
            { min: 6, max: 25, price: 50 },
            { min: 26, max: 50, price: 46 },
            { min: 51, max: null, price: 42 }
          ],
          rules: [
            { type: "minimum", unit: "m2", value: 1 }
          ]
        }
      ],
      modifiers: [
        { id: "mocny_klej", name: "Mocny klej", type: "percent", value: 0.12 },
        { id: "arkusze", name: "Ci\u0119te na arkusze", type: "fixed_per_unit", value: 2 },
        { id: "pojedyncze", name: "Ci\u0119te na pojedyncze sztuki", type: "fixed_per_unit", value: 10 },
        { id: "express", name: "EXPRESS", type: "percent", value: 0.2 }
      ]
    },
    zaproszeniaKreda: {
      name: "Zaproszenia KREDA - druk cyfrowy",
      modifiers: {
        satin: 0.12,
        express: 0.2
      },
      formats: {
        A6: {
          name: "A6 (105x148mm)",
          single: {
            normal: { "10": 30, "24": 40, "32": 45, "50": 50, "75": 60, "100": 68, "150": 79 },
            folded: { "10": 45, "24": 55, "32": 60, "50": 71, "75": 84, "100": 99, "150": 126 }
          },
          double: {
            normal: { "10": 35, "24": 46, "32": 57, "50": 66, "75": 79, "100": 89, "150": 115 },
            folded: { "10": 58, "24": 66, "32": 84, "50": 105, "75": 125, "100": 149, "150": 199 }
          }
        },
        A5: {
          name: "A5 (148x210mm)",
          single: {
            normal: { "10": 34, "24": 42, "32": 48, "50": 55, "75": 63, "100": 79, "150": 110 },
            folded: { "10": 55, "24": 60, "32": 75, "50": 95, "75": 125, "100": 150, "150": 199 }
          },
          double: {
            normal: { "10": 40, "24": 49, "32": 62, "50": 79, "75": 96, "100": 119, "150": 169 },
            folded: { "10": 65, "24": 80, "32": 115, "50": 149, "75": 190, "100": 235, "150": 325 }
          }
        },
        DL: {
          name: "DL (99x210mm)",
          single: {
            normal: { "10": 35, "24": 50, "32": 53, "50": 59, "75": 70, "100": 81, "150": 105 },
            folded: { "10": 45, "24": 55, "32": 63, "50": 79, "75": 97, "100": 115, "150": 149 }
          },
          double: {
            normal: { "10": 41, "24": 55, "32": 64, "50": 74, "75": 88, "100": 105, "150": 135 },
            folded: { "10": 65, "24": 80, "32": 90, "50": 115, "75": 150, "100": 185, "150": 245 }
          }
        }
      }
    },
    ulotkiJednostronne: {
      name: "Ulotki \u2013 cyfrowe jednostronne",
      formats: {
        A6: {
          name: "A6 (105x148)",
          tiers: [
            { min: 10, max: 10, price: 30 },
            { min: 20, max: 20, price: 35 },
            { min: 30, max: 30, price: 40 },
            { min: 40, max: 40, price: 45 },
            { min: 50, max: 50, price: 55 },
            { min: 60, max: 60, price: 61 },
            { min: 70, max: 70, price: 65 },
            { min: 80, max: 80, price: 70 },
            { min: 90, max: 90, price: 75 },
            { min: 100, max: 100, price: 79 },
            { min: 150, max: 150, price: 90 },
            { min: 200, max: 200, price: 110 },
            { min: 300, max: 300, price: 145 },
            { min: 400, max: 400, price: 160 },
            { min: 500, max: 500, price: 190 },
            { min: 700, max: 700, price: 255 },
            { min: 1e3, max: 1e3, price: 320 }
          ]
        },
        A5: {
          name: "A5 (148 x 210)",
          tiers: [
            { min: 10, max: 10, price: 35 },
            { min: 20, max: 20, price: 42 },
            { min: 30, max: 30, price: 50 },
            { min: 40, max: 40, price: 59 },
            { min: 50, max: 50, price: 69 },
            { min: 60, max: 60, price: 75 },
            { min: 70, max: 70, price: 82 },
            { min: 80, max: 80, price: 88 },
            { min: 90, max: 90, price: 93 },
            { min: 100, max: 100, price: 95 },
            { min: 150, max: 150, price: 130 },
            { min: 200, max: 200, price: 150 },
            { min: 300, max: 300, price: 210 },
            { min: 400, max: 400, price: 259 },
            { min: 500, max: 500, price: 300 },
            { min: 700, max: 700, price: 410 },
            { min: 1e3, max: 1e3, price: 530 }
          ]
        },
        DL: {
          name: "DL (99 x 210)",
          tiers: [
            { min: 10, max: 10, price: 30 },
            { min: 20, max: 20, price: 35 },
            { min: 30, max: 30, price: 40 },
            { min: 40, max: 40, price: 45 },
            { min: 50, max: 50, price: 55 },
            { min: 60, max: 60, price: 60 },
            { min: 70, max: 70, price: 65 },
            { min: 80, max: 80, price: 70 },
            { min: 90, max: 90, price: 75 },
            { min: 100, max: 100, price: 83 },
            { min: 150, max: 150, price: 100 },
            { min: 200, max: 200, price: 120 },
            { min: 300, max: 300, price: 160 },
            { min: 400, max: 400, price: 199 },
            { min: 500, max: 500, price: 230 },
            { min: 700, max: 700, price: 310 },
            { min: 1e3, max: 1e3, price: 399 }
          ]
        }
      }
    },
    ulotkiDwustronne: {
      name: "Ulotki - Cyfrowe Dwustronne",
      formats: {
        A6: {
          name: "A6 (105x148)",
          tiers: [
            { min: 10, max: 10, price: 40 },
            { min: 20, max: 20, price: 47 },
            { min: 30, max: 30, price: 49 },
            { min: 40, max: 40, price: 55 },
            { min: 50, max: 50, price: 60 },
            { min: 60, max: 60, price: 65 },
            { min: 70, max: 70, price: 70 },
            { min: 80, max: 80, price: 75 },
            { min: 90, max: 90, price: 90 },
            { min: 100, max: 100, price: 95 },
            { min: 150, max: 150, price: 120 },
            { min: 200, max: 200, price: 140 },
            { min: 300, max: 300, price: 190 },
            { min: 400, max: 400, price: 230 },
            { min: 500, max: 500, price: 270 },
            { min: 700, max: 700, price: 355 },
            { min: 1e3, max: 1e3, price: 476 }
          ]
        },
        A5: {
          name: "A5 (148 x 210)",
          tiers: [
            { min: 10, max: 10, price: 45 },
            { min: 20, max: 20, price: 55 },
            { min: 30, max: 30, price: 60 },
            { min: 40, max: 40, price: 72 },
            { min: 50, max: 50, price: 90 },
            { min: 60, max: 60, price: 99 },
            { min: 70, max: 70, price: 112 },
            { min: 80, max: 80, price: 122 },
            { min: 90, max: 90, price: 130 },
            { min: 100, max: 100, price: 140 },
            { min: 150, max: 150, price: 180 },
            { min: 200, max: 200, price: 220 },
            { min: 300, max: 300, price: 310 },
            { min: 400, max: 400, price: 390 },
            { min: 500, max: 500, price: 460 },
            { min: 700, max: 700, price: 620 },
            { min: 1e3, max: 1e3, price: 790 }
          ]
        },
        DL: {
          name: "DL (99 x 210)",
          tiers: [
            { min: 10, max: 10, price: 40 },
            { min: 20, max: 20, price: 50 },
            { min: 30, max: 30, price: 55 },
            { min: 40, max: 40, price: 65 },
            { min: 50, max: 50, price: 70 },
            { min: 60, max: 60, price: 78 },
            { min: 70, max: 70, price: 88 },
            { min: 80, max: 80, price: 99 },
            { min: 90, max: 90, price: 109 },
            { min: 100, max: 100, price: 119 },
            { min: 150, max: 150, price: 150 },
            { min: 200, max: 200, price: 179 },
            { min: 300, max: 300, price: 235 },
            { min: 400, max: 400, price: 290 },
            { min: 500, max: 500, price: 350 },
            { min: 700, max: 700, price: 460 },
            { min: 1e3, max: 1e3, price: 590 }
          ]
        }
      }
    },
    solwentPlakaty: {
      id: "solwent-plakaty",
      title: "SOLWENT - PLAKATY",
      unit: "m2",
      pricing: "per_unit",
      rules: [
        { type: "minimum", unit: "m2", value: 1 }
      ],
      modifiers: [
        { id: "express", name: "EXPRESS", type: "percent", value: 0.2 }
      ],
      materials: [
        {
          id: "150g",
          name: "Papier 150g p\xF3\u0142mat",
          tiers: [
            { min: 1, max: 3, price: 65 },
            { min: 4, max: 9, price: 60 },
            { min: 10, max: 20, price: 55 },
            { min: 21, max: 40, price: 50 },
            { min: 41, max: null, price: 42 }
          ]
        },
        {
          id: "200g",
          name: "Papier 200g po\u0142ysk",
          tiers: [
            { min: 1, max: 3, price: 70 },
            { min: 4, max: 9, price: 65 },
            { min: 10, max: 20, price: 59 },
            { min: 21, max: 40, price: 53 },
            { min: 41, max: null, price: 45 }
          ]
        },
        {
          id: "115g",
          name: "Papier 115g matowy",
          tiers: [
            { min: 1, max: 3, price: 45 },
            { min: 4, max: 19, price: 40 },
            { min: 20, max: null, price: 35 }
          ]
        }
      ]
    },
    plakaty: {
      id: "plakaty",
      title: "Plakaty",
      solwent: {
        unit: "m2",
        minimumM2: 1,
        materials: [
          {
            id: "200g-polysk",
            name: "200g Po\u0142ysk (solwent)",
            tiers: [
              { min: 1, max: 3, price: 70 },
              { min: 4, max: 9, price: 65 },
              { min: 10, max: 20, price: 59 },
              { min: 21, max: 40, price: 53 },
              { min: 41, max: null, price: 45 }
            ]
          },
          {
            id: "blockout200g",
            name: "Blockout 200g Satyna (solwent)",
            tiers: [
              { min: 1, max: 3, price: 80 },
              { min: 4, max: 9, price: 75 },
              { min: 10, max: 20, price: 70 },
              { min: 21, max: 40, price: 65 },
              { min: 41, max: null, price: 60 }
            ]
          },
          {
            id: "150g-polmat",
            name: "150g P\xF3\u0142mat (solwent)",
            tiers: [
              { min: 1, max: 3, price: 65 },
              { min: 4, max: 9, price: 60 },
              { min: 10, max: 20, price: 55 },
              { min: 21, max: 40, price: 50 },
              { min: 41, max: null, price: 42 }
            ]
          },
          {
            id: "115g-mat",
            name: "115g Matowy (solwent)",
            tiers: [
              { min: 1, max: 3, price: 45 },
              { min: 4, max: 19, price: 40 },
              { min: 20, max: null, price: 35 }
            ]
          }
        ]
      },
      formatowe: {
        unit: "szt",
        formats: ["297x420", "420x594", "594x841", "841x1189", "914x1189", "914x1292", "rolka1067"],
        materials: [
          {
            id: "120g-formatowe",
            name: "120g Formatowe",
            discountGroup: "120g",
            prices: {
              "297x420": 9,
              "420x594": 12,
              "594x841": 18,
              "841x1189": 28,
              "914x1189": 34,
              "914x1292": 50,
              rolka1067: 68
            }
          },
          {
            id: "120g-nieformatowe",
            name: "120g Nieformatowe",
            discountGroup: "120g",
            prices: {
              "297x420": 28,
              "420x594": 30,
              "594x841": 33,
              "841x1189": 35,
              "914x1292": 50,
              rolka1067: 63
            }
          },
          {
            id: "260g-satyna-formatowe",
            name: "260g Satyna Formatowe (fotoplakaty)",
            discountGroup: "260g",
            prices: {
              "297x420": 23,
              "420x594": 39,
              "594x841": 50,
              "841x1189": 80,
              "914x1292": 88
            }
          },
          {
            id: "260g-satyna-nieformatowe",
            name: "260g Satyna Nieformatowe (fotoplakaty)",
            discountGroup: "260g",
            prices: {
              "297x420": 27,
              "420x594": 36,
              "594x841": 39.5,
              "841x1189": 66.7,
              "914x1292": 75.3
            }
          },
          {
            id: "180g-pp-formatowe",
            name: "180g PP Formatowe",
            discountGroup: "120g",
            prices: {
              "297x420": 18,
              "420x594": 37,
              "610x841": 45,
              "841x1189": 70,
              "914x1292": 74
            }
          },
          {
            id: "180g-pp-nieformatowe",
            name: "180g PP Nieformatowe",
            discountGroup: "120g",
            prices: {
              "297x420": 23,
              "420x594": 31,
              "610x841": 34,
              "841x1189": 62,
              "914x1292": 70.5
            }
          }
        ],
        discounts: {
          "120g": [
            { min: 2, max: 5, factor: 0.95 },
            { min: 6, max: 20, factor: 0.92 },
            { min: 21, max: 30, factor: 0.87 }
          ],
          "260g": [
            { min: 9, max: 20, factor: 0.93 },
            { min: 21, max: 30, factor: 0.88 }
          ]
        }
      },
      modifiers: [
        { id: "express", name: "TRYB EXPRESS (+20%)", type: "percent", value: 0.2 }
      ],
      legacy200g: {
        id: "solwent-plakaty-200g",
        title: "SOLWENT - PLAKATY (Papier 200g po\u0142ysk)",
        unit: "m2",
        pricing: "per_unit",
        tiers: [
          { min: 0, max: 3, price: 70 },
          { min: 3, max: 9, price: 65 },
          { min: 9, max: 20, price: 59 },
          { min: 20, max: 40, price: 53 },
          { min: 40, max: null, price: 45 }
        ],
        rules: [
          { type: "minimum", unit: "m2", value: 1 }
        ],
        modifiers: [
          { id: "EXPRESS", type: "percent", value: 0.2 }
        ]
      }
    },
    dyplomy: [
      { qty: 1, price: 20 },
      { qty: 2, price: 30 },
      { qty: 3, price: 32 },
      { qty: 4, price: 34 },
      { qty: 5, price: 35 },
      { qty: 6, price: 35 },
      { qty: 7, price: 36 },
      { qty: 8, price: 37 },
      { qty: 9, price: 39 },
      { qty: 10, price: 40 },
      { qty: 15, price: 45 },
      { qty: 20, price: 49 },
      { qty: 30, price: 58 },
      { qty: 40, price: 65 },
      { qty: 50, price: 75 },
      { qty: 100, price: 120 }
    ],
    defaultPrices: {
      "druk-bw-a4-1-5": 0.9,
      "druk-bw-a4-6-20": 0.6,
      "druk-bw-a4-21-100": 0.35,
      "druk-bw-a4-101-500": 0.3,
      "druk-bw-a4-501-999": 0.23,
      "druk-bw-a4-1000-4999": 0.19,
      "druk-bw-a4-5000+": 0.15,
      "druk-bw-a3-1-5": 1.7,
      "druk-bw-a3-6-20": 1.1,
      "druk-bw-a3-21-100": 0.7,
      "druk-bw-a3-101-500": 0.6,
      "druk-bw-a3-501-999": 0.45,
      "druk-bw-a3-1000-4999": 0.33,
      "druk-bw-a3-5000+": 0.3,
      "druk-kolor-a4-1-10": 2.4,
      "druk-kolor-a4-11-40": 2.2,
      "druk-kolor-a4-41-100": 2,
      "druk-kolor-a4-101-250": 1.8,
      "druk-kolor-a4-251-500": 1.6,
      "druk-kolor-a4-501-999": 1.4,
      "druk-kolor-a4-1000+": 1.1,
      "druk-kolor-a3-1-10": 4.8,
      "druk-kolor-a3-11-40": 4.2,
      "druk-kolor-a3-41-100": 3.8,
      "druk-kolor-a3-101-250": 3,
      "druk-kolor-a3-251-500": 2.5,
      "druk-kolor-a3-501-999": 1.9,
      "druk-kolor-a3-1000+": 1.6,
      "skan-auto-1-9": 1,
      "skan-auto-10-49": 0.5,
      "skan-auto-50-99": 0.4,
      "skan-auto-100+": 0.25,
      "skan-reczne-1-4": 2,
      "skan-reczne-5+": 1,
      "druk-email": 1,
      "modifier-druk-zadruk25": 0.5,
      "druk-cad-kolor-fmt-a3": 5.3,
      "druk-cad-kolor-fmt-a2": 8.5,
      "druk-cad-kolor-fmt-a1": 12,
      "druk-cad-kolor-fmt-a0": 24,
      "druk-cad-kolor-fmt-a0plus": 26,
      "druk-cad-kolor-mb-a3": 12,
      "druk-cad-kolor-mb-a2": 13.9,
      "druk-cad-kolor-mb-a1": 14.5,
      "druk-cad-kolor-mb-a0": 20,
      "druk-cad-kolor-mb-a0plus": 21,
      "druk-cad-kolor-mb-mb1067": 30,
      "druk-cad-bw-fmt-a3": 2.5,
      "druk-cad-bw-fmt-a2": 4,
      "druk-cad-bw-fmt-a1": 6,
      "druk-cad-bw-fmt-a0": 11,
      "druk-cad-bw-fmt-a0plus": 12.5,
      "druk-cad-bw-mb-a3": 3.5,
      "druk-cad-bw-mb-a2": 4.5,
      "druk-cad-bw-mb-a1": 5,
      "druk-cad-bw-mb-a0": 9,
      "druk-cad-bw-mb-a0plus": 10,
      "druk-cad-bw-mb-mb1067": 12.5,
      "laminowanie-a3-1-50": 7,
      "laminowanie-a3-51-100": 6,
      "laminowanie-a3-101-200": 5,
      "laminowanie-a4-1-50": 5,
      "laminowanie-a4-51-100": 4.5,
      "laminowanie-a4-101-200": 4,
      "laminowanie-a5-1-50": 4,
      "laminowanie-a5-51-100": 3.5,
      "laminowanie-a5-101-200": 3,
      "laminowanie-a6-1-50": 3,
      "laminowanie-a6-51-100": 2.5,
      "laminowanie-a6-101-200": 2,
      "solwent-150g-1-3": 65,
      "solwent-150g-4-9": 60,
      "solwent-150g-10-20": 55,
      "solwent-150g-21-40": 50,
      "solwent-150g-41+": 42,
      "solwent-200g-1-3": 70,
      "solwent-200g-4-9": 65,
      "solwent-200g-10-20": 59,
      "solwent-200g-21-40": 53,
      "solwent-200g-41+": 45,
      "solwent-115g-1-3": 45,
      "solwent-115g-4-19": 40,
      "solwent-115g-20+": 35,
      "vouchery-1-jed": 20,
      "vouchery-2-jed": 29,
      "vouchery-3-jed": 30,
      "vouchery-4-jed": 32,
      "vouchery-5-jed": 35,
      "vouchery-6-jed": 39,
      "vouchery-7-jed": 41,
      "vouchery-8-jed": 45,
      "vouchery-9-jed": 48,
      "vouchery-10-jed": 52,
      "vouchery-15-jed": 60,
      "vouchery-20-jed": 67,
      "vouchery-25-jed": 74,
      "vouchery-30-jed": 84,
      "vouchery-1-dwu": 25,
      "vouchery-2-dwu": 32,
      "vouchery-3-dwu": 37,
      "vouchery-4-dwu": 39,
      "vouchery-5-dwu": 43,
      "vouchery-6-dwu": 45,
      "vouchery-7-dwu": 48,
      "vouchery-8-dwu": 50,
      "vouchery-9-dwu": 52,
      "vouchery-10-dwu": 58,
      "vouchery-15-dwu": 70,
      "vouchery-20-dwu": 82,
      "vouchery-25-dwu": 100,
      "vouchery-30-dwu": 120,
      "banner-powlekany-1-25": 53,
      "banner-powlekany-26-50": 49,
      "banner-powlekany-51+": 45,
      "banner-blockout-1-25": 64,
      "banner-blockout-26-50": 59,
      "banner-blockout-51+": 55,
      "banner-oczkowanie": 2.5,
      "rollup-85x200-1-5": 290,
      "rollup-85x200-6-10": 275,
      "rollup-100x200-1-5": 305,
      "rollup-100x200-6-10": 285,
      "rollup-120x200-1-5": 330,
      "rollup-120x200-6-10": 310,
      "rollup-150x200-1-5": 440,
      "rollup-150x200-6-10": 425,
      "rollup-wymiana-labor": 50,
      "rollup-wymiana-m2": 80,
      "folia-szroniona-wydruk-1-5": 65,
      "folia-szroniona-wydruk-6-25": 60,
      "folia-szroniona-wydruk-26-50": 56,
      "folia-szroniona-wydruk-51+": 51,
      "folia-szroniona-oklejanie-1-5": 140,
      "folia-szroniona-oklejanie-6-10": 130,
      "folia-szroniona-oklejanie-11-20": 120,
      "wlepki-obrys-folia-1-5": 67,
      "wlepki-obrys-folia-6-25": 60,
      "wlepki-obrys-folia-26-50": 52,
      "wlepki-obrys-folia-51+": 48,
      "wlepki-polipropylen-1-10": 50,
      "wlepki-polipropylen-11+": 42,
      "wlepki-standard-folia-1-5": 54,
      "wlepki-standard-folia-6-25": 50,
      "wlepki-standard-folia-26-50": 46,
      "wlepki-standard-folia-51+": 42,
      "wlepki-modifier-arkusze": 2,
      "wlepki-modifier-pojedyncze": 10,
      "wlepki-modifier-mocny-klej": 0.12,
      "wizytowki-85x55-none-50szt": 65,
      "wizytowki-85x55-none-100szt": 75,
      "wizytowki-85x55-none-250szt": 110,
      "wizytowki-85x55-none-500szt": 170,
      "wizytowki-85x55-none-1000szt": 290,
      "wizytowki-85x55-matt_gloss-50szt": 160,
      "wizytowki-85x55-matt_gloss-100szt": 170,
      "wizytowki-85x55-matt_gloss-250szt": 200,
      "wizytowki-85x55-matt_gloss-500szt": 250,
      "wizytowki-85x55-matt_gloss-1000szt": 335,
      "wizytowki-90x50-none-50szt": 70,
      "wizytowki-90x50-none-100szt": 79,
      "wizytowki-90x50-none-250szt": 120,
      "wizytowki-90x50-none-500szt": 175,
      "wizytowki-90x50-none-1000szt": 300,
      "wizytowki-90x50-matt_gloss-50szt": 170,
      "wizytowki-90x50-matt_gloss-100szt": 180,
      "wizytowki-90x50-matt_gloss-250szt": 210,
      "wizytowki-90x50-matt_gloss-500szt": 260,
      "wizytowki-90x50-matt_gloss-1000szt": 345,
      "modifier-satyna": 0.12,
      "modifier-express": 0.2
    }
  };

  // src/services/priceService.ts
  var PRICES_STORAGE_KEY = "razdwa_prices";
  var _prices = JSON.parse(JSON.stringify(prices_default));
  (function _loadFromStorage() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem(PRICES_STORAGE_KEY);
      if (!raw) return;
      const overrides = JSON.parse(raw);
      if (overrides && typeof overrides === "object" && !Array.isArray(overrides)) {
        const validated = {};
        for (const [k, v] of Object.entries(overrides)) {
          if (k && typeof v === "number" && isFinite(v)) {
            validated[k] = v;
          }
        }
        if (Object.keys(validated).length > 0) {
          _prices.defaultPrices = { ..._prices.defaultPrices, ...validated };
        }
      }
    } catch {
    }
  })();
  function getPrice(path) {
    const keys = path.split(".");
    let obj = _prices;
    for (const key of keys) {
      if (obj == null || typeof obj !== "object") return void 0;
      obj = obj[key];
    }
    return obj;
  }

  // src/core/compat.ts
  function money(n) {
    return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
  }
  function pickTier(tiers, qty) {
    return tiers.find((t) => qty >= t.from && qty <= t.to) || null;
  }
  function pickNearestCeilKey(table, qty) {
    const keys = Object.keys(table || {}).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (!keys.length) return null;
    const k = keys.find((x) => qty <= x);
    return k == null ? null : k;
  }
  var PRICE = getPrice("drukA4A3");
  var CAD_PRICE = getPrice("drukCAD.price");
  var CAD_BASE = getPrice("drukCAD.base");
  var FORMAT_TOLERANCE_MM = getPrice("drukCAD.tolerance");
  var FOLD_PRICE = getPrice("drukCAD.fold");
  var WF_SCAN_PRICE_PER_CM = getPrice("drukCAD.wfScanPerCm");
  function readStoredPrices() {
    try {
      if (typeof localStorage === "undefined") return {};
      const raw = localStorage.getItem(PRICES_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
    }
    return {};
  }
  function resolveStoredPrice(key, defaultValue) {
    const stored = readStoredPrices();
    return typeof stored[key] === "number" ? stored[key] : defaultValue;
  }
  function overrideTiersWithStoredPrices(prefix, tiers) {
    const stored = readStoredPrices();
    return tiers.map((tier) => {
      const suffix = tier.max === null || tier.max > 5e4 ? `${tier.min}+` : `${tier.min}-${tier.max}`;
      const key = `${prefix}-${suffix}`;
      return typeof stored[key] === "number" ? { ...tier, price: stored[key] } : tier;
    });
  }
  var DEFAULT_PRICES = getPrice("defaultPrices");
  var BIZ = getPrice("wizytowki");

  // src/categories/solwent-plakaty.ts
  var data = getPrice("solwentPlakaty");
  function calculateSolwentPlakaty(input) {
    const tableData = getPrice("solwent-plakaty");
    const materialData = tableData.materials.find((m) => m.name === input.material);
    if (!materialData) {
      throw new Error(`Unknown material: ${input.material}`);
    }
    const priceTable = {
      id: tableData.id,
      title: tableData.title,
      unit: tableData.unit,
      pricing: tableData.pricing,
      tiers: overrideTiersWithStoredPrices(`solwent-${materialData.id}`, materialData.tiers),
      rules: tableData.rules,
      modifiers: tableData.modifiers
    };
    const activeModifiers = [];
    if (input.express) {
      activeModifiers.push("express");
    }
    return computeTotalPrice(priceTable, input.areaM2, activeModifiers);
  }

  // src/core/money.ts
  var CURRENCY = "PLN";
  var LOCALE = "pl-PL";
  function formatPrice(amount, currency = CURRENCY) {
    const formatted = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: currency === "PLN" ? "PLN" : "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return formatted;
  }
  var formatPLN = formatPrice;

  // src/ui/views/solwent-plakaty.ts
  var data2 = getPrice("solwentPlakaty");
  var SolwentPlakatyView = {
    id: "solwent-plakaty",
    name: "Solwent - Plakaty",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/solwent-plakaty.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        const tableData = data2;
        const materials = tableData.materials;
        const materialSelect = container.querySelector("#material");
        materialSelect.innerHTML = materials.map((m) => `<option value="${m.name}">${m.name}</option>`).join("");
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const materialSelect = container.querySelector("#material");
      const areaInput = container.querySelector("#area");
      const calculateBtn = container.querySelector("#calculate");
      const addToCartBtn = container.querySelector("#add-to-cart");
      const resultDisplay = container.querySelector("#result-display");
      const unitPriceSpan = container.querySelector("#unit-price");
      const totalPriceSpan = container.querySelector("#total-price");
      const expressHint = container.querySelector("#express-hint");
      let currentResult = null;
      calculateBtn.onclick = () => {
        const input = {
          material: materialSelect.value,
          areaM2: parseFloat(areaInput.value),
          express: ctx.expressMode
        };
        try {
          const result = calculateSolwentPlakaty(input);
          currentResult = result;
          unitPriceSpan.innerText = formatPLN(result.tierPrice);
          totalPriceSpan.innerText = formatPLN(result.totalPrice);
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Solwent - Plakaty");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult) {
          ctx.cart.addItem({
            id: `solwent-${Date.now()}`,
            category: "Solwent - Plakaty",
            name: materialSelect.value,
            quantity: parseFloat(areaInput.value),
            unit: "m2",
            unitPrice: currentResult.tierPrice,
            isExpress: ctx.expressMode,
            totalPrice: currentResult.totalPrice,
            optionsHint: `${areaInput.value}m2${ctx.expressMode ? ", EXPRESS" : ""}`,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/plakaty.ts
  var plakatyData = getPrice("plakaty").legacy200g;
  var fullData = getPrice("plakaty");
  function calculatePlakatyM2(input) {
    var _a;
    const data8 = fullData;
    const mat = data8.solwent.materials.find((m) => m.id === input.materialId);
    if (!mat) throw new Error(`Unknown solwent material: ${input.materialId}`);
    const minM2 = (_a = data8.solwent.minimumM2) != null ? _a : 1;
    const effectiveM2 = Math.max(input.areaM2, minM2);
    const tier = mat.tiers.find(
      (t) => effectiveM2 >= t.min && (t.max === null || effectiveM2 <= t.max)
    );
    if (!tier) throw new Error(`No tier for ${effectiveM2} m2`);
    const basePrice = parseFloat((effectiveM2 * tier.price).toFixed(2));
    let modifiersTotal = 0;
    const appliedModifiers = [];
    if (input.express) {
      const mod = data8.modifiers.find((m) => m.id === "express");
      if (mod) {
        modifiersTotal = parseFloat((basePrice * mod.value).toFixed(2));
        appliedModifiers.push(mod.name);
      }
    }
    return {
      materialName: mat.name,
      effectiveM2,
      tierPrice: tier.price,
      basePrice,
      modifiersTotal,
      totalPrice: parseFloat((basePrice + modifiersTotal).toFixed(2)),
      appliedModifiers
    };
  }
  function calculatePlakatyFormat(input) {
    var _a;
    const data8 = fullData;
    const mat = data8.formatowe.materials.find((m) => m.id === input.materialId);
    if (!mat) throw new Error(`Unknown format material: ${input.materialId}`);
    const unitPrice = mat.prices[input.formatKey];
    if (unitPrice === void 0) throw new Error(`Unknown format: ${input.formatKey}`);
    const discountGroup = mat.discountGroup;
    const discountTiers = (_a = data8.formatowe.discounts[discountGroup]) != null ? _a : [];
    const discountTier = discountTiers.find(
      (d) => input.qty >= d.min && (d.max === null || input.qty <= d.max)
    );
    const discountFactor = discountTier ? discountTier.factor : 1;
    const pricePerPiece = parseFloat((unitPrice * discountFactor).toFixed(2));
    const basePrice = parseFloat((pricePerPiece * input.qty).toFixed(2));
    let modifiersTotal = 0;
    const appliedModifiers = [];
    if (input.express) {
      const mod = data8.modifiers.find((m) => m.id === "express");
      if (mod) {
        modifiersTotal = parseFloat((basePrice * mod.value).toFixed(2));
        appliedModifiers.push(mod.name);
      }
    }
    return {
      materialName: mat.name,
      formatKey: input.formatKey,
      qty: input.qty,
      unitPrice,
      discountFactor,
      pricePerPiece,
      basePrice,
      modifiersTotal,
      totalPrice: parseFloat((basePrice + modifiersTotal).toFixed(2)),
      appliedModifiers
    };
  }

  // src/ui/views/plakaty.ts
  var data3 = getPrice("plakaty");
  var SOLWENT_IDS = /* @__PURE__ */ new Set(["200g-polysk", "blockout200g", "150g-polmat", "115g-mat"]);
  var PlakatyView = {
    id: "plakaty",
    name: "Plakaty",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/plakaty.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const tableData = data3;
      const materialSelect = container.querySelector("#p-material");
      const formatGroup = container.querySelector("#p-format-group");
      const m2Group = container.querySelector("#p-m2-group");
      const formatSelect = container.querySelector("#p-format");
      const qtyInput = container.querySelector("#p-qty");
      const areaInput = container.querySelector("#p-area");
      const calcBtn = container.querySelector("#p-calculate");
      const addBtn = container.querySelector("#p-add-to-cart");
      const resultBox = container.querySelector("#p-result-display");
      const unitPriceEl = container.querySelector("#p-unit-price");
      const totalPriceEl = container.querySelector("#p-total-price");
      const expressHint = container.querySelector("#p-express-hint");
      const allMaterials = [
        ...tableData.solwent.materials,
        ...tableData.formatowe.materials
      ];
      materialSelect.innerHTML = allMaterials.map(
        (m) => `<option value="${m.id}">${m.name}</option>`
      ).join("");
      function isSolwent(id) {
        return SOLWENT_IDS.has(id);
      }
      function updateFormatOptions(matId) {
        const mat = tableData.formatowe.materials.find((m) => m.id === matId);
        if (!mat) return;
        const keys = Object.keys(mat.prices);
        formatSelect.innerHTML = keys.map((k) => `<option value="${k}">${k}</option>`).join("");
      }
      function updateVisibility() {
        const matId = materialSelect.value;
        if (isSolwent(matId)) {
          formatGroup.style.display = "none";
          m2Group.style.display = "";
        } else {
          formatGroup.style.display = "";
          m2Group.style.display = "none";
          updateFormatOptions(matId);
        }
      }
      materialSelect.addEventListener("change", updateVisibility);
      updateVisibility();
      let currentResult = null;
      let currentOptions = null;
      calcBtn.onclick = () => {
        const matId = materialSelect.value;
        try {
          if (isSolwent(matId)) {
            const area = parseFloat(areaInput.value) || 1;
            const res = calculatePlakatyM2({ materialId: matId, areaM2: area, express: ctx.expressMode });
            currentResult = res;
            currentOptions = { type: "m2", matId, area };
            unitPriceEl.innerText = formatPLN(res.tierPrice);
            totalPriceEl.innerText = formatPLN(res.totalPrice);
          } else {
            const fmt = formatSelect.value;
            const qty = parseInt(qtyInput.value, 10) || 1;
            const res = calculatePlakatyFormat({ materialId: matId, formatKey: fmt, qty, express: ctx.expressMode });
            currentResult = res;
            currentOptions = { type: "format", matId, fmt, qty };
            unitPriceEl.innerText = formatPLN(res.pricePerPiece);
            totalPriceEl.innerText = formatPLN(res.totalPrice);
          }
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultBox.style.display = "block";
          addBtn.disabled = false;
          ctx.updateLastCalculated(currentResult.totalPrice, "Plakaty");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addBtn.onclick = () => {
        if (!currentResult || !currentOptions) return;
        const matName = materialSelect.options[materialSelect.selectedIndex].text;
        if (currentOptions.type === "m2") {
          const hint = `${currentOptions.area} m2${ctx.expressMode ? ", EXPRESS" : ""}`;
          ctx.cart.addItem({
            id: `plakaty-${Date.now()}`,
            category: "Plakaty",
            name: matName,
            quantity: currentOptions.area,
            unit: "m2",
            unitPrice: currentResult.tierPrice,
            isExpress: ctx.expressMode,
            totalPrice: currentResult.totalPrice,
            optionsHint: hint,
            payload: currentResult
          });
        } else {
          const hint = `${currentOptions.fmt} \xD7 ${currentOptions.qty} szt${ctx.expressMode ? ", EXPRESS" : ""}`;
          ctx.cart.addItem({
            id: `plakaty-${Date.now()}`,
            category: "Plakaty",
            name: matName,
            quantity: currentOptions.qty,
            unit: "szt",
            unitPrice: currentResult.pricePerPiece,
            isExpress: ctx.expressMode,
            totalPrice: currentResult.totalPrice,
            optionsHint: hint,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/vouchery.ts
  var voucheryData = getPrice("vouchery");
  function getPriceForQuantity(qty, isSingle) {
    let selectedTier = voucheryData[0];
    for (const tier of voucheryData) {
      if (qty >= tier.qty) {
        selectedTier = tier;
      } else {
        break;
      }
    }
    const side = isSingle ? "jed" : "dwu";
    const storageKey = `vouchery-${selectedTier.qty}-${side}`;
    const defaultPrice = isSingle ? selectedTier.single : selectedTier.double;
    return resolveStoredPrice(storageKey, defaultPrice);
  }
  function quoteVouchery(options) {
    const basePrice = getPriceForQuantity(options.qty, options.sides === "single");
    let percentageSum = 0;
    if (options.satin) {
      percentageSum += resolveStoredPrice("modifier-satyna", 0.12);
    }
    if (options.express) {
      percentageSum += resolveStoredPrice("modifier-express", 0.2);
    }
    const modifiersTotal = basePrice * percentageSum;
    const total = basePrice + modifiersTotal;
    return {
      basePrice,
      modifiersTotal: parseFloat(modifiersTotal.toFixed(2)),
      totalPrice: parseFloat(total.toFixed(2))
    };
  }

  // src/ui/views/vouchery.ts
  var VAT = 1.23;
  var VoucheryView = {
    id: "vouchery",
    name: "Vouchery",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/vouchery.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const qtyInput = container.querySelector("#v-qty");
      const paperSelect = container.querySelector("#v-paper");
      const calculateBtn = container.querySelector("#v-calculate");
      const addToCartBtn = container.querySelector("#v-add-to-cart");
      const resultDisplay = container.querySelector("#v-result-display");
      const basePriceSpan = container.querySelector("#v-base-price");
      const modifiersRow = container.querySelector("#v-modifiers-row");
      const modifiersTotalSpan = container.querySelector("#v-modifiers-total");
      const nettoPriceSpan = container.querySelector("#v-netto-price");
      const totalPriceSpan = container.querySelector("#v-total-price");
      const tierHint = container.querySelector("#v-tier-hint");
      const expressHint = container.querySelector("#v-express-hint");
      const satinHint = container.querySelector("#v-satin-hint");
      let currentResult = null;
      let currentOptions = null;
      calculateBtn.onclick = () => {
        const sidesInput = container.querySelector('input[name="v-sides"]:checked');
        const sides = sidesInput ? sidesInput.value : "single";
        const paperVal = paperSelect.value;
        const isSatin = paperVal.startsWith("satyna");
        currentOptions = {
          qty: parseInt(qtyInput.value),
          sides,
          satin: isSatin,
          express: ctx.expressMode
        };
        try {
          const result = quoteVouchery(currentOptions);
          const bruttoPrice = parseFloat((result.totalPrice * VAT).toFixed(2));
          currentResult = { ...result, bruttoPrice, isSatin };
          basePriceSpan.innerText = formatPLN(result.basePrice);
          if (result.modifiersTotal > 0) {
            modifiersRow.style.display = "flex";
            modifiersTotalSpan.innerText = "+" + formatPLN(result.modifiersTotal);
          } else {
            modifiersRow.style.display = "none";
          }
          if (nettoPriceSpan) nettoPriceSpan.innerText = formatPLN(result.totalPrice);
          totalPriceSpan.innerText = formatPLN(bruttoPrice);
          if (tierHint) tierHint.innerText = `Dla ${currentOptions.qty} szt cena bazowa: ${result.basePrice.toFixed(2)} z\u0142 (papier: ${paperVal.replace("_", " ")})`;
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(bruttoPrice, "Vouchery");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const sidesLabel = currentOptions.sides === "single" ? "Jednostronne" : "Dwustronne";
          const satinLabel = currentResult.isSatin ? ", Satyna" : "";
          const expressLabel = currentOptions.express ? ", EXPRESS" : "";
          const paperVal = paperSelect.value;
          ctx.cart.addItem({
            id: `vouchery-${Date.now()}`,
            category: "Vouchery",
            name: `Vouchery A4 ${sidesLabel}`,
            quantity: currentOptions.qty,
            unit: "szt",
            unitPrice: currentResult.bruttoPrice / currentOptions.qty,
            isExpress: currentOptions.express,
            totalPrice: currentResult.bruttoPrice,
            optionsHint: `${currentOptions.qty} szt${satinLabel}${expressLabel}, ${paperVal.replace("_", " ")}`,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/dyplomy.ts
  var DYPLOMY_PRICING = getPrice("dyplomy");
  function getPriceForQuantity2(qty) {
    let selectedTier = DYPLOMY_PRICING[0];
    for (const tier of DYPLOMY_PRICING) {
      if (qty >= tier.qty) {
        selectedTier = tier;
      } else {
        break;
      }
    }
    return selectedTier.price;
  }
  function calculateDyplomy(options) {
    const basePrice = getPriceForQuantity2(options.qty);
    let percentageSum = 0;
    const appliedModifiers = [];
    if (options.isSatin) {
      percentageSum += resolveStoredPrice("modifier-satyna", 0.12);
      appliedModifiers.push("satin");
    }
    if (options.express) {
      percentageSum += resolveStoredPrice("modifier-express", 0.2);
      appliedModifiers.push("express");
    }
    const modifiersTotal = basePrice * percentageSum;
    const totalPrice = basePrice + modifiersTotal;
    return {
      basePrice,
      modifiersTotal,
      totalPrice: Math.round(totalPrice * 100) / 100,
      appliedModifiers
    };
  }

  // src/ui/views/dyplomy.ts
  var VAT2 = 1.23;
  var DyplomyView = {
    id: "dyplomy",
    name: "Dyplomy",
    async mount(container, ctx) {
      const response = await fetch("categories/dyplomy.html");
      container.innerHTML = await response.text();
      const sidesSel = container.querySelector("#dypSides");
      const qtyInput = container.querySelector("#dypQty");
      const paperSel = container.querySelector("#dypPaper");
      const calcBtn = container.querySelector("#calcBtn");
      const addToCartBtn = container.querySelector("#addToCartBtn");
      const resultArea = container.querySelector("#dypResult");
      const calculate = () => {
        const paperVal = paperSel.value;
        const isSatin = paperVal.startsWith("satyna");
        const options = {
          qty: parseInt(qtyInput.value) || 1,
          sides: parseInt(sidesSel.value) || 1,
          isSatin,
          express: ctx.expressMode
        };
        const result = calculateDyplomy(options);
        const brutto = parseFloat((result.totalPrice * VAT2).toFixed(2));
        resultArea.style.display = "block";
        container.querySelector("#resNettoPrice").textContent = formatPLN(result.totalPrice);
        container.querySelector("#resUnitPrice").textContent = formatPLN(result.totalPrice / options.qty);
        container.querySelector("#resTotalPrice").textContent = formatPLN(brutto);
        const tierHintEl = container.querySelector("#resTierHint");
        if (tierHintEl) {
          tierHintEl.textContent = `Dla ${options.qty} szt u\u017Cyto ceny ${result.basePrice.toFixed(2)} z\u0142 (papier: ${paperVal.replace("_", " ")})`;
        }
        container.querySelector("#resDiscountHint").style.display = result.appliedModifiers.includes("bulk-discount") ? "block" : "none";
        container.querySelector("#resExpressHint").style.display = options.express ? "block" : "none";
        container.querySelector("#resSatinHint").style.display = options.isSatin ? "block" : "none";
        ctx.updateLastCalculated(brutto, "Dyplomy");
        return { options, result };
      };
      calcBtn.addEventListener("click", () => calculate());
      addToCartBtn.addEventListener("click", () => {
        const { options, result } = calculate();
        const brutto = parseFloat((result.totalPrice * VAT2).toFixed(2));
        ctx.cart.addItem({
          id: `dyp-${Date.now()}`,
          category: "Dyplomy",
          name: `Dyplomy DL ${options.sides === 1 ? "1-str" : "2-str"}`,
          quantity: options.qty,
          unit: "szt",
          unitPrice: brutto / options.qty,
          isExpress: options.express,
          totalPrice: brutto,
          optionsHint: `${options.qty} szt, ${paperSel.value.replace("_", " ")}`,
          payload: options
        });
      });
      calculate();
    }
  };

  // src/core/compat-logic.ts
  function tierRange(from, to) {
    return to > 5e4 ? `${from}+` : `${from}-${to}`;
  }
  function storedPrice(key, defaultUnit) {
    const stored = readStoredPrices();
    return typeof stored[key] === "number" ? stored[key] : defaultUnit;
  }
  function calculateSimplePrint(options) {
    if (options.pages <= 0) {
      return {
        unitPrice: 0,
        printTotal: 0,
        emailTotal: options.email ? PRICE.email_price : 0,
        inkTotal: 0,
        grandTotal: options.email ? PRICE.email_price : 0
      };
    }
    const tiers = PRICE.print[options.mode][options.format];
    const tier = pickTier(tiers, options.pages);
    if (!tier) throw new Error("Brak progu cenowego dla druku.");
    const modeKey = options.mode === "bw" ? "bw" : "kolor";
    const fmtKey = options.format.toLowerCase();
    const printStorageKey = `druk-${modeKey}-${fmtKey}-${tierRange(tier.from, tier.to)}`;
    const unitPrice = storedPrice(printStorageKey, tier.unit);
    let total = options.pages * unitPrice;
    let emailItemTotal = 0;
    if (options.email) {
      emailItemTotal = storedPrice("druk-email", PRICE.email_price);
    }
    let inkItemTotal = 0;
    if (options.ink25) {
      inkItemTotal = storedPrice("modifier-druk-zadruk25", 0.5) * unitPrice * options.ink25Qty;
    }
    return {
      unitPrice,
      printTotal: total,
      emailTotal: emailItemTotal,
      inkTotal: inkItemTotal,
      grandTotal: total + emailItemTotal + inkItemTotal
    };
  }
  function calculateSimpleScan(options) {
    if (options.pages <= 0) return { unitPrice: 0, total: 0 };
    const tiers = PRICE.scan[options.type];
    const tier = pickTier(tiers, options.pages);
    if (!tier) throw new Error("Brak progu cenowego dla skanowania.");
    const scanTypeKey = options.type === "auto" ? "auto" : "reczne";
    const scanStorageKey = `skan-${scanTypeKey}-${tierRange(tier.from, tier.to)}`;
    const unitPrice = storedPrice(scanStorageKey, tier.unit);
    return {
      unitPrice,
      total: options.pages * unitPrice
    };
  }
  function calculateCad(options) {
    const base = CAD_BASE[options.format];
    if (!base) throw new Error("Nieznany format CAD.");
    const isFormatowe = Math.abs(options.lengthMm - base.l) <= FORMAT_TOLERANCE_MM;
    const detectedType = isFormatowe ? "formatowe" : "mb";
    const rate = CAD_PRICE[options.mode][detectedType][options.format];
    if (rate == null) throw new Error("Brak stawki w cenniku dla CAD.");
    const cadModeKey = options.mode === "bw" ? "bw" : "kolor";
    const cadTypeKey = detectedType === "formatowe" ? "fmt" : "mb";
    const cadFmtKey = options.format.toLowerCase().replace("0p", "0plus").replace("r1067", "mb1067");
    const cadStorageKey = `druk-cad-${cadModeKey}-${cadTypeKey}-${cadFmtKey}`;
    const resolvedRate = storedPrice(cadStorageKey, rate);
    let total = 0;
    if (detectedType === "formatowe") {
      total = options.qty * resolvedRate;
    } else {
      const meters = options.lengthMm / 1e3;
      total = options.qty * meters * resolvedRate;
    }
    return {
      detectedType,
      rate: resolvedRate,
      total: parseFloat(money(total))
    };
  }
  function calculateCadFold(options) {
    const unit = FOLD_PRICE[options.format];
    if (unit == null) throw new Error("Brak stawki sk\u0142adania.");
    return {
      unit,
      total: options.qty * unit
    };
  }
  function calculateWfScan(options) {
    const cmRounded = Math.round(options.lengthMm / 10);
    const unitPrice = cmRounded * WF_SCAN_PRICE_PER_CM;
    return {
      cmRounded,
      unitPrice,
      total: options.qty * unitPrice
    };
  }
  function calculateBusinessCards(options) {
    let table;
    if (options.family === "deluxe") {
      const optObj = BIZ.cyfrowe.deluxe.options[options.deluxeOpt];
      table = optObj.prices;
    } else {
      const tablesByFinish = options.finish === "softtouch" ? BIZ.cyfrowe.softtouchPrices : BIZ.cyfrowe.standardPrices;
      table = tablesByFinish[options.size][options.lam];
    }
    const qtyBilled = pickNearestCeilKey(table, options.qty);
    if (qtyBilled == null) throw new Error("Brak progu cenowego dla takiej ilo\u015Bci.");
    let total = table[qtyBilled];
    if (options.family !== "deluxe" && options.size) {
      const foliaKey = options.lam === "noLam" ? "none" : "matt_gloss";
      const storageKey = `wizytowki-${options.size}-${foliaKey}-${qtyBilled}szt`;
      total = storedPrice(storageKey, total);
    }
    return {
      qtyBilled,
      total
    };
  }

  // src/categories/wizytowki-druk-cyfrowy.ts
  function quoteWizytowki(options) {
    const family = options.family || "standard";
    const finish = options.finish || "mat";
    const size = options.format || "85x55";
    const lam = finish === "softtouch" ? "lam" : options.folia === "none" ? "noLam" : "lam";
    const res = calculateBusinessCards({
      family,
      size,
      lam,
      finish,
      deluxeOpt: options.deluxeOpt,
      qty: options.qty
    });
    let totalPrice = res.total;
    if (options.express) {
      totalPrice = res.total * (1 + resolveStoredPrice("modifier-express", 0.2));
    }
    return {
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      basePrice: res.total,
      effectiveQuantity: options.qty,
      tierPrice: res.total / res.qtyBilled,
      // approximate
      modifiersTotal: options.express ? res.total * resolveStoredPrice("modifier-express", 0.2) : 0,
      appliedModifiers: options.express ? ["TRYB EXPRESS"] : [],
      qtyBilled: res.qtyBilled
    };
  }

  // src/ui/views/wizytowki-druk-cyfrowy.ts
  var VAT3 = 1.23;
  var SATIN_MULTIPLIER = 1.12;
  var WizytowkiView = {
    id: "wizytowki-druk-cyfrowy",
    name: "Wizyt\xF3wki - druk cyfrowy",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/wizytowki-druk-cyfrowy.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const familySelect = container.querySelector("#w-family");
      const standardOpts = container.querySelector("#standard-options");
      const deluxeOpts = container.querySelector("#deluxe-options");
      const finishSelect = container.querySelector("#w-finish");
      const sizeSelect = container.querySelector("#w-size");
      const lamSelect = container.querySelector("#w-lam");
      const deluxeOptSelect = container.querySelector("#w-deluxe-opt");
      const paperSelect = container.querySelector("#w-paper");
      const qtyInput = container.querySelector("#w-qty");
      const calculateBtn = container.querySelector("#w-calculate");
      const addToCartBtn = container.querySelector("#w-add-to-cart");
      const resultDisplay = container.querySelector("#w-result-display");
      const nettoSpan = container.querySelector("#w-netto-price");
      const totalPriceSpan = container.querySelector("#w-total-price");
      const billedQtyHint = container.querySelector("#w-billed-qty-hint");
      const tierHint = container.querySelector("#w-tier-hint");
      const expressHint = container.querySelector("#w-express-hint");
      const satinHint = container.querySelector("#w-satin-hint");
      familySelect.onchange = () => {
        const isDeluxe = familySelect.value === "deluxe";
        standardOpts.style.display = isDeluxe ? "none" : "block";
        deluxeOpts.style.display = isDeluxe ? "block" : "none";
      };
      let currentResult = null;
      let currentOptions = null;
      calculateBtn.onclick = () => {
        const paperVal = paperSelect.value;
        const isSatin = paperVal.startsWith("satyna");
        currentOptions = {
          family: familySelect.value,
          finish: finishSelect.value,
          format: sizeSelect.value,
          folia: lamSelect.value === "lam" ? "matt_gloss" : "none",
          deluxeOpt: deluxeOptSelect.value,
          qty: parseInt(qtyInput.value),
          express: ctx.expressMode
        };
        try {
          const result = quoteWizytowki(currentOptions);
          const nettoPrice = isSatin ? parseFloat((result.totalPrice * SATIN_MULTIPLIER).toFixed(2)) : result.totalPrice;
          const bruttoPrice = parseFloat((nettoPrice * VAT3).toFixed(2));
          currentResult = { ...result, nettoPrice, bruttoPrice, isSatin };
          nettoSpan.innerText = formatPLN(nettoPrice);
          totalPriceSpan.innerText = formatPLN(bruttoPrice);
          billedQtyHint.innerText = `Rozliczono za: ${result.qtyBilled} szt.`;
          if (tierHint) tierHint.innerText = `Dla ${result.qtyBilled} szt u\u017Cyto ceny ${result.totalPrice.toFixed(2)} z\u0142 (papier: ${paperVal.replace("_", " ")})`;
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(bruttoPrice, "Wizyt\xF3wki");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const name = currentOptions.family === "deluxe" ? "Wizyt\xF3wki DELUXE" : "Wizyt\xF3wki Standard";
          const expressLabel = currentOptions.express ? ", EXPRESS" : "";
          const satinLabel = currentResult.isSatin ? ", SATYNA" : "";
          const paperVal = paperSelect.value;
          ctx.cart.addItem({
            id: `wizytowki-${Date.now()}`,
            category: "Wizyt\xF3wki",
            name,
            quantity: currentResult.qtyBilled,
            unit: "szt",
            unitPrice: currentResult.bruttoPrice / currentResult.qtyBilled,
            isExpress: currentOptions.express,
            totalPrice: currentResult.bruttoPrice,
            optionsHint: `${currentOptions.qty} szt (rozliczono ${currentResult.qtyBilled})${satinLabel}${expressLabel}, ${paperVal.replace("_", " ")}`,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/roll-up.ts
  var data4 = getPrice("rollUp");
  function calculateRollUp(options) {
    const formatData = data4.formats[options.format];
    if (!formatData) {
      throw new Error(`Unknown format: ${options.format}`);
    }
    let priceTable;
    if (options.isReplacement) {
      const area = formatData.width * formatData.height;
      const labor = resolveStoredPrice("rollup-wymiana-labor", data4.replacement.labor);
      const printPerM2 = resolveStoredPrice("rollup-wymiana-m2", data4.replacement.print_per_m2);
      const pricePerSzt = area * printPerM2 + labor;
      priceTable = {
        id: "roll-up-replacement",
        title: `Wymiana wk\u0142adu (${options.format})`,
        unit: "szt",
        pricing: "per_unit",
        tiers: [{ min: 1, max: null, price: pricePerSzt }],
        modifiers: [
          { id: "express", name: "EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.2) }
        ]
      };
    } else {
      priceTable = {
        id: "roll-up-full",
        title: `Roll-up Komplet (${options.format})`,
        unit: "szt",
        pricing: "per_unit",
        tiers: overrideTiersWithStoredPrices(`rollup-${options.format}`, formatData.tiers),
        modifiers: [
          { id: "express", name: "EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.2) }
        ]
      };
    }
    const activeModifiers = [];
    if (options.express) {
      activeModifiers.push("express");
    }
    return computeTotalPrice(priceTable, options.qty, activeModifiers);
  }

  // src/ui/views/roll-up.ts
  var RollUpView = {
    id: "roll-up",
    name: "Roll-up",
    async mount(container, ctx) {
      const response = await fetch("categories/roll-up.html");
      container.innerHTML = await response.text();
      const typeSel = container.querySelector("#rollUpType");
      const formatSel = container.querySelector("#rollUpFormat");
      const qtyInput = container.querySelector("#rollUpQty");
      const calcBtn = container.querySelector("#calcBtn");
      const addToCartBtn = container.querySelector("#addToCartBtn");
      const resultArea = container.querySelector("#rollUpResult");
      const calculate = () => {
        const options = {
          format: formatSel.value,
          qty: parseInt(qtyInput.value) || 1,
          isReplacement: typeSel.value === "replacement",
          express: ctx.expressMode
        };
        const result = calculateRollUp(options);
        resultArea.style.display = "block";
        container.querySelector("#resUnitPrice").textContent = formatPLN(result.totalPrice / options.qty);
        container.querySelector("#resTotalPrice").textContent = formatPLN(result.totalPrice);
        container.querySelector("#resExpressHint").style.display = options.express ? "block" : "none";
        ctx.updateLastCalculated(result.totalPrice, "Roll-up");
        return { options, result };
      };
      calcBtn.addEventListener("click", () => calculate());
      addToCartBtn.addEventListener("click", () => {
        const { options, result } = calculate();
        ctx.cart.addItem({
          id: `rollup-${Date.now()}`,
          category: "Roll-up",
          name: `${options.isReplacement ? "Wymiana wk\u0142adu" : "Roll-up Komplet"} ${options.format}`,
          quantity: options.qty,
          unit: "szt",
          unitPrice: result.totalPrice / options.qty,
          isExpress: options.express,
          totalPrice: result.totalPrice,
          optionsHint: `${options.format}, ${options.qty} szt`,
          payload: options
        });
      });
      calculate();
    }
  };

  // src/categories/zaproszenia-kreda.ts
  var pricingData = getPrice("zaproszeniaKreda");
  function getBasePrice(format, qty, sides, isFolded) {
    const formats = pricingData.formats;
    const formatData = formats[format];
    if (!formatData) throw new Error(`Unknown format: ${format}`);
    const sidesKey = sides === 1 ? "single" : "double";
    const foldKey = isFolded ? "folded" : "normal";
    const tiers = formatData[sidesKey][foldKey];
    const sortedKeys = Object.keys(tiers).map(Number).sort((a, b) => a - b);
    let selectedPrice = tiers[String(sortedKeys[0])];
    for (const tier of sortedKeys) {
      if (qty >= tier) {
        selectedPrice = tiers[String(tier)];
      } else {
        break;
      }
    }
    return selectedPrice;
  }
  function calculateZaproszeniaKreda(options) {
    const basePrice = getBasePrice(options.format, options.qty, options.sides, options.isFolded);
    let multiplier = 1;
    if (options.isSatin) multiplier += pricingData.modifiers.satin;
    if (options.express) multiplier += pricingData.modifiers.express;
    const totalPrice = parseFloat((basePrice * multiplier).toFixed(2));
    return { basePrice, totalPrice };
  }

  // src/ui/views/zaproszenia-kreda.ts
  var VAT4 = 1.23;
  var ZaproszeniaKredaView = {
    id: "zaproszenia-kreda",
    name: "Zaproszenia KREDA",
    async mount(container, ctx) {
      const response = await fetch("categories/zaproszenia-kreda.html");
      container.innerHTML = await response.text();
      const formatSel = container.querySelector("#zapFormat");
      const sidesSel = container.querySelector("#zapSides");
      const foldedCheck = container.querySelector("#zapFolded");
      const qtyInput = container.querySelector("#zapQty");
      const paperSel = container.querySelector("#zapPaper");
      const calcBtn = container.querySelector("#calcBtn");
      const addToCartBtn = container.querySelector("#addToCartBtn");
      const resultArea = container.querySelector("#zapResult");
      const calculate = () => {
        const paperVal = paperSel.value;
        const isSatin = paperVal.startsWith("satyna");
        const options = {
          format: formatSel.value,
          qty: parseInt(qtyInput.value) || 10,
          sides: parseInt(sidesSel.value) || 1,
          isFolded: foldedCheck.checked,
          isSatin,
          express: ctx.expressMode
        };
        const result = calculateZaproszeniaKreda(options);
        const brutto = parseFloat((result.totalPrice * VAT4).toFixed(2));
        resultArea.style.display = "block";
        container.querySelector("#resNettoPrice").textContent = formatPLN(result.totalPrice);
        container.querySelector("#resUnitPrice").textContent = formatPLN(result.totalPrice / options.qty);
        container.querySelector("#resTotalPrice").textContent = formatPLN(brutto);
        const tierHintEl = container.querySelector("#resTierHint");
        if (tierHintEl) {
          tierHintEl.textContent = `Dla ${options.qty} szt u\u017Cyto ceny ${result.basePrice.toFixed(2)} z\u0142 (papier: ${paperVal.replace("_", " ")})`;
        }
        container.querySelector("#resExpressHint").style.display = options.express ? "block" : "none";
        container.querySelector("#resSatinHint").style.display = options.isSatin ? "block" : "none";
        ctx.updateLastCalculated(brutto, "Zaproszenia");
        return { options, result };
      };
      calcBtn.addEventListener("click", () => calculate());
      addToCartBtn.addEventListener("click", () => {
        const { options, result } = calculate();
        const brutto = parseFloat((result.totalPrice * VAT4).toFixed(2));
        ctx.cart.addItem({
          id: `zap-${Date.now()}`,
          category: "Zaproszenia Kreda",
          name: `Zaproszenia ${options.format} ${options.sides === 1 ? "1-str" : "2-str"}${options.isFolded ? " sk\u0142adane" : ""}`,
          quantity: options.qty,
          unit: "szt",
          unitPrice: brutto / options.qty,
          isExpress: options.express,
          totalPrice: brutto,
          optionsHint: `${options.qty} szt, ${paperSel.value.replace("_", " ")}`,
          payload: options
        });
      });
      calculate();
    }
  };

  // src/categories/ulotki-cyfrowe-dwustronne.ts
  var prices = getPrice("ulotkiDwustronne");
  function getUlotkiDwustronneTable(formatKey) {
    const prices4 = getPrice("ulotki-cyfrowe-dwustronne");
    const formatData = prices4.formats[formatKey];
    if (!formatData) {
      throw new Error(`Invalid format: ${formatKey}`);
    }
    return {
      id: `ulotki-cyfrowe-dwustronne-${formatKey.toLowerCase()}`,
      title: `Ulotki Cyfrowe Dwustronne ${formatData.name}`,
      unit: "szt",
      pricing: "flat",
      tiers: formatData.tiers,
      modifiers: [
        { id: "express", name: "TRYB EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.2) }
      ]
    };
  }
  function quoteUlotkiDwustronne(options) {
    const table = getUlotkiDwustronneTable(options.format);
    const activeModifiers = [];
    if (options.express) activeModifiers.push("express");
    return computeTotalPrice(table, options.qty, activeModifiers);
  }

  // src/categories/ulotki-cyfrowe-jednostronne.ts
  var prices2 = getPrice("ulotkiJednostronne");
  function getUlotkiJednostronneTable(formatKey) {
    const prices4 = getPrice("ulotki-cyfrowe-jednostronne");
    const formatData = prices4.formats[formatKey];
    if (!formatData) {
      throw new Error(`Invalid format: ${formatKey}`);
    }
    return {
      id: `ulotki-cyfrowe-jednostronne-${formatKey.toLowerCase()}`,
      title: `Ulotki Cyfrowe Jednostronne ${formatData.name}`,
      unit: "szt",
      pricing: "flat",
      tiers: formatData.tiers,
      modifiers: [
        { id: "express", name: "TRYB EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.2) }
      ]
    };
  }
  function quoteJednostronne(options) {
    const table = getUlotkiJednostronneTable(options.format);
    const activeModifiers = [];
    if (options.express) activeModifiers.push("express");
    return computeTotalPrice(table, options.qty, activeModifiers);
  }

  // src/ui/views/ulotki-cyfrowe.ts
  var VAT5 = 1.23;
  var SATIN_MULTIPLIER2 = 1.12;
  var UlotkiCyfroweView = {
    id: "ulotki-cyfrowe",
    name: "Ulotki cyfrowe",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/ulotki-cyfrowe.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const formatSelect = container.querySelector("#u-format");
      const qtySelect = container.querySelector("#u-qty");
      const paperSelect = container.querySelector("#u-paper");
      const calculateBtn = container.querySelector("#u-calculate");
      const addToCartBtn = container.querySelector("#u-add-to-cart");
      const resultDisplay = container.querySelector("#u-result-display");
      const nettoSpan = container.querySelector("#u-netto-price");
      const totalPriceSpan = container.querySelector("#u-total-price");
      const tierHint = container.querySelector("#u-tier-hint");
      const expressHint = container.querySelector("#u-express-hint");
      const satinHint = container.querySelector("#u-satin-hint");
      let currentResult = null;
      let currentOptions = null;
      calculateBtn.onclick = () => {
        const sides = container.querySelector('input[name="sides"]:checked').value;
        const paperVal = paperSelect.value;
        const isSatin = paperVal.startsWith("satyna");
        currentOptions = {
          format: formatSelect.value,
          qty: parseInt(qtySelect.value),
          express: ctx.expressMode,
          sides
        };
        try {
          const result = sides === "dwustronne" ? quoteUlotkiDwustronne(currentOptions) : quoteJednostronne(currentOptions);
          const nettoPrice = isSatin ? parseFloat((result.totalPrice * SATIN_MULTIPLIER2).toFixed(2)) : result.totalPrice;
          const bruttoPrice = parseFloat((nettoPrice * VAT5).toFixed(2));
          currentResult = { ...result, nettoPrice, bruttoPrice, isSatin };
          nettoSpan.innerText = formatPLN(nettoPrice);
          totalPriceSpan.innerText = formatPLN(bruttoPrice);
          if (tierHint) tierHint.innerText = `Dla ${currentOptions.qty} szt u\u017Cyto ceny ${result.totalPrice.toFixed(2)} z\u0142 netto (papier: ${paperVal.replace("_", " ")})`;
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          if (satinHint) satinHint.style.display = isSatin ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(bruttoPrice, "Ulotki");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const expressLabel = currentOptions.express ? ", EXPRESS" : "";
          const satinLabel = currentResult.isSatin ? ", SATYNA" : "";
          const sidesLabel = currentOptions.sides === "dwustronne" ? "Dwustronne" : "Jednostronne";
          const paperVal = paperSelect.value;
          ctx.cart.addItem({
            id: `ulotki-${Date.now()}`,
            category: "Ulotki",
            name: `Ulotki ${sidesLabel} ${currentOptions.format}`,
            quantity: currentOptions.qty,
            unit: "szt",
            unitPrice: currentResult.bruttoPrice / currentOptions.qty,
            isExpress: currentOptions.express,
            totalPrice: currentResult.bruttoPrice,
            optionsHint: `${currentOptions.qty} szt, ${sidesLabel}${satinLabel}${expressLabel}, ${paperVal.replace("_", " ")}`,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/banner.ts
  function calculateBanner(options) {
    const tableData = getPrice("banner");
    const materialData = tableData.materials.find((m) => m.id === options.material);
    if (!materialData) {
      throw new Error(`Unknown material: ${options.material}`);
    }
    const priceTable = {
      id: tableData.id,
      title: tableData.title,
      unit: tableData.unit,
      pricing: tableData.pricing,
      tiers: overrideTiersWithStoredPrices(`banner-${options.material}`, materialData.tiers),
      modifiers: tableData.modifiers.map(
        (m) => m.id === "oczkowanie" ? { ...m, value: resolveStoredPrice("banner-oczkowanie", m.value) } : m
      )
    };
    const activeModifiers = [];
    if (options.oczkowanie) {
      activeModifiers.push("oczkowanie");
    }
    if (options.express) {
      activeModifiers.push("express");
    }
    return computeTotalPrice(priceTable, options.areaM2, activeModifiers);
  }

  // src/ui/views/banner.ts
  var BannerView = {
    id: "banner",
    name: "Bannery",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/banner.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const materialSelect = container.querySelector("#b-material");
      const areaInput = container.querySelector("#b-area");
      const oczkowanieCheckbox = container.querySelector("#b-oczkowanie");
      const calculateBtn = container.querySelector("#b-calculate");
      const addToCartBtn = container.querySelector("#b-add-to-cart");
      const resultDisplay = container.querySelector("#b-result-display");
      const unitPriceSpan = container.querySelector("#b-unit-price");
      const totalPriceSpan = container.querySelector("#b-total-price");
      const expressHint = container.querySelector("#b-express-hint");
      let currentResult = null;
      let currentOptions = null;
      calculateBtn.onclick = () => {
        currentOptions = {
          material: materialSelect.value,
          areaM2: parseFloat(areaInput.value),
          oczkowanie: oczkowanieCheckbox.checked,
          express: ctx.expressMode
        };
        try {
          const result = calculateBanner(currentOptions);
          currentResult = result;
          unitPriceSpan.innerText = formatPLN(result.tierPrice);
          totalPriceSpan.innerText = formatPLN(result.totalPrice);
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Banner");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const matName = materialSelect.options[materialSelect.selectedIndex].text;
          const opts = [
            `${currentOptions.areaM2} m2`,
            currentOptions.oczkowanie ? "z oczkowaniem" : "bez oczkowania",
            currentOptions.express ? "EXPRESS" : ""
          ].filter(Boolean).join(", ");
          ctx.cart.addItem({
            id: `banner-${Date.now()}`,
            category: "Bannery",
            name: matName,
            quantity: currentOptions.areaM2,
            unit: "m2",
            unitPrice: currentResult.tierPrice,
            isExpress: currentOptions.express,
            totalPrice: currentResult.totalPrice,
            optionsHint: opts,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/wlepki-naklejki.ts
  var data5 = getPrice("wlepkiNaklejki");
  function calculateWlepki(input) {
    const tableData = getPrice("wlepki-naklejki");
    const groupData = tableData.groups.find((g) => g.id === input.groupId);
    if (!groupData) {
      throw new Error(`Unknown group: ${input.groupId}`);
    }
    const storagePrefix = input.groupId.replace(/_/g, "-");
    const priceTable = {
      id: "wlepki",
      title: groupData.title,
      unit: groupData.unit,
      pricing: groupData.pricing || "per_unit",
      tiers: overrideTiersWithStoredPrices(storagePrefix, groupData.tiers),
      modifiers: tableData.modifiers.map((m) => {
        const modKey = `wlepki-modifier-${m.id.replace(/_/g, "-")}`;
        return { ...m, value: resolveStoredPrice(modKey, m.value) };
      }),
      rules: groupData.rules || [{ type: "minimum", unit: "m2", value: 1 }]
    };
    const activeModifiers = [...input.modifiers];
    if (input.express) {
      activeModifiers.push("express");
    }
    return computeTotalPrice(priceTable, input.area, activeModifiers);
  }

  // src/ui/views/wlepki-naklejki.ts
  var data6 = getPrice("wlepkiNaklejki");
  var WlepkiView = {
    id: "wlepki-naklejki",
    name: "Wlepki / Naklejki",
    async mount(container, ctx) {
      const tableData = data6;
      try {
        const response = await fetch("categories/wlepki-naklejki.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania szablonu: ${err}</div>`;
        return;
      }
      const groupSelect = container.querySelector("#wlepki-group");
      const areaInput = container.querySelector("#wlepki-area");
      const calcBtn = container.querySelector("#btn-calculate");
      const addBtn = container.querySelector("#btn-add-to-cart");
      const resultDiv = container.querySelector("#wlepki-result");
      const unitPriceEl = container.querySelector("#unit-price");
      const totalPriceEl = container.querySelector("#total-price");
      let currentResult = null;
      let currentInput = null;
      const calculate = () => {
        const modCheckboxes = container.querySelectorAll(".wlepki-mod:checked");
        const modifiers = Array.from(modCheckboxes).map((cb) => cb.value);
        currentInput = {
          groupId: groupSelect.value,
          area: parseFloat(areaInput.value) || 0,
          express: ctx.expressMode,
          modifiers
        };
        try {
          const result = calculateWlepki(currentInput);
          currentResult = result;
          unitPriceEl.textContent = formatPLN(result.tierPrice);
          totalPriceEl.textContent = formatPLN(result.totalPrice);
          resultDiv.style.display = "block";
          addBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Wlepki");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      calcBtn.addEventListener("click", calculate);
      addBtn.addEventListener("click", () => {
        if (!currentResult || !currentInput) return;
        const group = tableData.groups.find((g) => g.id === currentInput.groupId);
        const modsLabel = currentInput.modifiers.map((mId) => {
          const m = tableData.modifiers.find((mod) => mod.id === mId);
          return m ? m.name : mId;
        });
        if (currentInput.express) modsLabel.unshift("EXPRESS (+20%)");
        ctx.cart.addItem({
          id: `wlepki-${Date.now()}`,
          category: "Wlepki / Naklejki",
          name: (group == null ? void 0 : group.title) || "Wlepki",
          quantity: currentInput.area,
          unit: "m2",
          unitPrice: currentResult.tierPrice,
          isExpress: !!currentInput.express,
          totalPrice: currentResult.totalPrice,
          optionsHint: modsLabel.join(", ") || "Standard",
          payload: currentResult
        });
      });
    }
  };

  // src/categories/druk-a4-a3-skan.ts
  function calculateDrukA4A3Skan(options, pricing) {
    const format = options.format.toUpperCase();
    const printResult = calculateSimplePrint({
      mode: options.mode,
      format,
      pages: options.printQty,
      email: options.email,
      ink25: options.surcharge,
      ink25Qty: options.surchargeQty
    });
    let scanResult = { total: 0, unitPrice: 0 };
    if (options.scanType !== "none" && options.scanQty > 0) {
      scanResult = calculateSimpleScan({
        type: options.scanType,
        pages: options.scanQty
      });
    }
    const baseTotal = printResult.grandTotal + scanResult.total;
    let finalTotal = baseTotal;
    if (options.express) {
      finalTotal = baseTotal * (1 + resolveStoredPrice("modifier-express", 0.2));
    }
    return {
      totalPrice: parseFloat(finalTotal.toFixed(2)),
      unitPrintPrice: printResult.unitPrice,
      totalPrintPrice: printResult.printTotal,
      unitScanPrice: scanResult.unitPrice,
      totalScanPrice: scanResult.total,
      emailPrice: printResult.emailTotal,
      surchargePrice: printResult.inkTotal,
      baseTotal
    };
  }

  // data/categories.json
  var categories_default = [
    {
      id: "druk-a4-a3",
      name: "Druk A4/A3 + skan",
      icon: "\u{1F5A8}\uFE0F",
      implemented: true,
      pricing: {
        print_bw: [
          { min: 1, max: 5, a4: 0.9, a3: 1.7 },
          { min: 6, max: 20, a4: 0.6, a3: 1.1 },
          { min: 21, max: 100, a4: 0.35, a3: 0.7 },
          { min: 101, max: 500, a4: 0.3, a3: 0.6 },
          { min: 501, max: 999, a4: 0.23, a3: 0.45 },
          { min: 1e3, max: 4999, a4: 0.19, a3: 0.33 },
          { min: 5e3, max: null, a4: 0.15, a3: 0.3 }
        ],
        print_color: [
          { min: 1, max: 10, a4: 2.4, a3: 4.8 },
          { min: 11, max: 40, a4: 2.2, a3: 4.2 },
          { min: 41, max: 100, a4: 2, a3: 3.8 },
          { min: 101, max: 250, a4: 1.8, a3: 3 },
          { min: 251, max: 500, a4: 1.6, a3: 2.5 },
          { min: 501, max: 999, a4: 1.4, a3: 1.9 },
          { min: 1e3, max: null, a4: 1.1, a3: 1.6 }
        ],
        scan_auto: [
          { min: 1, max: 9, price: 1 },
          { min: 10, max: 49, price: 0.5 },
          { min: 50, max: 99, price: 0.4 },
          { min: 100, max: null, price: 0.25 }
        ],
        scan_manual: [
          { min: 1, max: 4, price: 2 },
          { min: 5, max: null, price: 1 }
        ],
        email_cost: 1,
        surcharge_factor: 0.5
      }
    },
    {
      id: "druk-cad",
      name: "Druk CAD wielkoformatowy",
      icon: "\u{1F4D0}",
      implemented: true,
      format_prices: {
        bw: {
          "A0+": { length: 1292, price: 12.5 },
          A0: { length: 1189, price: 11 },
          A1: { length: 841, price: 6 },
          A2: { length: 594, price: 4 },
          A3: { length: 420, price: 2.5 }
        },
        color: {
          "A0+": { length: 1292, price: 26 },
          A0: { length: 1189, price: 24 },
          A1: { length: 841, price: 12 },
          A2: { length: 594, price: 8.5 },
          A3: { length: 420, price: 5.3 }
        }
      },
      meter_prices: {
        bw: {
          "A0+": 10,
          A0: 9,
          A1: 5,
          A2: 4.5,
          A3: 3.5
        },
        color: {
          "A0+": 21,
          A0: 20,
          A1: 14.5,
          A2: 13.9,
          A3: 12
        }
      }
    },
    { id: "solwent-plakaty", name: "Solwent - Plakaty", icon: "\u{1F5BC}\uFE0F", implemented: true },
    { id: "vouchery", name: "Vouchery", icon: "\u{1F39F}\uFE0F", implemented: true },
    { id: "dyplomy", name: "Dyplomy", icon: "\u{1F4DC}", implemented: true },
    { id: "wizytowki-druk-cyfrowy", name: "Wizyt\xF3wki - druk cyfrowy", icon: "\u{1F4C7}", implemented: true },
    { id: "zaproszenia-kreda", name: "Zaproszenia KREDA", icon: "\u2709\uFE0F", implemented: true },
    { id: "ulotki-cyfrowe-dwustronne", name: "Ulotki - Cyfrowe Dwustronne", icon: "\u{1F4C4}", implemented: true },
    { id: "ulotki-cyfrowe-jednostronne", name: "Ulotki \u2013 cyfrowe jednostronne", icon: "\u{1F4C4}", implemented: true },
    { id: "banner", name: "Bannery", icon: "\u{1F3C1}", implemented: true },
    { id: "wlepki-naklejki", name: "Wlepki / Naklejki", icon: "\u{1F3F7}\uFE0F", implemented: true },
    { id: "roll-up", name: "Roll-up", icon: "\u2195\uFE0F", implemented: true },
    {
      id: "folia-szroniona",
      name: "Folia szroniona",
      icon: "\u2744\uFE0F",
      implemented: true
    },
    {
      id: "laminowanie",
      name: "Laminowanie",
      icon: "\u2728",
      implemented: true
    },
    {
      id: "cad-ops",
      name: "CAD: sk\u0142adanie / skan",
      icon: "\u{1F4CF}",
      implemented: true
    }
  ];

  // src/ui/views/DrukA4A3SkanView.ts
  var DrukA4A3SkanView = {
    id: "druk-a4-a3-skan",
    name: "Druk A4/A3 + skan",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/druk-a4-a3-skan.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      var _a;
      const pricing = (_a = categories_default.find((c) => c.id === "druk-a4-a3-skan")) == null ? void 0 : _a.pricing;
      if (!pricing) return;
      const modeSelect = container.querySelector("#d-mode");
      const formatSelect = container.querySelector("#d-format");
      const printQtyInput = container.querySelector("#d-print-qty");
      const emailCheck = container.querySelector("#d-email");
      const surchargeCheck = container.querySelector("#d-surcharge");
      const surchargeQtyInput = container.querySelector("#d-surcharge-qty");
      const surchargeQtyRow = container.querySelector("#surcharge-qty-row");
      const scanTypeSelect = container.querySelector("#d-scan-type");
      const scanQtyInput = container.querySelector("#d-scan-qty");
      const scanQtyRow = container.querySelector("#scan-qty-row");
      const calculateBtn = container.querySelector("#d-calculate");
      const addToCartBtn = container.querySelector("#d-add-to-cart");
      const resultDisplay = container.querySelector("#d-result-display");
      const totalPriceSpan = container.querySelector("#d-total-price");
      const expressHint = container.querySelector("#d-express-hint");
      container.querySelectorAll(".option-card").forEach((card) => {
        const toggleCard = () => {
          const isChecked = card.dataset.checked === "true";
          card.dataset.checked = String(!isChecked);
          card.classList.toggle("checked", !isChecked);
          card.setAttribute("aria-checked", String(!isChecked));
          const checkbox = card.querySelector("input[type='checkbox']");
          if (checkbox) checkbox.checked = !isChecked;
          if (card.id === "d-surcharge-card") {
            surchargeQtyRow.style.display = !isChecked ? "flex" : "none";
          }
        };
        card.addEventListener("click", toggleCard);
        card.addEventListener("keydown", (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggleCard();
          }
        });
      });
      scanTypeSelect.onchange = () => {
        scanQtyRow.style.display = scanTypeSelect.value !== "none" ? "flex" : "none";
      };
      let currentResult = null;
      let currentOptions = null;
      calculateBtn.onclick = () => {
        currentOptions = {
          mode: modeSelect.value,
          format: formatSelect.value,
          printQty: parseInt(printQtyInput.value) || 0,
          email: emailCheck.checked,
          surcharge: surchargeCheck.checked,
          surchargeQty: parseInt(surchargeQtyInput.value) || 0,
          scanType: scanTypeSelect.value,
          scanQty: parseInt(scanQtyInput.value) || 0,
          express: ctx.expressMode
        };
        try {
          const result = calculateDrukA4A3Skan(currentOptions, pricing);
          currentResult = result;
          totalPriceSpan.innerText = formatPLN(result.totalPrice);
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Druk A4/A3 + skan");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const timestamp = Date.now();
          const expressFactor = ctx.expressMode ? 1.2 : 1;
          if (currentOptions.printQty > 0 || currentOptions.scanQty > 0 && currentOptions.scanType !== "none") {
            const details = [];
            if (currentOptions.printQty > 0) {
              details.push(`${currentOptions.printQty} str. ${currentOptions.format.toUpperCase()} (${currentOptions.mode === "bw" ? "CZ-B" : "KOLOR"})`);
            }
            if (currentOptions.scanQty > 0 && currentOptions.scanType !== "none") {
              details.push(`Skan ${currentOptions.scanType}: ${currentOptions.scanQty} str.`);
            }
            if (ctx.expressMode) details.push("EXPRESS");
            const mainPrice = (currentResult.totalPrintPrice + currentResult.totalScanPrice) * expressFactor;
            ctx.cart.addItem({
              id: `druk-${timestamp}-main`,
              category: "Druk A4/A3 + skan",
              name: `${currentOptions.format.toUpperCase()} ${currentOptions.mode === "bw" ? "CZ-B" : "KOLOR"}`,
              quantity: currentOptions.printQty || currentOptions.scanQty,
              unit: currentOptions.printQty > 0 ? "str." : "skan",
              unitPrice: mainPrice / (currentOptions.printQty || currentOptions.scanQty),
              isExpress: ctx.expressMode,
              totalPrice: parseFloat(mainPrice.toFixed(2)),
              optionsHint: details.join(", "),
              payload: { ...currentResult, type: "main" }
            });
          }
          if (currentOptions.email) {
            const emailPrice = currentResult.emailPrice * expressFactor;
            ctx.cart.addItem({
              id: `email-${timestamp}-email`,
              category: "Druk A4/A3 + skan",
              name: "Wysy\u0142ka e-mail",
              quantity: 1,
              unit: "szt.",
              unitPrice: emailPrice,
              isExpress: ctx.expressMode,
              totalPrice: parseFloat(emailPrice.toFixed(2)),
              optionsHint: ctx.expressMode ? "EXPRESS" : "",
              payload: { price: emailPrice, type: "email" }
            });
          }
          if (currentOptions.surcharge && currentOptions.surchargeQty > 0) {
            const surchargePrice = currentResult.surchargePrice * expressFactor;
            ctx.cart.addItem({
              id: `surcharge-${timestamp}-surcharge`,
              category: "Druk A4/A3 + skan",
              name: "Zadruk >25% - dop\u0142ata",
              quantity: currentOptions.surchargeQty,
              unit: "str.",
              unitPrice: surchargePrice / currentOptions.surchargeQty,
              isExpress: ctx.expressMode,
              totalPrice: parseFloat(surchargePrice.toFixed(2)),
              optionsHint: `${currentOptions.surchargeQty} str. (+50%), ${ctx.expressMode ? "EXPRESS" : ""}`,
              payload: { price: surchargePrice, type: "surcharge" }
            });
          }
        }
      };
    }
  };

  // src/categories/druk-cad.ts
  function calculateDrukCAD(options, pricing) {
    const res = calculateCad({
      mode: options.mode,
      format: options.format,
      lengthMm: options.lengthMm,
      qty: options.qty || 1
    });
    let totalPrice = res.total;
    if (options.express) {
      totalPrice = res.total * (1 + resolveStoredPrice("modifier-express", 0.2));
    }
    return {
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      basePrice: res.total,
      detectedType: res.detectedType,
      isMeter: res.detectedType === "mb",
      rate: res.rate
    };
  }
  var _cadPrice = getPrice("drukCAD.price");
  var _cadBase = getPrice("drukCAD.base");

  // src/ui/views/druk-cad.ts
  var DrukCADView = {
    id: "druk-cad",
    name: "Druk CAD wielkoformatowy",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/druk-cad.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const catData = categories_default.find((c) => c.id === "druk-cad");
      if (!catData) return;
      const modeSelect = container.querySelector("#cad-mode");
      const formatSelect = container.querySelector("#cad-format");
      const lengthInput = container.querySelector("#cad-length");
      const qtySheetsInput = container.querySelector("#qty-sheets");
      const qtySheetsGroup = container.querySelector("#qty-sheets-group");
      const useBaseBtn = container.querySelector("#cad-use-base");
      const baseInfo = container.querySelector("#cad-base-info");
      const calculateBtn = container.querySelector("#cad-calculate");
      const addToCartBtn = container.querySelector("#cad-add-to-cart");
      const resultDisplay = container.querySelector("#cad-result-display");
      const priceTypeSpan = container.querySelector("#cad-price-type");
      const totalPriceSpan = container.querySelector("#cad-total-price");
      const expressHint = container.querySelector("#cad-express-hint");
      const updateUI = () => {
        const format = formatSelect.value;
        const mode = modeSelect.value;
        const baseLen = catData.format_prices[mode][format].length;
        baseInfo.innerText = `Wymiar bazowy: ${baseLen} mm`;
        const currentLen = parseInt(lengthInput.value) || 0;
        const isFormatowe = Math.abs(currentLen - baseLen) <= 0.5;
        qtySheetsGroup.style.display = isFormatowe ? "grid" : "none";
        return baseLen;
      };
      formatSelect.onchange = updateUI;
      modeSelect.onchange = updateUI;
      lengthInput.oninput = updateUI;
      useBaseBtn.onclick = () => {
        lengthInput.value = updateUI().toString();
        updateUI();
      };
      updateUI();
      let currentResult = null;
      let currentOptions = null;
      calculateBtn.onclick = () => {
        currentOptions = {
          mode: modeSelect.value,
          format: formatSelect.value,
          lengthMm: parseInt(lengthInput.value) || 0,
          qty: parseInt(qtySheetsInput.value) || 1,
          express: ctx.expressMode
        };
        try {
          const result = calculateDrukCAD(currentOptions, catData);
          currentResult = result;
          priceTypeSpan.innerText = result.isMeter ? "Cena metrowa:" : "Cena formatowa:";
          totalPriceSpan.innerText = formatPLN(result.totalPrice);
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Druk CAD");
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const qtyLabel = currentResult.isMeter ? "" : `${currentOptions.qty} szt, `;
          const opts = [
            `${currentOptions.format} (${currentOptions.mode === "bw" ? "CZ-B" : "KOLOR"})`,
            `${qtyLabel}${currentOptions.lengthMm} mm`,
            ctx.expressMode ? "EXPRESS" : ""
          ].filter(Boolean).join(", ");
          ctx.cart.addItem({
            id: `cad-${Date.now()}`,
            category: "Druk CAD wielkoformatowy",
            name: `${currentOptions.format} ${currentOptions.mode === "bw" ? "CZ-B" : "KOLOR"}`,
            quantity: currentOptions.lengthMm,
            unit: "mm",
            unitPrice: currentResult.basePrice / currentOptions.lengthMm,
            isExpress: ctx.expressMode,
            totalPrice: currentResult.totalPrice,
            optionsHint: opts,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/laminowanie.ts
  var prices3 = getPrice("laminowanie");
  function getLaminowanieTable(formatKey) {
    const prices4 = getPrice("laminowanie");
    const tiers = prices4.formats[formatKey];
    if (!tiers) {
      throw new Error(`Invalid format: ${formatKey}`);
    }
    return {
      id: `laminowanie-${formatKey.toLowerCase()}`,
      title: `Laminowanie ${formatKey}`,
      unit: "szt",
      pricing: "per_unit",
      tiers: overrideTiersWithStoredPrices(`laminowanie-${formatKey.toLowerCase()}`, tiers),
      modifiers: [
        { id: "express", name: "TRYB EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.2) }
      ]
    };
  }
  function quoteLaminowanie(options) {
    const table = getLaminowanieTable(options.format);
    const activeModifiers = [];
    if (options.express) activeModifiers.push("express");
    return computeTotalPrice(table, options.qty, activeModifiers);
  }

  // src/ui/views/laminowanie.ts
  var LaminowanieView = {
    id: "laminowanie",
    name: "Laminowanie",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/laminowanie.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const formatSelect = container.querySelector("#lam-format");
      const qtyInput = container.querySelector("#lam-qty");
      const calculateBtn = container.querySelector("#lam-calculate");
      const addToCartBtn = container.querySelector("#lam-add-to-cart");
      const resultDisplay = container.querySelector("#lam-result-display");
      const totalPriceSpan = container.querySelector("#lam-total-price");
      const expressHint = container.querySelector("#lam-express-hint");
      let currentResult = null;
      let currentOptions = null;
      const performCalculation = () => {
        const qty = parseInt(qtyInput.value);
        if (isNaN(qty) || qty <= 0) return;
        currentOptions = {
          format: formatSelect.value,
          qty,
          express: ctx.expressMode
        };
        try {
          const result = quoteLaminowanie(currentOptions);
          currentResult = result;
          totalPriceSpan.innerText = formatPLN(result.totalPrice);
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
          addToCartBtn.disabled = false;
          ctx.updateLastCalculated(result.totalPrice, "Laminowanie");
        } catch {
        }
      };
      calculateBtn.onclick = performCalculation;
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const expressLabel = currentOptions.express ? ", EXPRESS" : "";
          ctx.cart.addItem({
            id: `laminowanie-${Date.now()}`,
            category: "Laminowanie",
            name: `Laminowanie ${currentOptions.format}`,
            quantity: currentOptions.qty,
            unit: "szt",
            unitPrice: currentResult.totalPrice / currentOptions.qty,
            isExpress: currentOptions.express,
            totalPrice: currentResult.totalPrice,
            optionsHint: `${currentOptions.qty} szt, Format ${currentOptions.format}${expressLabel}`,
            payload: currentResult
          });
        }
      };
      [formatSelect, qtyInput].forEach((el) => {
        el.addEventListener("change", performCalculation);
      });
      qtyInput.addEventListener("input", performCalculation);
    }
  };

  // src/categories/folia-szroniona.ts
  var data7 = getPrice("foliaSzroniona");
  function calculateFoliaSzroniona(options) {
    var _a;
    const tableData = getPrice("folia-szroniona");
    const materialData = tableData.materials.find((m) => m.id === options.serviceId);
    if (!materialData) {
      throw new Error(`Unknown service: ${options.serviceId}`);
    }
    const areaM2 = options.widthMm * options.heightMm / 1e6;
    const priceTable = {
      id: tableData.id,
      title: tableData.title,
      unit: tableData.unit,
      pricing: tableData.pricing,
      rules: tableData.rules,
      tiers: overrideTiersWithStoredPrices(
        `folia-szroniona-${(_a = materialData.storageId) != null ? _a : materialData.id}`,
        materialData.tiers
      ),
      modifiers: tableData.modifiers
    };
    const activeModifiers = [];
    if (options.express) {
      activeModifiers.push("express");
    }
    const result = computeTotalPrice(priceTable, areaM2, activeModifiers);
    const isCustom = options.serviceId === "full-service" && areaM2 > 20;
    return {
      ...result,
      isCustom
    };
  }

  // src/ui/views/folia-szroniona.ts
  var FoliaSzronionaView = {
    id: "folia-szroniona",
    name: "Folia szroniona",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/folia-szroniona.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const serviceSelect = container.querySelector("#fs-service");
      const widthInput = container.querySelector("#fs-width");
      const heightInput = container.querySelector("#fs-height");
      const calculateBtn = container.querySelector("#fs-calculate");
      const addToCartBtn = container.querySelector("#fs-add-to-cart");
      const resultDisplay = container.querySelector("#fs-result-display");
      const normalResult = container.querySelector("#fs-normal-result");
      const customQuote = container.querySelector("#fs-custom-quote");
      const areaValSpan = container.querySelector("#fs-area-val");
      const unitPriceSpan = container.querySelector("#fs-unit-price");
      const totalPriceSpan = container.querySelector("#fs-total-price");
      const expressHint = container.querySelector("#fs-express-hint");
      let currentResult = null;
      let currentOptions = null;
      calculateBtn.onclick = () => {
        currentOptions = {
          serviceId: serviceSelect.value,
          widthMm: parseInt(widthInput.value) || 0,
          heightMm: parseInt(heightInput.value) || 0,
          express: ctx.expressMode
        };
        try {
          const result = calculateFoliaSzroniona(currentOptions);
          currentResult = result;
          if (result.isCustom) {
            normalResult.style.display = "none";
            customQuote.style.display = "block";
            addToCartBtn.disabled = true;
            ctx.updateLastCalculated(0, "Folia szroniona (wycena ind.)");
          } else {
            normalResult.style.display = "block";
            customQuote.style.display = "none";
            const areaM2 = currentOptions.widthMm * currentOptions.heightMm / 1e6;
            areaValSpan.innerText = `${areaM2.toFixed(2)} m2${result.effectiveQuantity > areaM2 ? " (min. 1m2)" : ""}`;
            unitPriceSpan.innerText = formatPLN(result.tierPrice);
            totalPriceSpan.innerText = formatPLN(result.totalPrice);
            addToCartBtn.disabled = false;
            ctx.updateLastCalculated(result.totalPrice, "Folia szroniona");
          }
          if (expressHint) expressHint.style.display = ctx.expressMode ? "block" : "none";
          resultDisplay.style.display = "block";
        } catch (err) {
          alert("B\u0142\u0105d: " + err.message);
        }
      };
      addToCartBtn.onclick = () => {
        if (currentResult && currentOptions) {
          const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
          const areaM2 = currentOptions.widthMm * currentOptions.heightMm / 1e6;
          const opts = [
            `${currentOptions.widthMm}x${currentOptions.heightMm} mm`,
            `${areaM2.toFixed(2)} m2`,
            ctx.expressMode ? "EXPRESS" : ""
          ].filter(Boolean).join(", ");
          ctx.cart.addItem({
            id: `fs-${Date.now()}`,
            category: "Folia szroniona",
            name: serviceName,
            quantity: areaM2,
            unit: "m2",
            unitPrice: currentResult.tierPrice,
            isExpress: ctx.expressMode,
            totalPrice: currentResult.totalPrice,
            optionsHint: opts,
            payload: currentResult
          });
        }
      };
    }
  };

  // src/categories/cad-ops.ts
  function quoteCadFold(options) {
    return calculateCadFold(options);
  }
  function quoteCadWfScan(options) {
    return calculateWfScan(options);
  }

  // src/ui/views/cad-ops.ts
  var CadOpsView = {
    id: "cad-ops",
    name: "CAD: sk\u0142adanie / skan",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/cad-ops.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const foldFormat = container.querySelector("#fold-format");
      const foldQty = container.querySelector("#fold-qty");
      const foldAddBtn = container.querySelector("#fold-add");
      foldAddBtn.onclick = () => {
        const qty = parseInt(foldQty.value);
        if (isNaN(qty) || qty <= 0) return;
        try {
          const res = quoteCadFold({ format: foldFormat.value, qty });
          const labelFmt = foldFormat.value === "A0p" ? "A0+" : foldFormat.value === "A3L" ? "A3-poprzeczne" : foldFormat.value;
          ctx.cart.addItem({
            id: `cad-fold-${Date.now()}`,
            category: "CAD",
            name: `Sk\u0142adanie (${labelFmt})`,
            quantity: qty,
            unit: "szt",
            unitPrice: res.unit,
            totalPrice: res.total,
            optionsHint: `${qty} szt.`,
            payload: res
          });
          ctx.updateLastCalculated(res.total, "Sk\u0142adanie CAD");
        } catch (err) {
          alert(err.message);
        }
      };
      const wfScanMm = container.querySelector("#wf-scan-mm");
      const wfScanQty = container.querySelector("#wf-scan-qty");
      const wfScanAddBtn = container.querySelector("#wf-scan-add");
      wfScanAddBtn.onclick = () => {
        const mm = parseInt(wfScanMm.value);
        const qty = parseInt(wfScanQty.value);
        if (isNaN(mm) || mm <= 0 || isNaN(qty) || qty <= 0) return;
        try {
          const res = quoteCadWfScan({ lengthMm: mm, qty });
          ctx.cart.addItem({
            id: `cad-wf-scan-${Date.now()}`,
            category: "CAD",
            name: "Skanowanie wielkoformatowe",
            quantity: qty,
            unit: "szt",
            unitPrice: res.unitPrice,
            totalPrice: res.total,
            optionsHint: `${qty} szt, ${mm} mm`,
            payload: res
          });
          ctx.updateLastCalculated(res.total, "Skanowanie WF");
        } catch (err) {
          alert(err.message);
        }
      };
    }
  };

  // src/categories/cad-upload.ts
  var PX_TO_MM_300DPI = 25.4 / 300;
  function detectFormatFromDimensions(widthMm, heightMm) {
    const FORMAT_TOLERANCE_CLASSIFY = 15;
    const shorter = Math.min(widthMm, heightMm);
    const longer = Math.max(widthMm, heightMm);
    console.group("\u{1F4CF} FORMAT CLASSIFICATION");
    console.log(`\u{1F4D0} Dim: ${shorter.toFixed(1)}\xD7${longer.toFixed(1)}mm`);
    function inRange(value, target) {
      return Math.abs(value - target) <= FORMAT_TOLERANCE_CLASSIFY;
    }
    if (inRange(shorter, 210)) {
      const fmt = inRange(longer, 297) ? "A4" : inRange(longer, 210) ? "A4-landscape" : null;
      if (fmt) {
        console.log(`\u2705 ${fmt}`);
        console.groupEnd();
        return { format: fmt, isFormatowy: true, isStandardWidth: true };
      }
    }
    if (inRange(shorter, 297)) {
      const fmt = inRange(longer, 420) ? "A3" : inRange(longer, 297) ? "A3-landscape" : null;
      if (fmt) {
        console.log(`\u2705 ${fmt}`);
        console.groupEnd();
        return { format: fmt, isFormatowy: true, isStandardWidth: true };
      }
    }
    if (inRange(shorter, 420)) {
      const fmt = inRange(longer, 594) ? "A2" : inRange(longer, 420) ? "A2-landscape" : null;
      if (fmt) {
        console.log(`\u2705 ${fmt}`);
        console.groupEnd();
        return { format: fmt, isFormatowy: true, isStandardWidth: true };
      }
    }
    if (inRange(shorter, 594)) {
      const fmt = inRange(longer, 841) ? "A1" : inRange(longer, 594) ? "A1-landscape" : null;
      if (fmt) {
        console.log(`\u2705 ${fmt}`);
        console.groupEnd();
        return { format: fmt, isFormatowy: true, isStandardWidth: true };
      }
    }
    if (inRange(shorter, 841)) {
      const fmt = inRange(longer, 1189) ? "A0" : inRange(longer, 841) ? "A0-landscape" : null;
      if (fmt) {
        console.log(`\u2705 ${fmt}`);
        console.groupEnd();
        return { format: fmt, isFormatowy: true, isStandardWidth: true };
      }
    }
    const customLabel = shorter > 1189 ? `A0+ (${Math.round(shorter / 10)}\xD7${Math.round(longer / 10)}cm)` : `Custom (${Math.round(shorter / 10)}\xD7${Math.round(longer / 10)}cm)`;
    console.log(`\u2705 ${customLabel}`);
    console.groupEnd();
    return {
      format: customLabel,
      isFormatowy: false,
      isStandardWidth: false
    };
  }
  function calculateCadPrintPrice(format, isColor) {
    const mode = isColor ? "color" : "bw";
    const prices4 = CAD_PRICE[mode];
    const formatPrice2 = prices4.formatowe[format];
    if (formatPrice2) return formatPrice2;
    const mbPrice = prices4.mb[format];
    return mbPrice || 0;
  }
  function calculateCadPrintPriceWithDimensions(widthMm, heightMm, format, isFormatowy, mode, qty) {
    const prices4 = CAD_PRICE[mode];
    if (isFormatowy) {
      const price2 = prices4.formatowe[format];
      if (!price2) return 0;
      return qty * price2;
    }
    const price = prices4.mb[format];
    if (!price) return 0;
    const lengthMeters = Math.max(widthMm, heightMm) / 1e3;
    return qty * lengthMeters * price;
  }
  function calculateCadFoldingPrice(format, isFormatowy, widthMm, heightMm, folding, qty) {
    if (!folding) return 0;
    if (isFormatowy) {
      const FOLD_PRICES = {
        A0p: 4,
        A0: 3,
        A1: 2,
        A2: 1.5,
        A3: 1,
        A3L: 0.7
      };
      const price = FOLD_PRICES[format];
      return price ? qty * price : 0;
    } else {
      const areaM2 = widthMm / 1e3 * (heightMm / 1e3);
      return qty * areaM2 * 2.5;
    }
  }
  function calculateCadScanningPrice(widthMm, heightMm, scanning, qty) {
    if (!scanning) return 0;
    const longerSide = Math.max(widthMm, heightMm);
    return qty * longerSide * WF_SCAN_PRICE_PER_CM;
  }
  function updateCadFileEntry(arg1, arg2) {
    if (arg1 instanceof File) {
      const file = arg1;
      const isColor = typeof arg2 === "boolean" ? arg2 : false;
      const mode2 = isColor ? "color" : "bw";
      return loadImageDimensions(file).then(({ widthPx, heightPx }) => {
        const widthMm2 = pxToMm(widthPx);
        const heightMm2 = pxToMm(heightPx);
        const fmt = detectFormatFromDimensions(widthMm2, heightMm2);
        const printPrice2 = calculateCadPrintPrice(fmt.format, isColor);
        return {
          id: Date.now(),
          name: file.name,
          widthPx,
          heightPx,
          widthMm: widthMm2,
          heightMm: heightMm2,
          format: fmt.format,
          isFormatowy: fmt.isFormatowy,
          isStandardWidth: fmt.isStandardWidth,
          folding: false,
          scanning: false,
          printPrice: printPrice2,
          foldingPrice: 0,
          scanPrice: 0,
          totalPrice: parseFloat(money(printPrice2))
        };
      }).catch(() => {
        return {
          id: Date.now(),
          name: file.name,
          widthPx: 0,
          heightPx: 0,
          widthMm: 0,
          heightMm: 0,
          format: "unknown",
          isFormatowy: false,
          isStandardWidth: false,
          folding: false,
          scanning: false,
          printPrice: 0,
          foldingPrice: 0,
          scanPrice: 0,
          totalPrice: 0
        };
      });
    }
    const entry = arg1;
    const mode = arg2 || "bw";
    const widthMm = entry.widthMm || 0;
    const heightMm = entry.heightMm || 0;
    const format = entry.format || "unknown";
    const isFormatowy = entry.isFormatowy || false;
    const qty = 1;
    const printPrice = calculateCadPrintPriceWithDimensions(widthMm, heightMm, format, isFormatowy, mode, qty);
    const foldingPrice = calculateCadFoldingPrice(format, isFormatowy, widthMm, heightMm, entry.folding || false, qty);
    const scanPrice = calculateCadScanningPrice(widthMm, heightMm, entry.scanning || false, qty);
    return {
      id: entry.id || 0,
      name: entry.name || "",
      widthPx: entry.widthPx || 0,
      heightPx: entry.heightPx || 0,
      widthMm,
      heightMm,
      format,
      isFormatowy,
      isStandardWidth: entry.isStandardWidth || false,
      folding: entry.folding || false,
      scanning: entry.scanning || false,
      printPrice,
      foldingPrice,
      scanPrice,
      totalPrice: parseFloat(money(printPrice + foldingPrice + scanPrice))
    };
  }
  function pxToMm(px) {
    return px * PX_TO_MM_300DPI;
  }
  function loadImageDimensions(file) {
    return new Promise(async (resolve, reject) => {
      if (file.type === "application/pdf") {
        try {
          const bytes = await file.arrayBuffer();
          console.log("PDF bytes:", bytes.byteLength);
          const pdfDoc = await PDFDocument.load(bytes);
          console.log("PDF loaded:", pdfDoc.getPageCount());
          const page = pdfDoc.getPage(0);
          const { width, height } = page.getSize();
          console.log("Page size:", { width, height });
          const pxPerPoint = 300 / 72;
          const widthPx = Math.round(width * pxPerPoint);
          const heightPx = Math.round(height * pxPerPoint);
          console.log("Final px:", { widthPx, heightPx });
          resolve({ widthPx, heightPx });
        } catch (err) {
          reject(new Error("Failed to load PDF"));
        }
        return;
      }
      if (!file.type.startsWith("image/")) {
        reject(new Error("Unsupported file type"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        var _a;
        const img = new Image();
        img.onload = () => {
          resolve({
            widthPx: img.naturalWidth || img.width,
            heightPx: img.naturalHeight || img.height
          });
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = (_a = e.target) == null ? void 0 : _a.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // src/ui/views/cad-upload.ts
  var CadUploadView = {
    id: "cad-upload",
    name: "CAD Upload plik\xF3w",
    async mount(container, ctx) {
      try {
        const response = await fetch("categories/cad-upload.html");
        if (!response.ok) throw new Error("Failed to load template");
        container.innerHTML = await response.text();
        this.initLogic(container, ctx);
      } catch (err) {
        container.innerHTML = `<div class="error">B\u0142\u0105d \u0142adowania: ${err}</div>`;
      }
    },
    initLogic(container, ctx) {
      const dropZone = container.querySelector("#uploadZone");
      const fileInput = container.querySelector("#cadFileInput") || container.querySelector("#fileInput");
      const dpiInput = container.querySelector("#dpiInput");
      const colorToggle = container.querySelector("#colorToggle") || container.querySelector("#cadColorToggle");
      const colorSwitch = container.querySelector("#colorSwitch");
      const tableBody = container.querySelector("#filesTableBody") || container.querySelector("#cadTableBody");
      const summaryPanel = container.querySelector("#summaryPanel") || container.querySelector("#cadSummary");
      const summaryGrid = container.querySelector("#summaryGrid");
      const grandTotal = container.querySelector("#grandTotal");
      const clearBtn = container.querySelector("#clearBtn");
      if (!dropZone || !fileInput || !tableBody) return;
      let files = [];
      let isColor = false;
      let dpi = 300;
      let nextId = 1;
      function pxToMm2(px) {
        return px * (25.4 / dpi);
      }
      function getMode() {
        return isColor ? "color" : "bw";
      }
      function recalculateFile(file) {
        return updateCadFileEntry(
          {
            id: file.id,
            name: file.name,
            widthPx: file.widthPx,
            heightPx: file.heightPx,
            widthMm: pxToMm2(file.widthPx),
            heightMm: pxToMm2(file.heightPx),
            format: file.format,
            isFormatowy: file.isFormatowy,
            isStandardWidth: file.isStandardWidth,
            folding: file.folding,
            scanning: file.scanning
          },
          getMode()
        );
      }
      function renderFiles() {
        if (!tableBody) return;
        if (files.length === 0) {
          tableBody.innerHTML = "";
          if (summaryPanel) summaryPanel.style.display = "none";
          return;
        }
        tableBody.innerHTML = files.map((file) => {
          var _a, _b, _c;
          const row = { ...file, price: file.totalPrice };
          return `
        <tr data-file-id="${file.id}">
          <td><strong>${escapeHtml(file.name)}</strong></td>
          <td>${file.widthPx} \xD7 ${file.heightPx}</td>
          <td>${((_a = row.widthMm) == null ? void 0 : _a.toFixed(1)) || "\u2014"} \xD7 ${((_b = row.heightMm) == null ? void 0 : _b.toFixed(1)) || "\u2014"} cm</td>
          <td><strong>${file.format}</strong></td>
          <td>${file.isFormatowy ? "Formatowy" : "Metr-bie\u017C\u0105cy"}</td>
          <td>
            <input type="checkbox" class="fold-check" ${file.folding ? "checked" : ""} />
          </td>
          <td>
            <input type="checkbox" class="scan-check" ${file.scanning ? "checked" : ""} />
          </td>
          <td><strong>Cena: ${((_c = row.price) == null ? void 0 : _c.toFixed(2)) || "0,00"} z\u0142</strong></td>
        </tr>
      `;
        }).join("");
        tableBody.querySelectorAll(".fold-check").forEach((el, idx) => {
          el.addEventListener("change", (e) => {
            files[idx].folding = e.target.checked;
            files[idx] = recalculateFile(files[idx]);
            renderFiles();
            renderSummary();
          });
        });
        tableBody.querySelectorAll(".scan-check").forEach((el, idx) => {
          el.addEventListener("change", (e) => {
            files[idx].scanning = e.target.checked;
            files[idx] = recalculateFile(files[idx]);
            renderFiles();
            renderSummary();
          });
        });
        renderSummary();
      }
      function renderSummary() {
        if (!summaryPanel || !summaryGrid) return;
        const totalPrint = files.reduce((sum, f) => sum + f.printPrice, 0);
        const totalFolding = files.reduce((sum, f) => sum + f.foldingPrice, 0);
        const totalScan = files.reduce((sum, f) => sum + f.scanPrice, 0);
        const grandTotalPrice = totalPrint + totalFolding + totalScan;
        summaryGrid.innerHTML = `
        <div class="summary-item">
          <span>Wydruki (${files.length} plik${files.length !== 1 ? "i/\xF3w" : ""}):</span>
          <span>${formatPLN(totalPrint)}</span>
        </div>
        <div class="summary-item">
          <span>Sk\u0142adanie:</span>
          <span>${formatPLN(totalFolding)}</span>
        </div>
        <div class="summary-item">
          <span>Skanowanie:</span>
          <span>${formatPLN(totalScan)}</span>
        </div>
        <div class="summary-item">
          <span><strong>RAZEM:</strong></span>
          <span><strong>${formatPLN(grandTotalPrice)}</strong></span>
        </div>
      `;
        if (grandTotal) {
          grandTotal.textContent = formatPLN(grandTotalPrice);
        }
        summaryPanel.style.display = files.length > 0 ? "block" : "none";
      }
      async function addFiles(fileList) {
        console.log("CAD FILES:", fileList);
        for (const file of Array.from(fileList)) {
          console.log("Processing file:", file);
          const fileEntry = await updateCadFileEntry(file);
          fileEntry.id = nextId++;
          files.push(fileEntry);
          renderFiles();
        }
      }
      if (dropZone) {
        dropZone.addEventListener("click", () => fileInput.click());
        dropZone.addEventListener("dragenter", (e) => {
          e.preventDefault();
          dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragover", (e) => {
          e.preventDefault();
          dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragleave", (e) => {
          if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove("drag-over");
          }
        });
        dropZone.addEventListener("drop", (e) => {
          var _a, _b;
          console.log("*** CAD UPLOAD HANDLER FIRED ***", ((_b = (_a = e.dataTransfer) == null ? void 0 : _a.files) == null ? void 0 : _b.length) || 0);
          e.preventDefault();
          dropZone.classList.remove("drag-over");
          void addFiles(e.dataTransfer.files);
        });
      }
      fileInput.addEventListener("change", (e) => {
        var _a;
        console.log("*** CAD UPLOAD HANDLER FIRED ***", ((_a = e.target.files) == null ? void 0 : _a.length) || 0);
        const targetFiles = e.target.files;
        void addFiles(targetFiles);
      });
      if (colorToggle) {
        colorToggle.addEventListener("click", () => {
          isColor = !isColor;
          colorSwitch == null ? void 0 : colorSwitch.classList.toggle("active", isColor);
          files = files.map(recalculateFile);
          renderFiles();
        });
      }
      if (dpiInput) {
        dpiInput.addEventListener("change", (e) => {
          dpi = parseInt(e.target.value) || 300;
          files = files.map((f) => {
            f.widthMm = pxToMm2(f.widthPx);
            f.heightMm = pxToMm2(f.heightPx);
            const fmt = detectFormatFromDimensions(f.widthMm, f.heightMm);
            f.format = fmt.format;
            f.isFormatowy = fmt.isFormatowy;
            f.isStandardWidth = fmt.isStandardWidth;
            return recalculateFile(f);
          });
          renderFiles();
        });
      }
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          files = [];
          fileInput.value = "";
          renderFiles();
        });
      }
      renderFiles();
    },
    unmount() {
    }
  };
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // src/core/cart.ts
  var Cart = class {
    constructor() {
      this.items = [];
      this.storageKey = "razdwa-cart-v1";
      this.load();
    }
    load() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.items = JSON.parse(saved);
        }
      } catch {
        this.items = [];
      }
    }
    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch {
      }
    }
    addItem(item) {
      this.items.push(item);
      this.save();
    }
    removeItem(index) {
      if (index >= 0 && index < this.items.length) {
        this.items.splice(index, 1);
        this.save();
      }
    }
    clear() {
      this.items = [];
      this.save();
    }
    getItems() {
      return [...this.items];
    }
    getGrandTotal() {
      return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }
    isEmpty() {
      return this.items.length === 0;
    }
  };

  // src/ui/excel.ts
  function downloadExcel(cartItems, customer) {
    if (typeof XLSX === "undefined") {
      alert("B\u0142\u0105d: Biblioteka Excel nie zosta\u0142a wczytana.");
      return;
    }
    const data8 = cartItems.map((item) => ({
      "Kategoria": item.category,
      "Nazwa": item.name,
      "Ilo\u015B\u0107": item.quantity,
      "Jednostka": item.unit,
      "Cena jedn.": item.unitPrice,
      "Express (+20%)": item.isExpress ? "TAK" : "NIE",
      "Cena ca\u0142kowita": item.totalPrice,
      "Klient": customer.name,
      "Telefon": customer.phone,
      "Email": customer.email,
      "Priorytet": customer.priority
    }));
    const worksheet = XLSX.utils.json_to_sheet(data8);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Zam\xF3wienie");
    const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const filename = `Zamowienie_${customer.name.replace(/\s+/g, "_")}_${date}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

  // src/ui/main.ts
  var cart = new Cart();
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2e3);
  }
  function updateCartUI() {
    const listEl = document.getElementById("basketList");
    const totalEl = document.getElementById("basketTotal");
    const debugEl = document.getElementById("basketDebug");
    if (!listEl || !totalEl || !debugEl) return;
    const items = cart.getItems();
    if (items.length === 0) {
      listEl.innerHTML = `
      <div class="basketItem">
        <div>
          <div class="basketTitle">Brak pozycji</div>
          <div class="basketMeta">Kliknij \u201EDodaj\u201D, aby zbudowa\u0107 list\u0119.</div>
        </div>
        <div class="basketPrice">\u2014</div>
      </div>
    `;
    } else {
      listEl.innerHTML = items.map((item, idx) => `
      <div class="basketItem">
        <div style="min-width:0;">
          <div class="basketTitle">${item.category}: ${item.name}</div>
          <div class="basketMeta">${item.optionsHint} (${item.quantity} ${item.unit})</div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="basketPrice">${formatPLN(item.totalPrice)}</div>
          <button class="iconBtn" data-remove-idx="${idx}" title="Usu\u0144">\xD7</button>
        </div>
      </div>
    `).join("");
    }
    const total = cart.getGrandTotal();
    totalEl.innerText = formatPLN(total);
    debugEl.innerText = JSON.stringify(items.map((i) => i.payload), null, 2);
  }
  document.addEventListener("DOMContentLoaded", () => {
    var _a, _b, _c;
    const viewContainer = document.getElementById("viewContainer");
    const categorySelector = document.getElementById("categorySelector");
    const categorySearch = document.getElementById("categorySearch");
    const globalExpress = document.getElementById("globalExpress");
    document.addEventListener("click", (e) => {
      var _a2;
      const btn = e.target.closest("[data-remove-idx]");
      if (btn) {
        const idx = parseInt((_a2 = btn.dataset.removeIdx) != null ? _a2 : "", 10);
        if (!isNaN(idx)) {
          cart.removeItem(idx);
          updateCartUI();
        }
      }
    });
    document.addEventListener("razdwa:addToCart", (e) => {
      console.log("\u{1F3AF} razdwa:addToCart event received:", e);
      const customEvent = e;
      const detail = customEvent.detail || {};
      const category = detail.category || "Inne";
      const totalPrice = detail.totalPrice || 0;
      console.log(`\u{1F4E6} Adding: ${category} - ${totalPrice} z\u0142`);
      const cartItem = {
        id: `${category.toLowerCase().replace(/[^\w]+/g, "-")}-${Date.now()}`,
        category,
        name: category,
        quantity: 1,
        unit: "szt",
        unitPrice: totalPrice,
        isExpress: (globalExpress == null ? void 0 : globalExpress.checked) || false,
        totalPrice: totalPrice * ((globalExpress == null ? void 0 : globalExpress.checked) ? 1.2 : 1),
        optionsHint: detail.description || "",
        payload: detail
      };
      cart.addItem(cartItem);
      updateCartUI();
      showToast("\u2713 Dodano do listy");
    });
    if (!viewContainer || !categorySelector || !globalExpress || !categorySearch) return;
    const getCtx = () => ({
      cart: {
        addItem: (item) => {
          console.log("\u{1F6D2} cart.addItem called:", item);
          cart.addItem(item);
          console.log("\u{1F4CB} Updating cart UI...");
          updateCartUI();
          showToast("\u2713 Dodano do listy");
        }
      },
      addToBasket: (item) => {
        console.log("\u{1F4CC} addToBasket called:", item);
        const cartItem = {
          id: `${item.category}-${Date.now()}`,
          category: item.category,
          name: item.category,
          quantity: 1,
          unit: "szt",
          unitPrice: item.price,
          isExpress: globalExpress.checked,
          totalPrice: item.price * (globalExpress.checked ? 1.2 : 1),
          optionsHint: item.description,
          payload: { originalPrice: item.price, description: item.description }
        };
        cart.addItem(cartItem);
        updateCartUI();
        showToast("\u2713 Dodano do listy");
      },
      expressMode: globalExpress.checked,
      updateLastCalculated: (price, hint) => {
        const currentPriceEl = document.getElementById("currentPrice");
        const currentHintEl = document.getElementById("currentHint");
        if (currentPriceEl) currentPriceEl.innerText = formatPLN(price);
        if (currentHintEl) currentHintEl.innerText = hint ? `(${hint})` : "";
      }
    });
    const router = new Router(viewContainer, getCtx);
    router.setCategories(categories_default);
    router.addRoute(PlakatyView);
    router.addRoute(DrukA4A3SkanView);
    router.addRoute(DrukCADView);
    router.addRoute(SolwentPlakatyView);
    router.addRoute(VoucheryView);
    router.addRoute(DyplomyView);
    router.addRoute(WizytowkiView);
    router.addRoute(RollUpView);
    router.addRoute(ZaproszeniaKredaView);
    router.addRoute(UlotkiCyfroweView);
    router.addRoute(BannerView);
    router.addRoute(WlepkiView);
    router.addRoute(LaminowanieView);
    router.addRoute(FoliaSzronionaView);
    router.addRoute(CadOpsView);
    router.addRoute(CadUploadView);
    categories_default.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.innerText = `${cat.icon} ${cat.name}`;
      if (!cat.implemented) {
        opt.disabled = true;
        opt.innerText += " (wkr\xF3tce)";
      }
      categorySelector.appendChild(opt);
    });
    categorySelector.addEventListener("change", () => {
      const val = categorySelector.value;
      if (val) {
        window.location.hash = `#/${val}`;
      } else {
        window.location.hash = "#/";
      }
    });
    categorySearch.addEventListener("input", () => {
      const filter = categorySearch.value.toLowerCase();
      const options = Array.from(categorySelector.options);
      options.forEach((opt, idx) => {
        if (idx === 0) return;
        const text = opt.text.toLowerCase();
        opt.hidden = !text.includes(filter);
      });
    });
    categorySearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const filter = categorySearch.value.toLowerCase();
        const firstVisible = Array.from(categorySelector.options).find((opt, idx) => {
          return idx > 0 && !opt.hidden && !opt.disabled;
        });
        if (firstVisible) {
          categorySelector.value = firstVisible.value;
          window.location.hash = `#/${firstVisible.value}`;
          categorySearch.value = "";
        }
      }
    });
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash || "#/";
      const path = hash.slice(2);
      categorySelector.value = path;
    });
    globalExpress.addEventListener("change", () => {
      const orderSummary = document.getElementById("orderSummary");
      if (orderSummary) {
        orderSummary.classList.toggle("is-express", globalExpress.checked);
      }
      const currentHash = window.location.hash;
      window.location.hash = "";
      window.location.hash = currentHash;
    });
    (_a = document.getElementById("copyBtn")) == null ? void 0 : _a.addEventListener("click", () => {
      var _a2;
      const total = document.getElementById("basketTotal");
      const text = total ? `Suma: ${total.innerText}` : "Brak pozycji";
      (_a2 = navigator.clipboard) == null ? void 0 : _a2.writeText(text);
    });
    (_b = document.getElementById("clearBtn")) == null ? void 0 : _b.addEventListener("click", () => {
      cart.clear();
      updateCartUI();
    });
    (_c = document.getElementById("sendBtn")) == null ? void 0 : _c.addEventListener("click", () => {
      const customer = {
        name: document.getElementById("custName").value || "Anonim",
        phone: document.getElementById("custPhone").value || "-",
        email: document.getElementById("custEmail").value || "-",
        priority: document.getElementById("custPriority").value
      };
      if (cart.isEmpty()) {
        alert("Lista jest pusta!");
        return;
      }
      downloadExcel(cart.getItems(), customer);
    });
    updateCartUI();
    router.start();
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").then(() => {
      }).catch(() => {
      });
    });
  }
})();
