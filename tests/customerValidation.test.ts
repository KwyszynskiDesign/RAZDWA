import { describe, it, expect } from "vitest";
import { validateCustomerForm } from "../src/core/customerValidation";

describe("validateCustomerForm", () => {
  it("returns null when all required fields are present", () => {
    expect(validateCustomerForm({ name: "Jan Kowalski", email: "jan@example.com", phone: "123456789" })).toBeNull();
  });

  it("returns error when name is empty", () => {
    const err = validateCustomerForm({ name: "", email: "jan@example.com", phone: "123456789" });
    expect(err).toBeTruthy();
    expect(err).toContain("imię");
  });

  it("returns error when name is only whitespace", () => {
    const err = validateCustomerForm({ name: "   ", email: "jan@example.com", phone: "123456789" });
    expect(err).toBeTruthy();
  });

  it("returns error when email is empty", () => {
    const err = validateCustomerForm({ name: "Jan Kowalski", email: "", phone: "123456789" });
    expect(err).toBeTruthy();
    expect(err).toContain("e-mail");
  });

  it("returns error when phone is empty", () => {
    const err = validateCustomerForm({ name: "Jan Kowalski", email: "jan@example.com", phone: "" });
    expect(err).toBeTruthy();
    expect(err).toContain("telefon");
  });

  it("returns error for name when name is missing first (priority order)", () => {
    const err = validateCustomerForm({ name: "", email: "", phone: "" });
    expect(err).toContain("imię");
  });

  it("accepts any non-empty value (format is not validated)", () => {
    expect(validateCustomerForm({ name: "Jan Kowalski", email: "jan@example.com", phone: "123" })).toBeNull();
    expect(validateCustomerForm({ name: "Jan Kowalski", email: "x@x", phone: "0" })).toBeNull();
  });
});
