"use client";

import {
  X,
  Sparkles,
} from "lucide-react";

import { useTryOn } from "../hooks/useTryOn";

import GarmentPreview from "./GarmentPreview";
import UploadPhoto from "./UploadPhoto";
import LoadingState from "./LoadingState";
import ResultPreview from "./ResultPreview";

import PhotoGuidelines from "@/features/profile/components/PhotoGuidelines";


export default function TryOnModal() {


  const {
    state,
    closeTryOn,
    uploadPhoto,
    removePhoto,
    generateTryOn,
  } = useTryOn();



  const {
    selectedProduct,
    userPhoto,
    result,
    isLoading,
  } = state;



  if (
    !state.isOpen ||
    !selectedProduct
  ) {
    return null;
  }



  return (

    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
        p-5
      "
    >


      <div
        className="
          bg-white
          rounded-3xl
          max-w-5xl
          w-full
          max-h-[90vh]
          overflow-y-auto
          p-6
        "
      >



        {/* Header */}

        <div
          className="
            flex
            justify-between
            items-center
            mb-6
          "
        >

          <div>

            <h2
              className="
                text-2xl
                font-bold
                text-gray-900
              "
            >
              AI Virtual Try On
            </h2>


            <p
              className="
                text-gray-500
              "
            >
              See how this outfit looks on you
            </p>

          </div>




          <button
            onClick={closeTryOn}
            className="
              w-10
              h-10
              rounded-full
              hover:bg-gray-100
              flex
              items-center
              justify-center
            "
          >

            <X size={22}/>

          </button>


        </div>





        {/* Main Content */}

        <div
          className="
            grid
            md:grid-cols-2
            gap-6
          "
        >



          {/* Garment Preview */}

          <GarmentPreview
            product={selectedProduct}
          />






          {/* Upload Photo */}

          <div>

            <UploadPhoto
              preview={
                userPhoto?.preview
              }

              onUpload={
                uploadPhoto
              }

              onRemove={
                removePhoto
              }
            />



            <PhotoGuidelines />




            {/* Generate Button */}

            <button

              disabled={
                !userPhoto ||
                isLoading
              }


              onClick={
                generateTryOn
              }


              className="
                w-full
                mt-5
                bg-indigo-600
                hover:bg-indigo-700
                disabled:bg-gray-300
                text-white
                py-3
                rounded-xl
                font-semibold
                flex
                items-center
                justify-center
                gap-2
              "

            >

              {
                isLoading ? (

                  <LoadingState />

                ) : (

                  <>

                    <Sparkles size={20}/>

                    Generate Try On

                  </>

                )
              }


            </button>


          </div>


        </div>







        {/* Result */}

        {
          result && (

            <ResultPreview
              result={result}
            />

          )
        }





      </div>


    </div>

  );

}