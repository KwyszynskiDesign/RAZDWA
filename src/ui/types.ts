export interface CartItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  payload: any;
}

export interface ViewContext {
  cart: {
    addItem: (item: CartItem) => void;
  };
  expressMode: boolean;
  updateLastCalculated: (price: number, hint?: string) => void;
}

export interface View {
  id: string;
  name: string;
  mount: (container: HTMLElement, ctx: ViewContext) => void;
  unmount?: () => void;
}
