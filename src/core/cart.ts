export interface CartItem { id: string; categoryId: string; categoryName: string; details: any; price: number; }
export class Cart {
  private items: CartItem[] = [];
  constructor() { this.load(); }
  private load() { if (typeof localStorage !== 'undefined') { const saved = localStorage.getItem("razdwa_cart"); if (saved) { try { this.items = JSON.parse(saved); } catch (e) { this.items = []; } } } }
  private save() { if (typeof localStorage !== 'undefined') { localStorage.setItem("razdwa_cart", JSON.stringify(this.items)); } }
  addItem(item: Omit<CartItem, "id">) { const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) }; this.items.push(newItem); this.save(); return newItem; }
  removeItem(id: string) { this.items = this.items.filter(i => i.id !== id); this.save(); }
  getItems() { return [...this.items]; }
  getTotal() { return this.items.reduce((sum, item) => sum + item.price, 0); }
  clear() { this.items = []; this.save(); }
}
export const cartApi = new Cart();
