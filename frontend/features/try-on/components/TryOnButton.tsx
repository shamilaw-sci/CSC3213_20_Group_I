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
        border-indigo-500
        bg-indigo-50
        text-indigo-700
        hover:bg-indigo-100
        hover:border-indigo-600
        hover:text-indigo-800
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-indigo-600
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
