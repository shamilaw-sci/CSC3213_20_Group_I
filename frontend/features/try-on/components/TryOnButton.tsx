"use client";

import { Sparkles } from "lucide-react";

import { useTryOn } from "../hooks/useTryOn";
import { TryOnProduct } from "../types/tryon";


interface TryOnButtonProps {
  product: TryOnProduct;
}


export default function TryOnButton({
  product,
}: TryOnButtonProps) {


  const {
    openTryOn,
  } = useTryOn();



  return (

    <button

      onClick={() => openTryOn(product)}

      className="
        w-full
        mt-3
        border
        border-gray-300
        hover:bg-indigo-50
        hover:border-indigo-500
        text-gray-700
        hover:text-indigo-600
        font-semibold
        py-3
        rounded-xl
        transition
        flex
        items-center
        justify-center
        gap-2
      "

    >

      <Sparkles size={18}/>

      Try On


    </button>

  );
}
