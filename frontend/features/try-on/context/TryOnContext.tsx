"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import {
  TryOnContextType,
  TryOnState,
  TryOnProduct,
} from "../types/tryon";

import {
  generateTryOnImage,
} from "../services/tryOnService";



// Export Context

export const TryOnContext =
  createContext<TryOnContextType | undefined>(
    undefined
  );



interface ProviderProps {
  children: ReactNode;
}





export function TryOnProvider({
  children,
}: ProviderProps) {



  const [state, setState] =
    useState<TryOnState>({

      isOpen: false,

      isLoading: false,

      selectedProduct: null,

      userPhoto: null,

      result: null,

    });







  // -----------------------------
  // Open Try On Modal
  // -----------------------------

  const openTryOn = (
    product: TryOnProduct
  ) => {


    setState({

      isOpen: true,

      isLoading: false,

      selectedProduct: product,

      userPhoto: null,

      result: null,

    });


  };









  // -----------------------------
  // Close Try On Modal
  // -----------------------------

  const closeTryOn = () => {


    setState((prev)=>({

      ...prev,

      isOpen:false,

    }));


  };









  // -----------------------------
  // Upload User Photo
  // -----------------------------

  const uploadPhoto = (
    file: File
  ) => {


    const preview =
      URL.createObjectURL(file);



    setState((prev)=>({

      ...prev,


      userPhoto:{

        file,

        preview,

      },


    }));


  };









  // -----------------------------
  // Remove User Photo
  // -----------------------------

  const removePhoto = () => {


    setState((prev)=>({

      ...prev,

      userPhoto:null,

    }));


  };









  // -----------------------------
  // Generate AI Try On
  // -----------------------------

  const generateTryOn =
    async () => {


      if(
        !state.userPhoto ||
        !state.selectedProduct
      ){

        return;

      }





      try {


        setState((prev)=>({

          ...prev,

          isLoading:true,

        }));






        const response =
          await generateTryOnImage({

            product:
              state.selectedProduct,


            userImage:
              state.userPhoto.file,


          });







        setState((prev)=>({

          ...prev,


          isLoading:false,



          result:{

            image:
              response.image,


            createdAt:
              response.createdAt,


          },


        }));





      } catch(error){



        console.error(
          "Try On Generation Failed:",
          error
        );



        setState((prev)=>({

          ...prev,

          isLoading:false,

        }));


      }



    };









  // -----------------------------
  // Clear Result
  // -----------------------------

  const clearResult = () => {


    setState((prev)=>({

      ...prev,

      result:null,

    }));


  };









  return (

    <TryOnContext.Provider

      value={{

        state,


        openTryOn,


        closeTryOn,


        uploadPhoto,


        removePhoto,


        generateTryOn,


        clearResult,


      }}

    >

      {children}


    </TryOnContext.Provider>

  );

}









// Custom Hook

export function useTryOnContext(){


  const context =
    useContext(TryOnContext);




  if(!context){


    throw new Error(
      "useTryOnContext must be used inside TryOnProvider"
    );


  }




  return context;


}