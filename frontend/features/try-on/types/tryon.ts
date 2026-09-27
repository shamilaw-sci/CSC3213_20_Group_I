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



export interface UserPhoto {
  file: File;
  preview: string;
}



export interface TryOnResult {
  image: string;
  createdAt: string;
}



export interface TryOnState {

  isOpen: boolean;

  isLoading: boolean;


  selectedProduct: TryOnProduct | null;


  userPhoto: UserPhoto | null;


  result: TryOnResult | null;

}




export interface TryOnContextType {

  state: TryOnState;



  openTryOn: (
    product: TryOnProduct
  ) => void;



  closeTryOn: () => void;



  uploadPhoto: (
    file: File
  ) => void;



  removePhoto: () => void;



  generateTryOn: () => Promise<void>;



  clearResult: () => void;

}
