export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  nip?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizePhoneDigits(phone: string): string {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length > 9 && digits.startsWith("48")) {
    return digits.slice(2);
  }
  return digits;
}

export function validateNIPDigits(digits: string): string | null {
  if (digits.length !== 10) return "NIP musi zawierać 10 cyfr";
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * parseInt(digits[i], 10), 0);
  const check = sum % 11;
  if (check === 10 || check !== parseInt(digits[9], 10))
    return "Nieprawidłowy NIP (błędna suma kontrolna)";
  return null;
}

export function isValidNIP(nip: string): boolean {
  const cleanNip = String(nip ?? "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(cleanNip)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(cleanNip[i]), 0);
  const checkDigit = sum % 11;
  if (checkDigit === 10) return false;
  return checkDigit === Number(cleanNip[9]);
}

export function isValidPhone(phone: string): boolean {
  return normalizePhoneDigits(phone).length === 9;
}

export function validateCustomerForm(data: CustomerFormData): string | null {
  if (!data.name.trim()) return "Podaj imię i nazwisko klienta.";
  if (data.name.trim().length < 2) return "Imię i nazwisko musi mieć min. 2 znaki.";
  if (!data.email.trim()) return "Podaj adres e-mail klienta.";
  if (!isValidEmail(data.email.trim())) return "Nieprawidłowy format e-mail.";
  if (!data.phone.trim()) return "Podaj numer telefonu klienta.";
  if (!isValidPhone(data.phone))
    return "Numer telefonu musi mieć 9 cyfr (krajowy, opcjonalnie z prefiksem +48).";
  if (data.nip) {
    const nipDigits = data.nip.replace(/\D/g, "");
    if (nipDigits.length !== 10) return "NIP musi zawierać 10 cyfr";
  }
  return null;
}
