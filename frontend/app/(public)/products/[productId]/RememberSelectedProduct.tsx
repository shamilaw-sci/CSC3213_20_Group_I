"use client";

import { useEffect } from "react";

import { saveSelectedProduct } from "@/features/catalogue/utils/selectedProductRestore";

export default function RememberSelectedProduct({ productId }: { productId: string }) {
  useEffect(() => {
    saveSelectedProduct(productId);
  }, [productId]);

  return null;
}
