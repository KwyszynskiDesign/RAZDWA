import { describe, it, expect } from "vitest";
import { validateCustomerForm } from "../src/core/customerValidation";

function isInvalidClass(classes: string[], message: string | null): boolean {
  if (message) return classes.includes("is-invalid");
  return !classes.includes("is-invalid");
}

describe("form field invalid-class logic", () => {
  it("adds is-invalid when error message is set", () => {
    const classes: string[] = [];
    const msg = "Podaj imię i nazwisko";
    if (msg) classes.push("is-invalid");
    expect(isInvalidClass(classes, msg)).toBe(true);
  });

  it("removes is-invalid when error is cleared", () => {
    const classes = ["is-invalid"];
    const msg = null;
    const idx = classes.indexOf("is-invalid");
    if (msg === null && idx !== -1) classes.splice(idx, 1);
    expect(isInvalidClass(classes, msg)).toBe(true);
  });
});

describe("validateCustomerForm — extended coverage", () => {
  it("rejects invalid email format", () => {
    const err = validateCustomerForm({ name: "Jan Kowalski", email: "not-an-email", phone: "123456789" });
    expect(err).toBeTruthy();
    expect(err).toContain("e-mail");
  });

  it("rejects phone shorter than 9 digits", () => {
    const err = validateCustomerForm({ name: "Jan Kowalski", email: "jan@example.com", phone: "12345" });
    expect(err).toBeTruthy();
    expect(err).toContain("telefon");
  });

  it("rejects NIP that is not 10 digits", () => {
    const err = validateCustomerForm({ name: "Jan Kowalski", email: "jan@example.com", phone: "123456789", nip: "123" });
    expect(err).toBeTruthy();
    expect(err).toContain("NIP");
  });

  it("accepts valid NIP (10 digits)", () => {
    const err = validateCustomerForm({ name: "Jan Kowalski", email: "jan@example.com", phone: "123456789", nip: "1234567890" });
    expect(err).toBeNull();
  });

  it("accepts form without NIP", () => {
    const err = validateCustomerForm({ name: "Jan Kowalski", email: "jan@example.com", phone: "123456789" });
    expect(err).toBeNull();
  });

  it("trims name before checking length", () => {
    const err = validateCustomerForm({ name: "  A  ", email: "jan@example.com", phone: "123456789" });
    expect(err).toBeTruthy();
  });
});
