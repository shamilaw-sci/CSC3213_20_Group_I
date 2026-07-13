"use client";

import { useRef } from "react";

export default function DigitalTwin() {

  const fileInputRef = useRef(null);


  const handleChoosePhoto = () => {
    fileInputRef.current.click();
  };


  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      console.log("Selected file:", file);
    }
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


        {/* Upload Box */}
        <div>

          <h3 className="text-lg font-semibold text-black mb-3">
            Profile Photo
          </h3>


          <p className="text-gray-500 text-sm mb-4">
            For best results, use a well-lit full-body photo
          </p>


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
            hover:border-violet-600
            transition
            "
          >

            <p className="text-gray-500 mb-4">
              📷
            </p>


            <p className="text-gray-600">
              Click to upload or drag and drop
            </p>


            <p className="text-sm text-gray-400 mt-2">
              PNG, JPG or JPEG (MAX. 10MB)
            </p>


            {/* Hidden file input */}
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />


            <button
              onClick={handleChoosePhoto}
              className="
              mt-5
              bg-violet-600
              text-white
              px-5
              py-2
              rounded-lg
              hover:bg-violet-700
              "
            >
              Choose Photo
            </button>


          </div>

        </div>



        {/* Guidelines */}
        <div className="bg-gray-50 rounded-xl p-6">

          <h3 className="text-lg font-semibold text-black mb-4">
            Photo Guidelines
          </h3>


          <ul className="space-y-4">

            <li className="flex gap-3 text-gray-700">
              <span className="text-green-600 font-bold">✓</span>
              Stand straight facing the camera
            </li>


            <li className="flex gap-3 text-gray-700">
              <span className="text-green-600 font-bold">✓</span>
              Wear fitted clothing
            </li>


            <li className="flex gap-3 text-gray-700">
              <span className="text-green-600 font-bold">✓</span>
              Use good, even lighting
            </li>


            <li className="flex gap-3 text-gray-700">
              <span className="text-green-600 font-bold">✓</span>
              Plain background works best
            </li>


          </ul>

        </div>


      </div>


      <button
        className="
        mt-8
        bg-violet-600
        text-white
        px-8
        py-3
        rounded-lg
        hover:bg-violet-700
        "
      >
        Save Photo
      </button>


    </div>
  );
}