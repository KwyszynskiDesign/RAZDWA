export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  nip?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidNIP(nip: string): boolean {
  const cleanNip = nip.replace(/-/g, '');
  return /^\d{10}$/.test(cleanNip);
}

function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 9;
}

export function validateCustomerForm(data: CustomerFormData): string | null {
  if (!data.name.trim()) return "Podaj imię i nazwisko klienta.";
  if (data.name.trim().length < 2) return "Imię i nazwisko musi mieć min. 2 znaki.";
  if (!data.email.trim()) return "Podaj adres e-mail klienta.";
  if (!isValidEmail(data.email.trim())) return "Nieprawidłowy format e-mail.";
  if (!data.phone.trim()) return "Podaj numer telefonu klienta.";
  if (!isValidPhone(data.phone)) return "Numer telefonu musi mieć min. 9 cyfr.";
  if (data.nip && !isValidNIP(data.nip)) return "NIP musi zawierać dokładnie 10 cyfr.";
  return null;
}
