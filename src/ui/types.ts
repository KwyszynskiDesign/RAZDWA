import { CartItem } from "../core/types";

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
