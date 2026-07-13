"use client";

import { useRef, useState } from "react";


export default function DigitalTwin() {


  const fileInputRef = useRef(null);


  const [photo, setPhoto] = useState(null);
  const [twinCreated, setTwinCreated] = useState(false);



  const handleChoosePhoto = () => {

    fileInputRef.current.click();

  };



  const handleFileChange = (event) => {

    const file = event.target.files[0];


    if(file){

      const imageURL = URL.createObjectURL(file);

      setPhoto(imageURL);

      setTwinCreated(false);

    }

  };



  const generateTwin = () => {

    setTwinCreated(true);

  };



  return (

    <div>


      <h2 className="text-2xl font-bold text-black mb-2">
        Your Digital Twin
      </h2>


      <p className="text-gray-600 mb-6">
        Upload a full-body photo for the most accurate virtual try-on results.
        We recommend wearing fitted clothing in good lighting.
      </p>



      <div className="grid md:grid-cols-2 gap-8">



        {/* Upload Section */}

        <div>


          <h3 className="text-lg font-semibold text-black mb-3">
            Profile Photo
          </h3>


          <div
          className="
          border-2
          border-dashed
          border-gray-400
          rounded-xl
          h-72
          flex
          flex-col
          items-center
          justify-center
          "
          >


          {
            photo ? (

              <img
              src={photo}
              alt="Uploaded"
              className="
              h-56
              rounded-lg
              object-cover
              "
              />

            )

            :

            (

              <>

              <p className="text-4xl">
                📷
              </p>


              <p className="text-gray-600 mt-3">
                No photo uploaded
              </p>

              </>

            )
          }




          <input
          type="file"
          accept="image/png,image/jpeg"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          />



          <button
          onClick={handleChoosePhoto}
          className="
          mt-4
          bg-violet-600
          text-white
          px-5
          py-2
          rounded-lg
          "
          >

          Choose Photo

          </button>



          </div>




          {
            photo &&

            <button
            onClick={generateTwin}
            className="
            mt-5
            bg-black
            text-white
            px-6
            py-3
            rounded-lg
            "
            >

            Generate Digital Twin

            </button>

          }


        </div>






        {/* Twin Preview */}

        <div className="bg-gray-50 rounded-xl p-6">


          <h3 className="text-lg font-semibold mb-4">
            Interactive Twin Model
          </h3>



          {
            twinCreated ?


            (

            <div
            className="
            h-72
            bg-gray-200
            rounded-xl
            flex
            items-center
            justify-center
            "
            >

            <div className="text-center">

            <p className="text-6xl">
              👤
            </p>

            <p className="mt-3 font-semibold">
              3D Avatar Created
            </p>


            </div>


            </div>

            )


            :

            (

            <div
            className="
            h-72
            bg-gray-200
            rounded-xl
            flex
            items-center
            justify-center
            "
            >

            <p className="text-gray-500">
              Avatar Preview
            </p>


            </div>

            )

          }



        </div>


      </div>




      {/* Guidelines */}

      <div className="bg-gray-50 rounded-xl p-6 mt-8">


      <h3 className="text-lg font-semibold mb-4">
        Photo Guidelines
      </h3>


      <ul className="space-y-3">

      <li>
      ✓ Stand straight facing camera
      </li>


      <li>
      ✓ Wear fitted clothing
      </li>


      <li>
      ✓ Use good lighting
      </li>


      <li>
      ✓ Plain background
      </li>


      </ul>


      </div>



    </div>

  );

}