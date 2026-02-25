import { CartItem, CustomerData } from "../core/types";

declare const XLSX: any;

export function downloadExcel(cartItems: CartItem[], customer: CustomerData) {
  if (typeof XLSX === 'undefined') {
    alert("Błąd: Biblioteka Excel nie została wczytana.");
    return;
  }

  const data = cartItems.map(item => ({
    "Kategoria": item.category,
    "Nazwa": item.name,
    "Ilość": item.quantity,
    "Jednostka": item.unit,
    "Cena jedn.": item.unitPrice,
    "Express (+20%)": item.isExpress ? "TAK" : "NIE",
    "Cena całkowita": item.totalPrice,
    "Klient": customer.name,
    "Telefon": customer.phone,
    "Email": customer.email,
    "Priorytet": customer.priority
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Zamówienie");

  // Generate filename with date
  const date = new Date().toISOString().slice(0, 10);
  const filename = `Zamowienie_${customer.name.replace(/\s+/g, '_')}_${date}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
