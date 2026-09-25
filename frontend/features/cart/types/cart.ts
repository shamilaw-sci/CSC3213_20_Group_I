/** WBS-3.x | Owner: S/21/501 | Branch: feature/s21-501-catalogue-merchants | Scope: Catalogue, merchants, comparison and redirects. */
export interface CartItem {
  id: string | number;
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
  goToCheckout: () => void;

  addToCart: (item: Omit<CartItem, "quantity">) => void;

  removeFromCart: (id: string | number) => void;

  increaseQuantity: (id: string | number) => void;

  decreaseQuantity: (id: string | number) => void;

  clearCart: () => void;

  totalItems: number;

  totalPrice: number;
}
