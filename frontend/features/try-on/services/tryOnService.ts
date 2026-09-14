import {
  TryOnProduct,
} from "../types/tryon";



interface GenerateTryOnParams {

  product: TryOnProduct;

  userImage: File;

}





interface TryOnResponse {

  image: string;

  createdAt: string;

}





export async function generateTryOnImage(
  {
    product,
    userImage,
  }: GenerateTryOnParams

): Promise<TryOnResponse> {



  /*
    Future AI API Integration

    Example:

    const formData = new FormData();

    formData.append(
      "product",
      JSON.stringify(product)
    );

    formData.append(
      "image",
      userImage
    );


    const response = await fetch(
      "/api/try-on",
      {
        method:"POST",
        body:formData
      }
    );


    return response.json();

  */





  // Temporary AI Simulation


  return new Promise(
    (resolve) => {


      setTimeout(
        () => {


          resolve({

            // temporary demo image
            image:
              URL.createObjectURL(
                userImage
              ),


            createdAt:
              new Date()
              .toISOString(),

          });


        },
        3000
      );


    }
  );

}
