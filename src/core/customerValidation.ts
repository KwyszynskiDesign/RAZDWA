export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
}

export function validateCustomerForm(data: CustomerFormData): string | null {
  if (!data.name.trim()) return "Podaj imię i nazwisko klienta.";
  if (data.name.trim().length < 2) return "Imię i nazwisko musi mieć min. 2 znaki.";
  if (!data.email.trim()) return "Podaj adres e-mail klienta.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return "Nieprawidłowy format e-mail.";
  const phoneDigits = data.phone.replace(/\D/g, '');
  if (!phoneDigits) return "Podaj numer telefonu klienta.";
  if (phoneDigits.length < 9) return "Numer telefonu musi mieć min. 9 cyfr.";
  return null;
}
