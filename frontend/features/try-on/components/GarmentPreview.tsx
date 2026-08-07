"use client";


import { TryOnProduct } from "../types/tryon";


interface Props {
  product: TryOnProduct;
}


export default function GarmentPreview({
  product,
}: Props) {


  return (

    <div>


      <h3 className="font-semibold mb-3">
        Selected Outfit
      </h3>



      <div
        className="
          aspect-[4/5]
          bg-gray-100
          rounded-2xl
          overflow-hidden
        "
      >

        <img
          src={product.image}
          alt={product.title}
          className="
            w-full
            h-full
            object-cover
          "
        />

      </div>



      <h4
        className="
          mt-3
          font-semibold
        "
      >
        {product.title}
      </h4>



      <p
        className="
          text-indigo-600
          font-bold
        "
      >
        ${product.price}
      </p>


    </div>

  );
}