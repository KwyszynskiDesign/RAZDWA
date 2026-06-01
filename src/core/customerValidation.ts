export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
}

export function validateCustomerForm(data: CustomerFormData): string | null {
  if (!data.name.trim()) return "Podaj imię i nazwisko klienta.";
  if (!data.email.trim()) return "Podaj adres e-mail klienta.";
  if (!data.phone.trim()) return "Podaj numer telefonu klienta.";
  return null;
}
