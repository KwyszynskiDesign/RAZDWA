import { CartItem } from "../core/types";

export interface ViewContext {
  cart: {
    addItem: (item: CartItem) => void;
  };
  addToBasket: (item: { category: string; price: number; description: string }) => void;
  expressMode: boolean;
  updateLastCalculated: (price: number, hint?: string) => void;
  on?: (event: string, callback: (data?: any) => void) => void;
  emit?: (event: string, data?: any) => void;
}

export interface View {
  id: string;
  name: string;
  mount: (container: HTMLElement, ctx: ViewContext) => void | Promise<void>;
  initLogic?: (container: HTMLElement, ctx: ViewContext) => void;
  unmount?: () => void;
}
