export interface TryOnProduct {
  id: string | number;
  title: string;
  image: string;
  category: string;
  store: string;
  price: number;
  currency?: string;
  availableSizes?: string[];
}

export interface TryOnResult {
  image: string;
  createdAt: string;
}

export interface TryOnState {
  isOpen: boolean;
  selectedProduct: TryOnProduct | null;
  selectedSize?: string | null;
  resumeAfterTwin?: boolean;
}

export interface TryOnContextType {
  state: TryOnState;
  openTryOn: (product: TryOnProduct) => void;
  selectProduct: (product: TryOnProduct) => void;
  setSelectedSize: (size: string) => void;
  goToTwinSetup: () => void;
  closeTryOn: () => void;
}
