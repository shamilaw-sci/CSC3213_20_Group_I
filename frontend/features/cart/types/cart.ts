export interface CartItem {
  id: number;
  title: string;
  store: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartContextType {
  cart: CartState;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addToCart: (item: Omit<CartItem, "quantity">) => void;

  removeFromCart: (id: number) => void;

  increaseQuantity: (id: number) => void;

  decreaseQuantity: (id: number) => void;

  clearCart: () => void;

  totalItems: number;

  totalPrice: number;
}