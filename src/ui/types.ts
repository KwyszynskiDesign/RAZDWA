export interface CartItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ViewContext {
  addToCart: (item: CartItem) => void;
  updateLastCalculated: (price: number) => void;
}

export interface View {
  mount(el: HTMLElement, ctx: ViewContext): void;
}
