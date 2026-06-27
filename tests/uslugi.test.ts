import { describe, it, expect } from "vitest";
import { quoteUslugi } from "../src/categories/uslugi";

describe("Usługi Category", () => {
  it("should calculate single service", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "archiwizacja-cd",
          serviceName: "Nagranie płyty CD-ROM",
          price: 5.0,
        },
      ],
    });
    expect(result.servicesCount).toBe(1);
    expect(result.totalPrice).toBe(5.0);
  });

  it("should calculate multiple services", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "archiwizacja-cd",
          serviceName: "Nagranie płyty CD-ROM",
          price: 5.0,
        },
        {
          serviceId: "archiwizacja-dvd",
          serviceName: "Nagranie płyty DVD",
          price: 7.0,
        },
      ],
    });
    expect(result.servicesCount).toBe(2);
    expect(result.totalPrice).toBe(12.0);
  });

  it("should calculate graphic design services", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "grafika-baner-prosty",
          serviceName: "Przygotowanie graficzne BANERU/ROLLUP (prosty)",
          price: 160.0,
        },
        {
          serviceId: "grafika-wizytowka-jednostronna",
          serviceName: "Przygotowanie graficzne WIZYTÓWKI (jednostronna)",
          price: 120.0,
        },
      ],
    });
    expect(result.servicesCount).toBe(2);
    expect(result.totalPrice).toBe(280.0);
  });

  it("should calculate service packages", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "pakiet-prosty",
          serviceName: "PAKIET PROSTY - wizytówka+ulotka+baner",
          price: 349.0,
        },
      ],
    });
    expect(result.servicesCount).toBe(1);
    expect(result.totalPrice).toBe(349.0);
  });

  it("should calculate multiple same services with quantities", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "scalanie-1-9",
          serviceName: "Scalanie/Nazwanie plików (1-9 plików)",
          price: 7.0,
          quantity: 3,
        },
      ],
    });
    expect(result.servicesCount).toBe(1);
    expect(result.totalPrice).toBe(21.0); // 7 * 3
  });

  it("should calculate premium graphic design package", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "pakiet-zlozony",
          serviceName: "PAKIET ZŁOŻONY - wizytówka+ulotka+baner",
          price: 449.0,
        },
        {
          serviceId: "grafika-logotyp",
          serviceName: "Przygotowanie graficzne LOGOTYPU (podstawowy)",
          price: 550.0,
        },
      ],
    });
    expect(result.servicesCount).toBe(2);
    expect(result.totalPrice).toBe(999.0);
  });

  it("should calculate social media graphics", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "social-media-1-projekt",
          serviceName: "Projekt grafik na SOCIAL MEDIA (1 projekt)",
          price: 80.0,
        },
        {
          serviceId: "social-media-3-projekty",
          serviceName: "Projekt grafik na SOCIAL MEDIA (3 projekty)",
          price: 190.0,
        },
      ],
    });
    expect(result.servicesCount).toBe(2);
    expect(result.totalPrice).toBe(270.0);
  });

  it("should calculate mixed services", () => {
    const result = quoteUslugi({
      selectedServices: [
        {
          serviceId: "formatowanie",
          serviceName: "Formatowanie",
          price: 30.0, // Average price
        },
        {
          serviceId: "archiwizacja-cd",
          serviceName: "Nagranie płyty CD-ROM",
          price: 5.0,
        },
        {
          serviceId: "archiwizacja-dvd",
          serviceName: "Nagranie płyty DVD",
          price: 7.0,
        },
        {
          serviceId: "poprawki-graficzne",
          serviceName: "Poprawki graficzne pliku klienta",
          price: 65.0,
        },
      ],
    });
    expect(result.servicesCount).toBe(4);
    expect(result.totalPrice).toBe(107.0);
  });
});
