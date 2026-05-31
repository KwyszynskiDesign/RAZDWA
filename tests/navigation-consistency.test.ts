/**
 * Spójność nawigacji: sidebar ↔ router home tiles ↔ view IDs.
 *
 * Oba zestawy ID są przepisane ręcznie z:
 *   - docs/index.html  (.category-nav-button href="#/<id>")
 *   - src/ui/router.ts (groupedHomeTiles[].ids)
 *
 * Jeśli dodajesz nową kategorię, zaktualizuj oba zestawy poniżej.
 */
import { describe, it, expect } from "vitest";
import { BroszuryKatalogiView } from "../src/ui/views/broszury-katalogi";
import { ZaproszeniaKredaView } from "../src/ui/views/zaproszenia-kreda";
import { DyplomyView } from "../src/ui/views/dyplomy";
import { VoucheryView } from "../src/ui/views/vouchery";
import { PlakatyWFView } from "../src/ui/views/plakaty-wf";

const SIDEBAR_IDS = new Set([
  "druk-a4-a3",
  "ulotki-cyfrowe",
  "wizytowki-druk-cyfrowy",
  "dyplomy",
  "zaproszenia-kreda",
  "vouchery",
  "plakaty-a4-a3",
  "broszury-katalogi",
  "druk-cad",
  "cad-upload",
  "plakaty",
  "banner",
  "canvas",
  "roll-up",
  "wlepki-naklejki",
  "folia-szroniona",
  "wycinanie-folii",
  "laminowanie",
  "wydruki-specjalne",
  "artykuly-biurowe",
  "uslugi",
  "zamowienia-zewnetrzne",
]);

const ROUTER_TILE_IDS = new Set([
  "druk-a4-a3",
  "ulotki-cyfrowe",
  "wizytowki-druk-cyfrowy",
  "dyplomy",
  "zaproszenia-kreda",
  "vouchery",
  "plakaty-a4-a3",
  "broszury-katalogi",
  "druk-cad",
  "cad-upload",
  "plakaty",
  "banner",
  "canvas",
  "roll-up",
  "wlepki-naklejki",
  "folia-szroniona",
  "wycinanie-folii",
  "laminowanie",
  "wydruki-specjalne",
  "artykuly-biurowe",
  "uslugi",
  "zamowienia-zewnetrzne",
]);

describe("Navigation consistency – sidebar ↔ router home tiles", () => {
  it("sidebar contains all router tile IDs", () => {
    for (const id of ROUTER_TILE_IDS) {
      expect(SIDEBAR_IDS.has(id), `Sidebar missing router tile id: '${id}'`).toBe(true);
    }
  });

  it("router home tiles contain all sidebar IDs", () => {
    for (const id of SIDEBAR_IDS) {
      expect(ROUTER_TILE_IDS.has(id), `Router home tiles missing sidebar id: '${id}'`).toBe(true);
    }
  });
});

const KEY_VIEWS = [
  { view: BroszuryKatalogiView, expectedId: "broszury-katalogi" },
  { view: ZaproszeniaKredaView, expectedId: "zaproszenia-kreda" },
  { view: DyplomyView, expectedId: "dyplomy" },
  { view: VoucheryView, expectedId: "vouchery" },
  { view: PlakatyWFView, expectedId: "plakaty" },
] as const;

describe("Navigation consistency – view IDs", () => {
  for (const { view, expectedId } of KEY_VIEWS) {
    it(`${expectedId}: view.id matches expected ID`, () => {
      expect(view.id).toBe(expectedId);
    });

    it(`${expectedId}: view.id present in sidebar`, () => {
      expect(SIDEBAR_IDS.has(expectedId)).toBe(true);
    });

    it(`${expectedId}: view.id present in router home tiles`, () => {
      expect(ROUTER_TILE_IDS.has(expectedId)).toBe(true);
    });

    it(`${expectedId}: view.id does not contain .html (avoids double-extension bug)`, () => {
      expect(view.id).not.toContain(".html");
    });
  }
});
