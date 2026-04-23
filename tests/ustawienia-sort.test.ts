import { describe, expect, it } from "vitest";
import { getCategoryKeysForTest } from "../src/ui/views/ustawienia";

describe("UstawieniaView - sortowanie kategorii", () => {
  it("sortuje banery: najpierw typ produktu, potem cena rosnąco", () => {
    const prices = {
      "banner-powlekany-1-25": 53,
      "banner-powlekany-26-50": 49,
      "banner-powlekany-51+": 45,
      "banner-blockout-1-25": 64,
      "banner-blockout-26-50": 59,
      "banner-blockout-51+": 55,
      "banner-oczkowanie": 2.5,
    };

    const keys = getCategoryKeysForTest(prices, "banner");

    expect(keys).toEqual([
      "banner-powlekany-51+",
      "banner-powlekany-26-50",
      "banner-powlekany-1-25",
      "banner-blockout-51+",
      "banner-blockout-26-50",
      "banner-blockout-1-25",
      "banner-oczkowanie",
    ]);
  });

  it("sortuje folię szronioną: najpierw typ produktu, potem cena rosnąco", () => {
    const prices = {
      "folia-szroniona-wydruk-1-5": 65,
      "folia-szroniona-wydruk-6-25": 60,
      "folia-szroniona-wydruk-26-50": 56,
      "folia-szroniona-wydruk-51+": 51,
      "folia-szroniona-oklejanie-1-5": 140,
      "folia-szroniona-oklejanie-6-10": 130,
      "folia-szroniona-oklejanie-11-20": 120,
      "folia-szroniona-owv-wydruk-1-3": 58,
      "folia-szroniona-owv-wydruk-4-9": 54,
      "folia-szroniona-owv-oklejanie-1-5": 135,
      "folia-szroniona-owv-oklejanie-6-10": 125,
    };

    const keys = getCategoryKeysForTest(prices, "folia");

    expect(keys).toEqual([
      "folia-szroniona-wydruk-51+",
      "folia-szroniona-wydruk-26-50",
      "folia-szroniona-wydruk-6-25",
      "folia-szroniona-wydruk-1-5",
      "folia-szroniona-oklejanie-11-20",
      "folia-szroniona-oklejanie-6-10",
      "folia-szroniona-oklejanie-1-5",
      "folia-szroniona-owv-wydruk-4-9",
      "folia-szroniona-owv-wydruk-1-3",
      "folia-szroniona-owv-oklejanie-6-10",
      "folia-szroniona-owv-oklejanie-1-5",
    ]);
  });
});
