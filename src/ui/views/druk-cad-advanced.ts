import { View, ViewContext } from "../types";
import { formatPLN } from "../../core/money";
import { priceStore } from "../../core/price-store";

export const DrukCADAdvancedView: View = {
  id: "druk-cad",
  name: "Druk CAD wielkoformatowy",
  async mount(container, ctx) {
    try {
      const response = await fetch("categories/druk-cad-advanced.html");
      if (!response.ok) throw new Error("Failed to load template");
      container.innerHTML = await response.text();

      this.initLogic(container, ctx);
    } catch (err) {
      container.innerHTML = `<div class="error">Błąd ładowania: ${err}</div>`;
    }
  },

  initLogic(container: HTMLElement, ctx: ViewContext) {
    const ps = priceStore;
    const cat = "CAD";
    const PRICES: any = {
      formatowe: {
        czb: {
          A3: ps.register("cad-f-czb-A3", cat, "CAD A3 CZB", 2.50),
          A2: ps.register("cad-f-czb-A2", cat, "CAD A2 CZB", 4.00),
          A1: ps.register("cad-f-czb-A1", cat, "CAD A1 CZB", 6.00),
          A0: ps.register("cad-f-czb-A0", cat, "CAD A0 CZB", 11.00),
          'A0+': ps.register("cad-f-czb-A0p", cat, "CAD A0+ CZB", 12.50)
        },
        kolor: {
          A3: ps.register("cad-f-kol-A3", cat, "CAD A3 Kolor", 5.30),
          A2: ps.register("cad-f-kol-A2", cat, "CAD A2 Kolor", 8.50),
          A1: ps.register("cad-f-kol-A1", cat, "CAD A1 Kolor", 12.00),
          A0: ps.register("cad-f-kol-A0", cat, "CAD A0 Kolor", 24.00),
          'A0+': ps.register("cad-f-kol-A0p", cat, "CAD A0+ Kolor", 26.00)
        }
      },
      nieformatowe: {
        czb: {
          297: ps.register("cad-n-czb-297", cat, "CAD 297mm CZB (zł/mb)", 3.50),
          420: ps.register("cad-n-czb-420", cat, "CAD 420mm CZB (zł/mb)", 4.50),
          594: ps.register("cad-n-czb-594", cat, "CAD 594mm CZB (zł/mb)", 5.00),
          841: ps.register("cad-n-czb-841", cat, "CAD 841mm CZB (zł/mb)", 9.00),
          914: ps.register("cad-n-czb-914", cat, "CAD 914mm CZB (zł/mb)", 10.00),
          1067: ps.register("cad-n-czb-1067", cat, "CAD 1067mm CZB (zł/mb)", 12.50)
        },
        kolor: {
          297: ps.register("cad-n-kol-297", cat, "CAD 297mm Kolor (zł/mb)", 12.00),
          420: ps.register("cad-n-kol-420", cat, "CAD 420mm Kolor (zł/mb)", 13.90),
          594: ps.register("cad-n-kol-594", cat, "CAD 594mm Kolor (zł/mb)", 14.50),
          841: ps.register("cad-n-kol-841", cat, "CAD 841mm Kolor (zł/mb)", 20.00),
          914: ps.register("cad-n-kol-914", cat, "CAD 914mm Kolor (zł/mb)", 21.00),
          1067: ps.register("cad-n-kol-1067", cat, "CAD 1067mm Kolor (zł/mb)", 30.00)
        }
      },
      skladanie: {
        formatowe: {
          A3: ps.register("cad-s-f-A3", cat, "CAD Składanie A3", 1.00),
          'A3-poprzeczne': ps.register("cad-s-f-A3p", cat, "CAD Składanie A3L", 0.70),
          A2: ps.register("cad-s-f-A2", cat, "CAD Składanie A2", 1.50),
          A1: ps.register("cad-s-f-A1", cat, "CAD Składanie A1", 2.00),
          A0: ps.register("cad-s-f-A0", cat, "CAD Składanie A0", 3.00),
          'A0+': ps.register("cad-s-f-A0p", cat, "CAD Składanie A0+", 4.00)
        },
        nieformatowe: ps.register("cad-s-n", cat, "CAD Składanie mb (zł/m2)", 2.50)
      },
      skanowanie: ps.register("cad-skan", cat, "CAD Skanowanie (zł/cm)", 0.08)
    };

    const FORMATS: any = {
      'A3': [297, 420],
      'A2': [420, 594],
      'A1': [594, 841],
      'A0': [841, 1189],
      'A0+': [914, 1292]
    };

    const STANDARD_WIDTHS = [297, 420, 594, 841, 914, 1067];
    const TOLERANCE = 5;

    let filesData: any[] = [];
    let isColor = false;
    let dpi = 300;

    const fileInput = container.querySelector('#fileInput') as HTMLInputElement;
    const uploadZone = container.querySelector('#uploadZone') as HTMLElement;
    const dpiInput = container.querySelector('#dpiInput') as HTMLInputElement;
    const colorToggle = container.querySelector('#colorToggle') as HTMLElement;
    const colorSwitch = container.querySelector('#colorSwitch') as HTMLElement;
    const filesTableWrapper = container.querySelector('#filesTableWrapper') as HTMLElement;
    const filesTableBody = container.querySelector('#filesTableBody') as HTMLElement;
    const summaryPanel = container.querySelector('#summaryPanel') as HTMLElement;
    const summaryGrid = container.querySelector('#summaryGrid') as HTMLElement;
    const clearBtn = container.querySelector('#clearBtn') as HTMLElement;
    const addAllToCartBtn = container.querySelector('#add-all-to-cart') as HTMLElement;

    const pxToMm = (px: number, dpi: number) => (px * 25.4) / dpi;
    const findClosestWidth = (width: number) => STANDARD_WIDTHS.reduce((prev, curr) => Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev);
    const isStandardWidth = (width: number) => STANDARD_WIDTHS.includes(Math.round(width));

    const detectFormat = (widthMm: number, heightMm: number) => {
      const w = Math.round(widthMm);
      const h = Math.round(heightMm);
      const [minDim, maxDim] = w < h ? [w, h] : [h, w];

      if (!isStandardWidth(minDim)) {
        return { format: `${minDim}mm`, isFormatowy: false, isStandardWidth: false, widthCategory: findClosestWidth(minDim) };
      }

      for (const [name, dims] of Object.entries(FORMATS)) {
        const [fw, fh] = dims as [number, number];
        if (minDim === fw) {
          const isWithinTolerance = Math.abs(maxDim - fh) <= TOLERANCE;
          return { format: name, isFormatowy: isWithinTolerance, isStandardWidth: true, widthCategory: fw, actualLength: maxDim, standardLength: fh };
        }
      }

      return { format: `${minDim}×${maxDim}`, isFormatowy: false, isStandardWidth: true, widthCategory: minDim };
    };

    const calculatePrintPrice = (fileData: any) => {
      const mode = isColor ? 'kolor' : 'czb';
      const { format, isFormatowy, widthCategory } = fileData.formatInfo;
      if (isFormatowy) {
        return PRICES.formatowe[mode][format] || 0;
      } else {
        const pricePerMb = PRICES.nieformatowe[mode][widthCategory] || 0;
        const lengthMeters = Math.max(fileData.widthMm, fileData.heightMm) / 1000;
        return pricePerMb * lengthMeters;
      }
    };

    const calculateFoldingPrice = (fileData: any) => {
      if (!fileData.folding) return 0;
      const { format, isFormatowy } = fileData.formatInfo;
      if (isFormatowy) {
        return PRICES.skladanie.formatowe[format] || 0;
      } else {
        const areaM2 = (fileData.widthMm / 1000) * (fileData.heightMm / 1000);
        return PRICES.skladanie.nieformatowe * areaM2;
      }
    };

    const calculateScanPrice = (fileData: any) => {
      if (!fileData.scanning) return 0;
      const longerSide = Math.max(fileData.widthMm, fileData.heightMm);
      return (PRICES.skanowanie * longerSide) / 10; // Cennik mówi 0.08 zł/mm? W linku było 0.08.
    };

    const updateDisplay = () => {
      if (filesData.length === 0) {
        filesTableWrapper.style.display = 'none';
        summaryPanel.style.display = 'none';
        return;
      }

      filesTableWrapper.style.display = 'block';
      summaryPanel.style.display = 'block';

      filesTableBody.innerHTML = filesData.map((file, idx) => {
        const printPrice = calculatePrintPrice(file);
        const foldingPrice = calculateFoldingPrice(file);
        const scanPrice = calculateScanPrice(file);
        const totalPrice = (printPrice + foldingPrice + scanPrice) * (ctx.expressMode ? 1.2 : 1);

        const { format, isFormatowy, isStandardWidth } = file.formatInfo;
        const typeBadge = !isStandardWidth ? '<span class="badge badge-warning">⚠️ Niestandard</span>' : (isFormatowy ? '<span class="badge badge-formatowy">Format</span>' : '<span class="badge badge-nieformatowy">MB</span>');

        return `
          <tr>
            <td>${file.name}</td>
            <td>${Math.round(file.widthMm)}×${Math.round(file.heightMm)}</td>
            <td><strong>${format}</strong></td>
            <td>${typeBadge}</td>
            <td><input type="checkbox" ${file.folding ? 'checked' : ''} data-idx="${idx}" class="fold-check"></td>
            <td><input type="checkbox" ${file.scanning ? 'checked' : ''} data-idx="${idx}" class="scan-check"></td>
            <td><strong>${totalPrice.toFixed(2)} zł</strong></td>
          </tr>
        `;
      }).join('');

      // Attach dynamic listeners
      container.querySelectorAll('.fold-check').forEach(el => {
        el.addEventListener('change', (e: any) => {
          filesData[parseInt(e.target.dataset.idx)].folding = e.target.checked;
          updateDisplay();
        });
      });
      container.querySelectorAll('.scan-check').forEach(el => {
        el.addEventListener('change', (e: any) => {
          filesData[parseInt(e.target.dataset.idx)].scanning = e.target.checked;
          updateDisplay();
        });
      });

      let total = 0;
      filesData.forEach(f => {
        total += (calculatePrintPrice(f) + calculateFoldingPrice(f) + calculateScanPrice(f)) * (ctx.expressMode ? 1.2 : 1);
      });

      summaryGrid.innerHTML = `
        <div class="summary-item"><span>Liczba plików:</span><span>${filesData.length}</span></div>
        <div class="summary-item"><span>Razem brutto:</span><strong>${total.toFixed(2)} zł</strong></div>
      `;

      ctx.updateLastCalculated(total, `Druk CAD (${filesData.length} plików)`);
    };

    uploadZone.onclick = () => fileInput.click();
    fileInput.onchange = (e: any) => {
      const files = e.target.files;
      for (const file of files) {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          const img = new Image();
          const reader = new FileReader();
          reader.onload = (re: any) => {
            img.onload = () => {
              const widthMm = pxToMm(img.width, dpi);
              const heightMm = pxToMm(img.height, dpi);
              filesData.push({
                name: file.name,
                widthPx: img.width, heightPx: img.height,
                widthMm, heightMm,
                formatInfo: detectFormat(widthMm, heightMm),
                folding: false, scanning: false
              });
              updateDisplay();
            };
            img.src = re.target.result;
          };
          reader.readAsDataURL(file);
        } else {
           // Mock for CAD files as in user script
           const widthMm = pxToMm(2480, dpi);
           const heightMm = pxToMm(3508, dpi);
           filesData.push({
             name: file.name,
             widthPx: 2480, heightPx: 3508,
             widthMm, heightMm,
             formatInfo: detectFormat(widthMm, heightMm),
             folding: false, scanning: false
           });
           updateDisplay();
        }
      }
    };

    colorToggle.onclick = () => {
      isColor = !isColor;
      colorSwitch.classList.toggle('active');
      updateDisplay();
    };

    dpiInput.onchange = () => {
      dpi = parseInt(dpiInput.value) || 300;
      filesData = filesData.map(f => {
        const w = pxToMm(f.widthPx, dpi);
        const h = pxToMm(f.heightPx, dpi);
        return { ...f, widthMm: w, heightMm: h, formatInfo: detectFormat(w, h) };
      });
      updateDisplay();
    };

    clearBtn.onclick = () => {
      filesData = [];
      updateDisplay();
    };

    addAllToCartBtn.onclick = () => {
      filesData.forEach(file => {
        const printPrice = calculatePrintPrice(file);
        const foldingPrice = calculateFoldingPrice(file);
        const scanPrice = calculateScanPrice(file);
        const totalPrice = (printPrice + foldingPrice + scanPrice) * (ctx.expressMode ? 1.2 : 1);

        ctx.cart.addItem({
          id: `cad-${Date.now()}-${Math.random()}`,
          category: "Druk CAD",
          name: file.name,
          quantity: 1,
          unit: "szt.",
          unitPrice: totalPrice,
          isExpress: ctx.expressMode,
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          optionsHint: `${file.formatInfo.format} (${isColor ? 'Kolor' : 'CZ-B'}), ${file.folding ? 'Składanie' : ''}`,
          payload: file
        });
      });
      alert(`Dodano ${filesData.length} plików do koszyka.`);
    };
  }
};
